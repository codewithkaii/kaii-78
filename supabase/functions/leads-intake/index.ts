import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { leadData } = await req.json();

    if (!leadData) {
      throw new Error('Missing leadData parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create lead in database
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        lead_type: leadData.lead_type || 'buyer',
        source: leadData.source || 'website',
        budget_min: leadData.budget_min || null,
        budget_max: leadData.budget_max || null,
        location_preferences: leadData.location_preferences || null,
        property_preferences: leadData.property_preferences || null,
        status: 'new'
      }])
      .select()
      .single();

    if (leadError) {
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    console.log('New lead created:', newLead.id);

    // Trigger AI orchestrator to process the lead
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiApiKey) {
      try {
        const { data: aiAnalysis, error: aiError } = await supabase.functions.invoke('ai-orchestrator', {
          body: {
            leadData: newLead,
            action: 'process_lead'
          }
        });

        if (aiError) {
          console.error('AI orchestrator error:', aiError);
        } else {
          console.log('AI analysis completed for lead:', newLead.id);
        }
      } catch (aiError) {
        console.error('Error calling AI orchestrator:', aiError);
      }
    }

    // Create initial interaction record
    const { error: interactionError } = await supabase
      .from('interactions')
      .insert([{
        lead_id: newLead.id,
        channel: 'web_form',
        direction: 'inbound',
        content: `New lead submission: ${leadData.name} interested in ${leadData.lead_type} properties`,
        outcome: 'lead_created'
      }]);

    if (interactionError) {
      console.error('Failed to create interaction:', interactionError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        leadId: newLead.id,
        message: 'Lead successfully created and queued for AI processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in leads-intake function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});