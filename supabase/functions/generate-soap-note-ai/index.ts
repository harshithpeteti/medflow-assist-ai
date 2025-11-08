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
    const { transcript, medicalInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const medicalContext = medicalInfo ? `
Patient Information:
${medicalInfo.age ? `- Age: ${medicalInfo.age}` : ""}
${medicalInfo.gender ? `- Gender: ${medicalInfo.gender}` : ""}
${medicalInfo.smoker !== "Not mentioned" ? `- Smoking Status: ${medicalInfo.smoker}` : ""}
${medicalInfo.alcohol !== "Not mentioned" ? `- Alcohol Use: ${medicalInfo.alcohol}` : ""}
${medicalInfo.diabetes === "Yes" ? "- Diabetes: Yes" : ""}
${medicalInfo.hypertension === "Yes" ? "- Hypertension: Yes" : ""}
${medicalInfo.allergies ? `- Allergies: ${medicalInfo.allergies}` : ""}
${medicalInfo.conditions?.length > 0 ? `- Other Conditions: ${medicalInfo.conditions.join(", ")}` : ""}
${medicalInfo.chiefComplaint ? `- Chief Complaint: ${medicalInfo.chiefComplaint}` : ""}
` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical documentation assistant. Generate a structured SOAP note from doctor-patient conversations.

Format requirements:
- Use **bold** for section headers (e.g., **Chief Complaint:**)
- Use • for main bullet points  
- Use - for sub-points (indented)
- Highlight CRITICAL medical information with ** (e.g., **SMOKER**, **DIABETIC**)
- Be concise but thorough
- Include specific details from the conversation

Structure each section properly with clear headers and bullet points.`
          },
          {
            role: "user",
            content: `Generate a SOAP note from this consultation:

${medicalContext}

Transcript:
${transcript}

Create a complete SOAP note with Subjective, Objective, Assessment, and Plan sections.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_soap",
              description: "Generate structured SOAP note",
              parameters: {
                type: "object",
                properties: {
                  subjective: { type: "string", description: "Subjective section with patient complaints and history" },
                  objective: { type: "string", description: "Objective section with examination findings" },
                  assessment: { type: "string", description: "Assessment section with diagnosis and clinical impression" },
                  plan: { type: "string", description: "Plan section with treatment and follow-up" }
                },
                required: ["subjective", "objective", "assessment", "plan"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_soap" } }
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
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway request failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const soapNote = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(soapNote), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-soap-note-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
