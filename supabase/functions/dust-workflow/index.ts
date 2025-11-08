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

    let dustResponse;

    switch (workflowType) {
      case 'optimize-tasks': {
        // Optimize and prioritize medical tasks
        dustResponse = await fetch(`https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/apps/task-optimizer/runs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DUST_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            specification_hash: payload.specificationHash || 'latest',
            config: {
              blocks: [
                {
                  type: 'input',
                  name: 'tasks_input',
                  value: JSON.stringify(payload.tasks)
                }
              ]
            },
            blocking: true,
            stream: false
          }),
        });
        break;
      }

      case 'task-routing': {
        // Route tasks to appropriate departments/specialists
        dustResponse = await fetch(`https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/apps/task-router/runs`, {
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
                  name: 'task_data',
                  value: JSON.stringify(payload.task)
                },
                {
                  type: 'input',
                  name: 'patient_context',
                  value: JSON.stringify(payload.patientContext || {})
                }
              ]
            },
            blocking: true,
            stream: false
          }),
        });
        break;
      }

      case 'smart-followup': {
        // Generate intelligent follow-up recommendations
        dustResponse = await fetch(`https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/apps/followup-agent/runs`, {
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
                  name: 'consultation_summary',
                  value: payload.consultationSummary
                },
                {
                  type: 'input',
                  name: 'detected_tasks',
                  value: JSON.stringify(payload.tasks)
                },
                {
                  type: 'input',
                  name: 'patient_history',
                  value: JSON.stringify(payload.patientHistory || [])
                }
              ]
            },
            blocking: true,
            stream: false
          }),
        });
        break;
      }

      case 'validate-prescription': {
        // Validate prescriptions for drug interactions, dosage, etc.
        dustResponse = await fetch(`https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/apps/prescription-validator/runs`, {
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
                  name: 'prescription',
                  value: JSON.stringify(payload.prescription)
                },
                {
                  type: 'input',
                  name: 'patient_medications',
                  value: JSON.stringify(payload.currentMedications || [])
                },
                {
                  type: 'input',
                  name: 'patient_allergies',
                  value: JSON.stringify(payload.allergies || [])
                }
              ]
            },
            blocking: true,
            stream: false
          }),
        });
        break;
      }

      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }

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
