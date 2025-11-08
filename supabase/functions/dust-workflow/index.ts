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
    const { workflowType, payload } = await req.json();
    
    const DUST_API_KEY = Deno.env.get('DUST_API_KEY');
    const DUST_WORKSPACE_ID = Deno.env.get('DUST_WORKSPACE_ID');
    const DUST_ENABLED = Deno.env.get('DUST_ENABLED') === 'true';

    // If Dust is not configured, return a graceful fallback
    if (!DUST_API_KEY || !DUST_WORKSPACE_ID || !DUST_ENABLED) {
      console.log('Dust not configured, returning fallback response');
      return new Response(
        JSON.stringify({ 
          success: false,
          fallback: true,
          message: 'Dust integration not configured - using basic task management',
          result: payload // Return original payload unchanged
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing Dust workflow: ${workflowType}`);

    // Prepare workflow-specific prompt prefix
    let promptPrefix = '';
    switch (workflowType) {
      case 'optimize-tasks':
        promptPrefix = 'TASK OPTIMIZATION REQUEST:\nAnalyze and optimize the following medical tasks.\n\n';
        break;
      case 'task-routing':
        promptPrefix = 'TASK ROUTING REQUEST:\nRoute the following task to the appropriate department/specialist.\n\n';
        break;
      case 'smart-followup':
        promptPrefix = 'SMART FOLLOW-UP REQUEST:\nGenerate intelligent follow-up recommendations based on this consultation.\n\n';
        break;
      case 'validate-prescription':
        promptPrefix = 'PRESCRIPTION VALIDATION REQUEST:\nValidate this prescription for drug interactions, dosage, and safety.\n\n';
        break;
      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    // Call the single SmartAgent with workflow-specific prompt
    const dustResponse = await fetch(`https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/apps/SmartAgent/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        specification_hash: 'latest',
        config: {
          blocks: [
            {
              type: 'input',
              name: 'prompt',
              value: promptPrefix + JSON.stringify(payload, null, 2)
            }
          ]
        },
        blocking: true,
        stream: false
      }),
    });

    if (!dustResponse.ok) {
      const errorText = await dustResponse.text();
      console.error('Dust API error:', errorText);
      throw new Error(`Dust API error: ${dustResponse.status} - ${errorText}`);
    }

    const result = await dustResponse.json();
    console.log('Dust workflow completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        result: result,
        workflowType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dust-workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
