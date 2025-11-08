# Dust Workflow Integration Guide

This medical consultation app is integrated with Dust workflows to optimize task management, routing, and validation.

## Configured Workflows

### 1. **Task Optimization** (`optimize-tasks`)
**Purpose:** Automatically prioritizes and enhances detected medical tasks based on urgency, patient context, and previous visits.

**Inputs:**
- `tasks`: Array of detected tasks with type, description, reason, urgency
- `patientContext`: Patient name, visit history, return visit status

**Outputs:**
- `priority`: Enhanced priority level
- `reasoning`: AI-generated explanation for priority
- `estimatedTime`: Time estimate for task completion
- `dependencies`: Related tasks that should be completed first
- `recommendedAction`: Suggested next steps

**When it runs:** Automatically after detecting tasks from consultation transcript

---

### 2. **Task Routing** (`task-routing`)
**Purpose:** Routes tasks to appropriate departments and specialists based on task type and patient context.

**Inputs:**
- `task`: Individual task details
- `patientContext`: Patient information and visit history

**Outputs:**
- `department`: Assigned department (e.g., Lab, Pharmacy, Radiology)
- `specialist`: Assigned specialist or staff member
- `priority`: Adjusted priority based on routing

**When it runs:** When a task is approved by the doctor

---

### 3. **Prescription Validation** (`validate-prescription`)
**Purpose:** Validates prescriptions for drug interactions, correct dosage, and contraindications.

**Inputs:**
- `prescription`: Medication details
- `currentMedications`: Patient's current medication list
- `allergies`: Patient's known allergies

**Outputs:**
- `validation.hasIssues`: Boolean indicating validation problems
- `validation.issues`: Array of identified issues
- `suggestions`: Alternative recommendations

**When it runs:** Before approving prescription tasks

---

### 4. **Smart Follow-up** (`smart-followup`)
**Purpose:** Generates intelligent follow-up recommendations based on consultation summary and detected tasks.

**Inputs:**
- `consultationSummary`: Summary of the consultation
- `detectedTasks`: All tasks identified during visit
- `patientHistory`: Previous visit data

**Outputs:**
- Follow-up schedule recommendations
- Additional tests or referrals to consider
- Patient education materials needed

**Status:** Available but not yet integrated into UI

---

## Setup Instructions

### 1. Configure Dust Workspace

In your Dust workspace, you need to create the following apps:

1. **Task Optimizer App**
   - App name: `task-optimizer`
   - Input blocks: `tasks_input`, `patient_context`
   - Use GPT-4 or Claude for reasoning
   - Output: JSON with enhanced task properties

2. **Task Router App**
   - App name: `task-router`
   - Input blocks: `task_data`, `patient_context`
   - Use GPT-4 with department/specialist database
   - Output: Routing information

3. **Prescription Validator App**
   - App name: `prescription-validator`
   - Input blocks: `prescription`, `patient_medications`, `patient_allergies`
   - Use GPT-4 with medical database plugin
   - Output: Validation results

4. **Follow-up Agent**
   - App name: `followup-agent`
   - Input blocks: `consultation_summary`, `detected_tasks`, `patient_history`
   - Output: Follow-up recommendations

### 2. Update Edge Function

Edit `supabase/functions/dust-workflow/index.ts`:

Replace `YOUR_WORKSPACE` with your Dust workspace ID (found in URL: `dust.tt/w/YOUR_WORKSPACE`)

Replace `YOUR_APP` with your app names created above.

### 3. Get Specification Hashes (Optional)

For production, you should use specific specification hashes instead of `'latest'`:

```bash
curl https://dust.tt/api/v1/w/YOUR_WORKSPACE/apps/YOUR_APP \
  -H "Authorization: Bearer YOUR_DUST_API_KEY"
```

Copy the `specification_hash` from the response and update the edge function.

---

## Features Enabled

✅ **Automatic Task Optimization** - All detected tasks are sent through Dust AI for priority enhancement

✅ **Smart Task Routing** - Approved tasks are automatically routed to correct departments

✅ **Prescription Validation** - Prescriptions are checked for interactions before approval

✅ **Real-time Status Indicators** - UI shows when Dust workflows are processing

✅ **Multi-language Support** - Works with all 13 supported languages

✅ **Speaker Diarization** - Doctor vs patient identification in transcripts

---

## Workflow Status Indicators

The app displays workflow status in the task section:

- 🌟 **Processing** - Dust AI is optimizing tasks
- ✅ **Optimized** - Tasks enhanced successfully
- ⚠️ **Error** - Optimization failed (tasks still usable)

---

## Customization

You can customize workflows by:

1. **Adding more workflow types** in `dust-workflow/index.ts`
2. **Modifying input parameters** to include more patient context
3. **Adjusting when workflows are triggered** in `PatientConsultation.tsx`
4. **Creating custom Dust apps** for specialized medical workflows

---

## Troubleshooting

### Tasks not being optimized
- Check Dust API key is set correctly
- Verify workspace ID in edge function
- Check edge function logs: View Backend → Functions → dust-workflow

### Routing not working
- Ensure task-router app exists in Dust workspace
- Check app specification hash is correct
- Verify app has proper input/output configuration

### Prescription validation failing
- Confirm prescription-validator app is created
- Check patient medication/allergy data is being passed
- Review validation logic in Dust app

---

## API Reference

### Call Dust Workflow

```typescript
const { data, error } = await supabase.functions.invoke('dust-workflow', {
  body: {
    workflowType: 'optimize-tasks' | 'task-routing' | 'validate-prescription' | 'smart-followup',
    payload: {
      // Workflow-specific data
    }
  }
});
```

### Response Format

```typescript
{
  success: boolean,
  result: {
    run: {
      results: [...]
    }
  },
  workflowType: string
}
```

---

## Next Steps

1. ✅ Create Dust workspace and apps
2. ✅ Update edge function with workspace/app IDs  
3. ✅ Test each workflow independently
4. ⏳ Add follow-up workflow to UI
5. ⏳ Implement task dependency visualization
6. ⏳ Add workflow analytics dashboard

---

For more information about Dust, visit: https://docs.dust.tt/
