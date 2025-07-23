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
            content: 'You are a business planning expert. Always respond with valid JSON containing the complete plan structure with planSummary, timelineBreakdown, marketingStrategy, operationalConsiderations, risksConstraints, keyMetrics, and tasks array.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      parsedTasks = JSON.parse(generatedContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract tasks from a more flexible format
      console.log('JSON parsing failed, attempting fallback parsing');
      
      // Create a fallback response with full plan structure
      parsedTasks = {
        planSummary: "This plan aims to achieve your business goals through strategic planning and execution.",
        timelineBreakdown: "Please regenerate for a detailed timeline based on your specific inputs.",
        marketingStrategy: "Marketing approach will be tailored to your target audience and budget.",
        operationalConsiderations: "Operational planning will focus on efficiency and resource optimization.",
        risksConstraints: "Consider potential bottlenecks and resource limitations.",
        keyMetrics: "Track progress through relevant KPIs and success metrics.",
        tasks: [
          {
            title: "Market Research and Analysis",
            description: "Conduct thorough market research to understand your target audience, competitors, and market opportunities. Analyze pricing strategies and identify your unique value proposition."
          },
          {
            title: "Business Model Validation", 
            description: "Validate your business model by testing key assumptions. Create prototypes or MVP versions of your products/services and gather feedback from potential customers."
          },
          {
            title: "Financial Planning and Budgeting",
            description: "Develop detailed financial projections including startup costs, operational expenses, revenue forecasts, and break-even analysis. Set up accounting systems and financial tracking."
          },
          {
            title: "Brand Development and Positioning",
            description: "Create a strong brand identity including logo, messaging, and visual elements. Develop your brand positioning strategy to differentiate from competitors."
          },
          {
            title: "Marketing Strategy Development",
            description: "Create a comprehensive marketing plan including digital marketing, social media strategy, content marketing, and customer acquisition tactics within your budget."
          },
          {
            title: "Operational Framework Setup", 
            description: "Establish operational processes, supply chain management, quality control procedures, and workflow systems to ensure smooth business operations."
          },
          {
            title: "Legal and Compliance Requirements",
            description: "Research and complete all necessary legal requirements including business registration, permits, licenses, insurance, and compliance with industry regulations."
          },
          {
            title: "Launch Preparation and Execution",
            description: "Plan and execute your launch strategy including soft launch testing, marketing campaigns, inventory preparation, and customer support systems."
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