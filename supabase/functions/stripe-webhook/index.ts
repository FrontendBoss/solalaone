import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
});

const TIER_CREDITS = {
  basic: 120,
  professional: 250,
  premier: 1000,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const type = session.metadata?.type;

        if (!userId) {
          throw new Error("No user_id in session metadata");
        }

        if (type === "topup") {
          const credits = parseInt(session.metadata?.credits || "0");
          console.log(`Adding ${credits} purchased credits to user ${userId}`);

          const { error } = await supabase.rpc("add_purchased_credits", {
            target_user_id: userId,
            credits_to_add: credits,
          });

          if (error) {
            console.error("Error adding credits:", error);
            throw error;
          }

          console.log(`Successfully added ${credits} credits to user ${userId}`);
        } else if (type === "subscription") {
          const tier = session.metadata?.tier as keyof typeof TIER_CREDITS;
          const credits = TIER_CREDITS[tier] || 0;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          console.log(`Setting up subscription for user ${userId}: ${tier} (${credits} credits)`);

          const { error } = await supabase.rpc("update_subscription_info", {
            target_user_id: userId,
            tier: tier,
            customer_id: customerId,
            subscription_id: subscriptionId,
            initial_credits: credits,
          });

          if (error) {
            console.error("Error updating subscription:", error);
            throw error;
          }

          console.log(`Successfully set up ${tier} subscription for user ${userId}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log("Invoice paid but no subscription (likely one-time payment)");
          break;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, subscription_tier")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (profileError || !profile) {
          console.error("Could not find profile for subscription:", subscriptionId);
          throw new Error("Profile not found");
        }

        const tier = profile.subscription_tier as keyof typeof TIER_CREDITS;
        const credits = TIER_CREDITS[tier] || 0;

        console.log(`Resetting monthly allowance for user ${profile.id}: ${credits} credits`);

        const { error } = await supabase.rpc("reset_monthly_allowance", {
          target_user_id: profile.id,
          new_allowance: credits,
        });

        if (error) {
          console.error("Error resetting monthly allowance:", error);
          throw error;
        }

        console.log(`Successfully reset monthly allowance for user ${profile.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        console.log(`Subscription cancelled: ${subscriptionId}`);

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: null,
            stripe_subscription_id: null,
            monthly_allowance: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("Error cancelling subscription:", error);
          throw error;
        }

        console.log(`Successfully cancelled subscription for ${subscriptionId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
