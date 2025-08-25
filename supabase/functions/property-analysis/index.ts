import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    const { propertyData } = await req.json();

    if (!propertyData) {
      throw new Error('Missing propertyData parameter');
    }

    // Use Perplexity for real-time market data if available
    let marketData = '';
    if (perplexityApiKey) {
      try {
        const marketResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a real estate market analyst. Provide current market data and trends.'
              },
              {
                role: 'user',
                content: `Get current real estate market data for ${propertyData.city}, ${propertyData.state}. Include average prices, market trends, and comparable properties.`
              }
            ],
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });

        if (marketResponse.ok) {
          const marketResult = await marketResponse.json();
          marketData = marketResult.choices[0].message.content;
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        marketData = 'Market data unavailable';
      }
    }

    // Analyze property with OpenAI
    const analysisPrompt = `
Analyze this property and provide a comprehensive analysis:

Property Details:
${JSON.stringify(propertyData, null, 2)}

Market Data:
${marketData}

Please provide:
1. Estimated market value range
2. Investment potential score (1-10)
3. Key strengths and selling points
4. Potential concerns or issues
5. Recommended listing strategy
6. Comparable properties analysis
7. Market positioning advice

Return your analysis in a structured JSON format.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert real estate analyst with deep market knowledge. Provide detailed, actionable property analysis.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    console.log('Property analysis completed for:', propertyData.address);

    return new Response(
      JSON.stringify({ 
        analysis,
        propertyId: propertyData.id,
        marketDataIncluded: !!perplexityApiKey,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in property-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});