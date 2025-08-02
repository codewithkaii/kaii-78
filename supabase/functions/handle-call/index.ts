import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await req.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string

    console.log('Incoming call:', { callSid, from, to, callStatus })

    // Find user by phone number
    const { data: userPhone } = await supabase
      .from('user_phone_numbers')
      .select('user_id')
      .eq('phone_number', to)
      .single()

    if (!userPhone) {
      console.error('No user found for phone number:', to)
      return new Response('Number not found', { status: 404, headers: corsHeaders })
    }

    // Log the call
    const { error: logError } = await supabase
      .from('call_logs')
      .insert({
        user_id: userPhone.user_id,
        call_sid: callSid,
        from_number: from,
        to_number: to,
        call_status: callStatus,
        direction: 'inbound',
        call_type: 'voice'
      })

    if (logError) {
      console.error('Error logging call:', logError)
    }

    // TwiML response for AI assistant
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! You've reached LuniVoice AI Assistant. How can I help you today?</Say>
    <Record action="${supabaseUrl}/functions/v1/process-recording" method="POST" timeout="30" />
</Response>`

    return new Response(twimlResponse, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml'
      }
    })

  } catch (error) {
    console.error('Call handling error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})