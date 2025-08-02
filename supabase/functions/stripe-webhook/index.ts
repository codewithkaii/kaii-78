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

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    // In production, verify webhook signature here
    const event = JSON.parse(body)

    console.log('Stripe webhook received:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerId = session.customer
      const userId = session.metadata?.user_id

      if (!userId) {
        console.error('No user_id in session metadata')
        return new Response('No user_id found', { status: 400, headers: corsHeaders })
      }

      console.log('Processing payment for user:', userId)

      // Purchase Twilio phone number
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'PhoneNumber': '+1' + Math.floor(Math.random() * 9000000000 + 1000000000), // Random US number for demo
            'VoiceUrl': `${supabaseUrl}/functions/v1/handle-call`,
            'VoiceMethod': 'POST',
          }),
        }
      )

      if (!twilioResponse.ok) {
        console.error('Failed to purchase Twilio number:', await twilioResponse.text())
        return new Response('Failed to purchase phone number', { status: 500, headers: corsHeaders })
      }

      const twilioData = await twilioResponse.json()
      const phoneNumber = twilioData.phone_number

      console.log('Purchased Twilio number:', phoneNumber)

      // Save phone number to database
      const { error: phoneError } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: userId,
          phone_number: phoneNumber,
          twilio_sid: twilioData.sid,
          is_active: true
        })

      if (phoneError) {
        console.error('Error saving phone number:', phoneError)
        return new Response('Error saving phone number', { status: 500, headers: corsHeaders })
      }

      // Update user onboarding status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          phone_number_configured: true,
          onboarding_completed: true 
        })
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

      console.log('Successfully processed payment and configured phone number')
    }

    return new Response('Webhook processed', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})