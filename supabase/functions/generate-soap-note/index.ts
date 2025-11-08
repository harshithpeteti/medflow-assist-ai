import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!transcription || transcription.trim().length === 0) {
      throw new Error("No transcription provided");
    }

    const systemPrompt = `You are a medical documentation expert. Generate a professional SOAP note from doctor-patient conversations.

SOAP Format:
- Subjective: Patient's reported symptoms, concerns, history (in their words)
- Objective: Observable data - vitals, physical exam findings, test results
- Assessment: Diagnosis, differential diagnoses, clinical interpretation
- Plan: Treatment plan, orders, follow-up, patient education

Guidelines:
- Use professional medical terminology
- Be concise but complete
- Include relevant medical history
- Note vital signs if mentioned
- List all diagnoses with ICD-10 if appropriate
- Detail the treatment plan step by step
- Include patient education and follow-up instructions`;

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
          { 
            role: "user", 
            content: `Generate a SOAP note from this conversation:\n\n${transcription}` 
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_soap_note",
            description: "Create a structured SOAP note from the consultation",
            parameters: {
              type: "object",
              properties: {
                subjective: { 
                  type: "string",
                  description: "Patient's reported symptoms and history"
                },
                objective: { 
                  type: "string",
                  description: "Observable findings, vitals, exam results"
                },
                assessment: { 
                  type: "string",
                  description: "Clinical diagnosis and interpretation"
                },
                plan: { 
                  type: "string",
                  description: "Treatment plan, orders, and follow-up"
                }
              },
              required: ["subjective", "objective", "assessment", "plan"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_soap_note" } }
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const soapNote = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          soapNote 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("No SOAP note generated");

  } catch (error) {
    console.error("Error in generate-soap-note:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
