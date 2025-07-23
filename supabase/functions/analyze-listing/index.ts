import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingData } = await req.json();

    const prompt = `
You are an Etsy SEO and marketplace optimization expert. Analyze this Etsy listing and provide detailed recommendations:

Listing Data:
- Title: ${listingData.title}
- Description: ${listingData.description}
- Price: $${listingData.price}
- Tags/Keywords: ${listingData.tags || 'Not provided'}

Please analyze the following aspects and provide specific, actionable recommendations:

1. TITLE OPTIMIZATION:
   - Current title effectiveness (1-10 score)
   - Keyword optimization issues
   - Suggested title improvements (provide 3 alternatives)

2. SEO & KEYWORDS:
   - Keyword density analysis
   - Missing high-value keywords
   - Competition analysis
   - Recommended tags (provide 13 optimized tags)

3. PRICING STRATEGY:
   - Price competitiveness analysis
   - Suggested pricing adjustments
   - Value proposition improvements

4. DESCRIPTION OPTIMIZATION:
   - Readability and structure
   - Call-to-action effectiveness
   - SEO keyword integration
   - Suggested description improvements

5. MARKET RESEARCH:
   - Target audience insights
   - Competitor positioning
   - Trend analysis for this product category

Provide your response in JSON format with the following structure:
{
  "titleAnalysis": {
    "score": number,
    "issues": string[],
    "suggestions": string[]
  },
  "seoAnalysis": {
    "keywordDensity": string,
    "missingKeywords": string[],
    "recommendedTags": string[]
  },
  "pricingAnalysis": {
    "competitiveness": string,
    "suggestedPrice": number,
    "reasoning": string
  },
  "descriptionAnalysis": {
    "readabilityScore": number,
    "improvements": string[],
    "suggestedDescription": string
  },
  "marketResearch": {
    "targetAudience": string,
    "competitorInsights": string,
    "trends": string[]
  },
  "overallScore": number,
  "priorityActions": string[]
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert Etsy SEO consultant and marketplace optimization specialist.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // If JSON parsing fails, return a structured error
      analysis = {
        error: "Failed to parse AI response",
        rawResponse: analysisText
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-listing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});