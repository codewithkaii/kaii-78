import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PADDLE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan } = await req.json();
    logStep("Received plan", { plan });

    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) throw new Error("PADDLE_API_KEY not configured");

    // Define pricing for each plan (Paddle price IDs)
    const planPricing: Record<string, { priceId: string; name: string }> = {
      starter: { priceId: "pri_starter_monthly", name: "Starter Plan" },
      pro: { priceId: "pri_pro_monthly", name: "Pro Plan" },
      business: { priceId: "pri_business_monthly", name: "Business Pro Plan" }
    };

    const selectedPlan = planPricing[plan];
    if (!selectedPlan) {
      throw new Error("Invalid plan selected");
    }

    // Create Paddle checkout session
    const paddleResponse = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price_id: selectedPlan.priceId,
            quantity: 1,
          },
        ],
        customer: {
          email: user.email,
        },
        custom_data: {
          user_id: user.id,
        },
        checkout: {
          url: `${req.headers.get("origin")}/subscription-success`,
        },
        return_url: `${req.headers.get("origin")}/pricing`,
      }),
    });

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text();
      logStep("Paddle API error", { status: paddleResponse.status, error: errorText });
      throw new Error(`Paddle API error: ${errorText}`);
    }

    const paddleData = await paddleResponse.json();
    logStep("Paddle checkout created", { transactionId: paddleData.data.id });

    return new Response(JSON.stringify({ url: paddleData.data.checkout.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paddle-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});