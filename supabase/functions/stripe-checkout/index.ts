import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
});

interface CheckoutRequest {
  type: "subscription" | "topup";
  tier?: "basic" | "professional" | "premier";
  credits?: number;
  amount?: number;
}

const SUBSCRIPTION_PRICES = {
  basic: { amount: 4900, credits: 120, name: "Basic Plan" },
  professional: { amount: 9900, credits: 250, name: "Professional Plan" },
  premier: { amount: 34900, credits: 1000, name: "Premier Plan" },
};

const TOPUP_PRICES = {
  15: 1000,
  30: 2000,
  70: 5000,
  150: 10000,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body: CheckoutRequest = await req.json();
    const origin = req.headers.get("origin") || Deno.env.get("APP_URL") || "http://localhost:5173";

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (body.type === "subscription") {
      if (!body.tier || !SUBSCRIPTION_PRICES[body.tier]) {
        throw new Error("Invalid subscription tier");
      }

      const plan = SUBSCRIPTION_PRICES[body.tier];

      sessionParams = {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                description: `${plan.credits} credits per month`,
              },
              unit_amount: plan.amount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          user_id: user.id,
          type: "subscription",
          tier: body.tier,
          credits: plan.credits.toString(),
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            tier: body.tier,
            credits: plan.credits.toString(),
          },
        },
      };
    } else if (body.type === "topup") {
      if (!body.credits || !TOPUP_PRICES[body.credits as keyof typeof TOPUP_PRICES]) {
        throw new Error("Invalid credit amount");
      }

      const amount = TOPUP_PRICES[body.credits as keyof typeof TOPUP_PRICES];

      sessionParams = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${body.credits} Credits Top-Up`,
                description: "One-time credit purchase",
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          user_id: user.id,
          type: "topup",
          credits: body.credits.toString(),
        },
      };
    } else {
      throw new Error("Invalid checkout type");
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
