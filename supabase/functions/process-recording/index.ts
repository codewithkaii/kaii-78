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
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await req.formData()
    const callSid = formData.get('CallSid') as string
    const recordingUrl = formData.get('RecordingUrl') as string
    const recordingDuration = formData.get('RecordingDuration') as string

    console.log('Processing recording:', { callSid, recordingUrl, recordingDuration })

    // Get call details
    const { data: call } = await supabase
      .from('call_logs')
      .select('*')
      .eq('call_sid', callSid)
      .single()

    if (!call) {
      console.error('Call not found:', callSid)
      return new Response('Call not found', { status: 404, headers: corsHeaders })
    }

    // Download and transcribe recording with OpenAI Whisper
    const recordingResponse = await fetch(recordingUrl)
    const audioBlob = await recordingResponse.blob()

    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', audioBlob, 'recording.wav')
    transcriptionFormData.append('model', 'whisper-1')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`
      },
      body: transcriptionFormData
    })

    const transcription = await transcriptionResponse.json()
    const transcript = transcription.text || 'Transcription failed'

    console.log('Transcription:', transcript)

    // Generate AI summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that summarizes customer service calls. Provide a brief, professional summary of the call content, key points discussed, and any action items.'
          },
          {
            role: 'user',
            content: `Please summarize this call transcript: ${transcript}`
          }
        ],
        max_tokens: 200
      })
    })

    const summaryData = await summaryResponse.json()
    const aiSummary = summaryData.choices?.[0]?.message?.content || 'Summary generation failed'

    // Update call log with recording details
    const { error: updateError } = await supabase
      .from('call_logs')
      .update({
        recording_url: recordingUrl,
        transcript,
        ai_summary: aiSummary,
        duration_seconds: parseInt(recordingDuration) || 0,
        processed_at: new Date().toISOString()
      })
      .eq('call_sid', callSid)

    if (updateError) {
      console.error('Error updating call log:', updateError)
    }

    console.log('Recording processed successfully')

    return new Response('Recording processed', {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Recording processing error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})