import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript) {
      throw new Error("Transcript is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical AI assistant helping doctors conduct thorough patient consultations. 
Based on the conversation transcript provided, generate 5-7 relevant follow-up questions that the doctor should ask to gather more complete medical information.

Focus on:
- Clarifying vague symptoms
- Understanding symptom duration and severity
- Identifying potential risk factors
- Exploring patient history relevant to current complaint
- Understanding impact on daily life
- Checking for red flag symptoms

Questions should be:
- Conversational and empathetic
- Specific to what was discussed
- Medically relevant
- Easy for patients to understand`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate follow-up questions for this consultation:\n\n${transcript}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Generate follow-up questions for the consultation",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    description: "Array of 5-7 relevant follow-up questions"
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const functionCall = data.choices[0]?.message?.tool_calls?.[0]?.function;
    
    if (!functionCall || functionCall.name !== "generate_questions") {
      throw new Error("Unexpected AI response format");
    }

    const result = JSON.parse(functionCall.arguments);
    
    return new Response(
      JSON.stringify(result.questions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate questions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
