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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured - please add it in Settings > API Keys");
      throw new Error('OpenAI API key not configured. Please contact your administrator to configure the API keys in Settings.');
    }

    const { leadData, action } = await req.json();

    if (!leadData || !action) {
      throw new Error('Missing leadData or action parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let prompt = '';
    let systemMessage = '';

    switch (action) {
      case 'process_lead':
        systemMessage = 'You are a real estate AI assistant that processes lead information and extracts key details.';
        prompt = `Process this lead information and extract:
1. Lead quality score (1-10)
2. Budget range 
3. Property preferences
4. Urgency level
5. Next recommended action

Lead data: ${JSON.stringify(leadData)}

Return a structured JSON response.`;
        break;

      case 'analyze_property':
        systemMessage = 'You are a real estate AI assistant that analyzes property data and market conditions.';
        prompt = `Analyze this property data and provide:
1. Market value estimate
2. Investment potential score
3. Key selling points
4. Potential concerns
5. Recommended pricing strategy

Property data: ${JSON.stringify(leadData)}

Return a structured JSON response.`;
        break;

      case 'generate_offer':
        systemMessage = 'You are a real estate AI assistant that generates competitive offer strategies.';
        prompt = `Generate an offer strategy based on:
1. Property details
2. Market conditions
3. Buyer budget and preferences

Data: ${JSON.stringify(leadData)}

Provide offer amount, terms, and negotiation strategy.`;
        break;

      default:
        throw new Error('Invalid action specified');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Log the analysis for debugging
    console.log(`AI Orchestrator - Action: ${action}, Analysis:`, analysis);

    // Store the analysis result in the database if needed
    if (action === 'process_lead' && leadData.id) {
      try {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            score: JSON.parse(analysis).lead_quality_score || null,
            property_preferences: JSON.parse(analysis).property_preferences || null
          })
          .eq('id', leadData.id);

        if (updateError) {
          console.error('Error updating lead:', updateError);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        action,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-orchestrator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});