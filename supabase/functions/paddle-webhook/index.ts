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

    const body = await req.text()
    const event = JSON.parse(body)

    console.log('Paddle webhook received:', event.event_type)

    if (event.event_type === 'subscription.created' || event.event_type === 'transaction.completed') {
      const subscription = event.data
      const customerId = subscription.customer_id
      const userId = subscription.custom_data?.user_id

      if (!userId) {
        console.error('No user_id in subscription custom_data')
        return new Response('No user_id found', { status: 400, headers: corsHeaders })
      }

      console.log('Processing payment for user:', userId)

      // Purchase Twilio phone number with a more reliable method
      const availableNumbers = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/US/Local.json?Limit=1`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          },
        }
      )

      if (!availableNumbers.ok) {
        console.error('Failed to fetch available numbers:', await availableNumbers.text())
        return new Response('Failed to fetch available numbers', { status: 500, headers: corsHeaders })
      }

      const numbersData = await availableNumbers.json()
      
      if (!numbersData.available_phone_numbers || numbersData.available_phone_numbers.length === 0) {
        console.error('No available phone numbers')
        return new Response('No available phone numbers', { status: 500, headers: corsHeaders })
      }

      const phoneNumber = numbersData.available_phone_numbers[0].phone_number

      // Purchase the phone number
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'PhoneNumber': phoneNumber,
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
      console.log('Purchased Twilio number:', twilioData.phone_number)

      // Save phone number to database
      const { error: phoneError } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: userId,
          phone_number: twilioData.phone_number,
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