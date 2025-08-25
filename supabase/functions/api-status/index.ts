import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Check status of various API keys and services
    const apiStatus = {
      openai: {
        configured: !!Deno.env.get('OPENAI_API_KEY'),
        status: 'unknown'
      },
      elevenlabs: {
        configured: !!Deno.env.get('ELEVENLABS_API_KEY'),
        status: 'unknown'
      },
      twilio: {
        configured: !!Deno.env.get('TWILIO_API_KEY'),
        status: 'unknown'
      },
      perplexity: {
        configured: !!Deno.env.get('PERPLEXITY_API_KEY'),
        status: 'unknown'
      }
    };

    // Test OpenAI if configured
    if (apiStatus.openai.configured) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
        });
        apiStatus.openai.status = response.ok ? 'active' : 'error';
      } catch {
        apiStatus.openai.status = 'error';
      }
    }

    // Test ElevenLabs if configured
    if (apiStatus.elevenlabs.configured) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
          },
        });
        apiStatus.elevenlabs.status = response.ok ? 'active' : 'error';
      } catch {
        apiStatus.elevenlabs.status = 'error';
      }
    }

    return new Response(
      JSON.stringify({ apiStatus }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in api-status function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to check API status'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});