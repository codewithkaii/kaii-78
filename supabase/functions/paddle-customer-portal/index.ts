import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PADDLE-CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) throw new Error("PADDLE_API_KEY is not set");
    logStep("Paddle API key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get customer from Paddle by email
    const customersResponse = await fetch(`https://api.paddle.com/customers?email=${encodeURIComponent(user.email)}`, {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!customersResponse.ok) {
      throw new Error("Failed to fetch customer from Paddle");
    }

    const customersData = await customersResponse.json();
    
    if (!customersData.data || customersData.data.length === 0) {
      throw new Error("No Paddle customer found for this user");
    }

    const customerId = customersData.data[0].id;
    logStep("Found Paddle customer", { customerId });

    // For Paddle, customer portal URL is typically handled through their dashboard
    // or you can redirect to a custom portal page
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalUrl = `${origin}/billing-portal?customer_id=${customerId}`;
    
    logStep("Customer portal URL created", { url: portalUrl });

    return new Response(JSON.stringify({ url: portalUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paddle-customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});