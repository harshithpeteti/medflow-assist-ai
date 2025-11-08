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
      return new Response(
        JSON.stringify({ tasks: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a medical AI assistant that analyzes doctor-patient conversations and detects actionable tasks.

Your job is to identify:
1. Lab Orders - Any tests, bloodwork, imaging (X-rays, CT, MRI, ultrasounds)
2. Prescriptions - Medications, dosages, duration
3. Referrals - Specialist consultations needed
4. Follow-ups - Return visits, monitoring needed

For each task detected, provide:
- type: "Lab Order" | "Prescription" | "Referral" | "Follow-up"
- description: Brief summary of what needs to be done
- reason: Clinical reasoning from the conversation
- urgency: "routine" | "urgent" | "stat"
- details: Specific information (test names, medication details, etc.)

Only detect tasks that are clearly indicated in the conversation. Do not infer or suggest additional tasks.`;

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
          { role: "user", content: `Analyze this conversation and detect medical tasks:\n\n${transcription}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_tasks",
            description: "Report detected medical tasks from the conversation",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["Lab Order", "Prescription", "Referral", "Follow-up"] },
                      description: { type: "string" },
                      reason: { type: "string" },
                      urgency: { type: "string", enum: ["routine", "urgent", "stat"] },
                      details: { type: "object" }
                    },
                    required: ["type", "description", "reason", "urgency"]
                  }
                }
              },
              required: ["tasks"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "report_tasks" } }
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
      const args = JSON.parse(toolCall.function.arguments);
      const tasks = args.tasks || [];
      
      // Add IDs and timestamps to tasks
      const enrichedTasks = tasks.map((task: any, index: number) => ({
        id: `task_${Date.now()}_${index}`,
        ...task,
        status: "pending",
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));

      return new Response(
        JSON.stringify({ tasks: enrichedTasks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ tasks: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-medical-tasks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
