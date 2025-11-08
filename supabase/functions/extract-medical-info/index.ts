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
    const { transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
            content: `You are a medical information extraction assistant. Extract key medical information from doctor-patient conversations.
Extract:
- Age (if mentioned)
- Gender (if mentioned)
- Smoking status (Yes/No/Former)
- Alcohol use (Yes/No/Occasional)
- Diabetes (Yes/No)
- Hypertension (Yes/No)
- Known allergies (list or "None mentioned")
- Other important medical conditions
- Chief complaint

Return ONLY valid JSON, nothing else.`
          },
          {
            role: "user",
            content: `Extract medical information from this conversation:\n\n${transcript}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_medical_info",
              description: "Extract medical information from conversation",
              parameters: {
                type: "object",
                properties: {
                  age: { type: "string", description: "Patient age if mentioned" },
                  gender: { type: "string", description: "Patient gender if mentioned" },
                  smoker: { type: "string", enum: ["Yes", "No", "Former", "Not mentioned"] },
                  alcohol: { type: "string", enum: ["Yes", "No", "Occasional", "Not mentioned"] },
                  diabetes: { type: "string", enum: ["Yes", "No", "Not mentioned"] },
                  hypertension: { type: "string", enum: ["Yes", "No", "Not mentioned"] },
                  allergies: { type: "string", description: "Known allergies or 'None mentioned'" },
                  conditions: { type: "array", items: { type: "string" }, description: "Other medical conditions" },
                  chiefComplaint: { type: "string", description: "Main reason for visit" }
                },
                required: ["smoker", "alcohol", "diabetes", "hypertension"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_medical_info" } }
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

    const extractedInfo = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extractedInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-medical-info:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
