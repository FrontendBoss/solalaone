import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SolarApiRequest {
  address: string;
  apiKey: string;
  fetchDataLayers?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    console.log(`API Gateway request from user: ${user.id}`);

    const { data: creditDeducted, error: creditError } = await supabase.rpc(
      "deduct_credit",
      { target_user_id: user.id },
    );

    if (creditError) {
      console.error("Error checking credits:", creditError);
      return new Response(
        JSON.stringify({ error: "Error checking credits" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (!creditDeducted) {
      console.log(`User ${user.id} has insufficient credits`);
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          message: "You don't have enough credits to perform this action. Please purchase more credits or upgrade your subscription.",
          code: "INSUFFICIENT_CREDITS",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 402,
        },
      );
    }

    console.log(`Credit deducted successfully for user ${user.id}`);

    const body: SolarApiRequest = await req.json();
    const { address, apiKey, fetchDataLayers, coordinates } = body;

    if (!address || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing address or apiKey" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log(`Fetching solar data for address: ${address}, includeDataLayers: ${fetchDataLayers}`);

    // Fetch building insights
    const buildingInsightsUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=0&location.longitude=0&key=${apiKey}&address=${encodeURIComponent(address)}`;

    const buildingResponse = await fetch(buildingInsightsUrl);

    if (!buildingResponse.ok) {
      const errorText = await buildingResponse.text();
      console.error("Solar API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Solar API request failed",
          details: errorText,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: buildingResponse.status,
        },
      );
    }

    const buildingData = await buildingResponse.json();

    let dataLayers = null;

    // Optionally fetch data layers if requested
    if (fetchDataLayers && coordinates) {
      console.log(`Fetching data layers for coordinates: ${coordinates.lat}, ${coordinates.lng}`);

      const params = new URLSearchParams({
        'location.latitude': coordinates.lat.toString(),
        'location.longitude': coordinates.lng.toString(),
        'radiusMeters': '100',
        'view': 'FULL_LAYERS',
        'requiredQuality': 'LOW',
        'key': apiKey
      });

      const dataLayersUrl = `https://solar.googleapis.com/v1/dataLayers:get?${params.toString()}`;

      try {
        const dataLayersResponse = await fetch(dataLayersUrl);

        if (dataLayersResponse.ok) {
          dataLayers = await dataLayersResponse.json();
          console.log(`Successfully fetched data layers for user ${user.id}`);
        } else {
          console.warn(`Data layers fetch failed: ${dataLayersResponse.status}`);
        }
      } catch (error) {
        console.warn(`Error fetching data layers:`, error);
      }
    }

    console.log(`Successfully fetched solar data for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        buildingInsights: buildingData,
        dataLayers: dataLayers,
        creditsRemaining: await getCreditsRemaining(supabase, user.id),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Gateway error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

async function getCreditsRemaining(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("monthly_allowance, purchased_credits")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { monthly: 0, purchased: 0, total: 0 };
  }

  return {
    monthly: data.monthly_allowance,
    purchased: data.purchased_credits,
    total: data.monthly_allowance + data.purchased_credits,
  };
}
