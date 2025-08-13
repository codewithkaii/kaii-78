import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-INCOMING-CALL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Incoming call received");

    const formData = await req.formData();
    const from = formData.get("From");
    const to = formData.get("To");
    const callSid = formData.get("CallSid");

    logStep("Call details", { from, to, callSid });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find the user who owns this phone number
    const { data: phoneNumber } = await supabaseClient
      .from("user_phone_numbers")
      .select("user_id")
      .eq("phone_number", to)
      .single();

    if (!phoneNumber) {
      logStep("No user found for phone number", { to });
      return new Response("Phone number not found", { status: 404 });
    }

    // Get user's voice settings
    const { data: voiceSettings } = await supabaseClient
      .from("voice_settings")
      .select("*")
      .eq("user_id", phoneNumber.user_id)
      .single();

    // Create call log entry
    await supabaseClient
      .from("call_logs")
      .insert({
        user_id: phoneNumber.user_id,
        phone_number: to as string,
        caller_number: from as string,
        call_direction: "inbound",
        call_status: "in-progress"
      });

    // Generate TwiML response with AI voice
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceSettings?.voice_name || 'Polly.Joanna'}">${voiceSettings?.personality_prompt || 'Hello! Thank you for calling. How can I help you today?'}</Say>
  <Record 
    action="https://dtrbgkumidfblerqegsd.supabase.co/functions/v1/process-recording"
    method="POST"
    transcribe="true"
    transcribeCallback="https://dtrbgkumidfblerqegsd.supabase.co/functions/v1/process-transcription"
    timeout="10"
    finishOnKey="#"
    maxLength="300"
  />
  <Say>Thank you for your message. We'll get back to you soon.</Say>
</Response>`;

    logStep("Generated TwiML response");

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, but we're experiencing technical difficulties. Please try again later.</Say>
</Response>`;

    return new Response(errorTwiml, {
      headers: { ...corsHeaders, "Content-Type": "text/xml" },
      status: 200,
    });
  }
});