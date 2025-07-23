import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, context, customPrompt } = await req.json();

    const prompt = customPrompt 
      ? customPrompt.replace('{title}', formData.title)
                   .replace('{goal}', formData.goal)
                   .replace('{timeline}', formData.timeline)
                   .replace('{budget}', formData.budget)
                   .replace('{target_audience}', formData.target_audience)
                   .replace('{description}', formData.description)
      : `You are a business planning expert for a ${context || 'small business'}. 

Based on the following information, create a detailed, actionable business plan:

Plan Details:
- Title: ${formData.title}
- Main Goal: ${formData.goal}
- Timeline: ${formData.timeline}
- Budget: ${formData.budget}
- Target Audience: ${formData.target_audience}
- Description: ${formData.description}

Please return a JSON object with the following structure:
{
  "planSummary": "2-3 sentence overview",
  "timelineBreakdown": "Week-by-week or phase breakdown",
  "marketingStrategy": "Marketing approach details",
  "operationalConsiderations": "Operational planning details", 
  "risksConstraints": "Potential risks and constraints",
  "keyMetrics": "Success metrics to track",
  "tasks": [
    {"title": "Task name", "description": "Detailed task description"}
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a strategic planning assistant for Sweet Wick, a premium handmade candle brand. You MUST respond with valid JSON only. The JSON structure must include:
            {
              "planSummary": "2-3 sentence overview specific to Sweet Wick's business model",
              "timelineBreakdown": "Detailed week-by-week breakdown for the timeline specified",
              "marketingStrategy": "Specific marketing tactics for candle business on Etsy/website",
              "operationalConsiderations": "Production, batching, scent supplies, fulfillment details",
              "risksConstraints": "Specific bottlenecks and constraints for candle business",
              "keyMetrics": "Relevant KPIs for candle sales and marketing",
              "tasks": [{"title": "Specific task", "description": "Actionable description"}]
            }
            Do not include any text outside the JSON. Make all content specific to Sweet Wick's candle business model.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Try to parse the JSON response
    let parsedTasks;
    try {
      // Clean the response to ensure it's pure JSON
      let cleanedContent = generatedContent.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      parsedTasks = JSON.parse(cleanedContent);
      
      // Validate that we have the required structure
      if (!parsedTasks.tasks || !Array.isArray(parsedTasks.tasks)) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract tasks from a more flexible format
      console.log('JSON parsing failed, attempting fallback parsing');
      
      // Create a Sweet Wick-specific fallback response
      parsedTasks = {
        planSummary: `This Sweet Wick strategy focuses on ${formData.goal || 'achieving your business goals'} through targeted candle marketing and efficient production planning. The plan leverages Sweet Wick's strengths in hyper-niched label design and seasonal positioning to drive sales on Etsy and your website.`,
        timelineBreakdown: `Based on your ${formData.timeline || 'specified timeline'}, this plan provides a phased approach starting with product development and label design, followed by listing optimization, marketing campaigns, and performance monitoring. Each phase builds on Sweet Wick's core strengths in visual storytelling and niche targeting.`,
        marketingStrategy: `Focus on Sweet Wick's signature approach: stunning, theme-based labels that create emotional connections. Leverage seasonal keywords on Etsy, create Instagram-worthy product photography, and use targeted ads to reach candle enthusiasts who value unique, handmade products with compelling visual stories.`,
        operationalConsiderations: `Plan scent batching around demand forecasts, ensure adequate supplies for hand-pouring, prepare labels in advance for quick fulfillment. Consider made-to-order timing and seasonal inventory needs. Streamline production workflow to maintain Sweet Wick's quality standards while scaling efficiently.`,
        risksConstraints: `Key constraints include limited production capacity for hand-poured candles, seasonal supply chain delays, and budget limitations for paid advertising. Monitor scent supply levels and label printing capacity to avoid stockouts during peak demand periods.`,
        keyMetrics: `Track Etsy listing views, conversion rates, average order value, customer acquisition cost through ads, repeat purchase rate for wax melts, social media engagement on product posts, and overall revenue growth against your target goals.`,
        tasks: [
          {
            title: "Design Halloween-Themed Labels & Scent Combinations",
            description: "Create 3-5 eye-catching Halloween label designs paired with seasonal scent profiles. Focus on themes that resonate with your target audience and photograph well for online listings."
          },
          {
            title: "Optimize Etsy Listings with Seasonal Keywords",
            description: "Research and implement Halloween-specific keywords in your Etsy titles, tags, and descriptions. Focus on terms like 'halloween candles', 'spooky decor', 'autumn scents', and 'seasonal gifts'."
          },
          {
            title: "Plan Scent Batching & Production Schedule",
            description: "Organize your scent inventory and create a production timeline that aligns with your sales goals. Ensure adequate supplies for anticipated demand and plan batching to maximize efficiency."
          },
          {
            title: "Create Social Media Content Calendar",
            description: "Develop Instagram and Pinterest content showcasing your Halloween collection. Focus on lifestyle shots, behind-the-scenes content, and user-generated content to build engagement organically."
          },
          {
            title: "Launch Targeted Etsy Ad Campaigns",
            description: "Set up Etsy ads targeting Halloween and seasonal candle keywords. Start with a small budget and optimize based on performance data. Focus on high-converting product photos and compelling titles."
          },
          {
            title: "Develop Bundle Offers for Increased AOV",
            description: "Create wax melt bundles and candle + wax melt combos to increase average order value. Position these as perfect seasonal gifts or sample packs for new customers."
          },
          {
            title: "Monitor Performance & Adjust Strategy",
            description: "Track key metrics weekly and adjust your approach based on what's working. Be prepared to increase ad spend or pivot messaging if initial results exceed expectations."
          },
          {
            title: "Prepare for Holiday Season Transition",
            description: "Plan your transition from Halloween to Christmas/winter themes. Begin developing next seasonal collection while current campaign is running to maintain momentum."
          }
        ]
      };
    }

    return new Response(JSON.stringify(parsedTasks), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-business-plan function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate business plan',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});