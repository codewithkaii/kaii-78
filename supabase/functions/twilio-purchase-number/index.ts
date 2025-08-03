import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TWILIO-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Twilio number purchase started");

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured');
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { areaCode = '415' } = await req.json();

    // Search for available numbers
    const searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/US/Local.json?AreaCode=${areaCode}&Limit=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search for available numbers');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.available_phone_numbers || searchData.available_phone_numbers.length === 0) {
      throw new Error('No available numbers found');
    }

    const selectedNumber = searchData.available_phone_numbers[0];
    logStep("Found available number", { number: selectedNumber.phone_number });

    // Purchase the number
    const purchaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`;
    
    const formData = new URLSearchParams();
    formData.append('PhoneNumber', selectedNumber.phone_number);
    formData.append('VoiceUrl', `https://ajqhjyhpjvyoemypcgkw.supabase.co/functions/v1/handle-call`);
    formData.append('VoiceMethod', 'POST');

    const purchaseResponse = await fetch(purchaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!purchaseResponse.ok) {
      const errorData = await purchaseResponse.text();
      throw new Error(`Failed to purchase number: ${errorData}`);
    }

    const purchaseData = await purchaseResponse.json();
    logStep("Number purchased successfully", { sid: purchaseData.sid, number: purchaseData.phone_number });

    // Store in database
    const { data: phoneNumberRecord, error: dbError } = await supabaseClient
      .from('user_phone_numbers')
      .insert({
        user_id: user.id,
        phone_number: purchaseData.phone_number,
        twilio_sid: purchaseData.sid,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", dbError);
      throw new Error(`Failed to store number: ${dbError.message}`);
    }

    // Update user profile to mark phone number as configured
    await supabaseClient
      .from('user_profiles')
      .update({ phone_number_configured: true })
      .eq('user_id', user.id);

    logStep("Phone number stored in database", phoneNumberRecord);

    return new Response(JSON.stringify({
      success: true,
      phoneNumber: purchaseData.phone_number,
      sid: purchaseData.sid
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in twilio-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});