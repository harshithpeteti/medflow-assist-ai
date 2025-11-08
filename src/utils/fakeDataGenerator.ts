export const generateFakeData = () => {
  const patients = [
    {
      name: "Sarah Johnson",
      mrn: "SJO-2024-1234",
      age: "45",
      gender: "Female",
      smoker: "No",
      alcohol: "Occasional",
      diabetes: "Yes",
      hypertension: "Yes",
      allergies: "Penicillin"
    },
    {
      name: "Michael Chen",
      mrn: "MCH-2024-5678",
      age: "62",
      gender: "Male",
      smoker: "Former",
      alcohol: "No",
      diabetes: "Yes",
      hypertension: "Yes",
      allergies: "None"
    },
    {
      name: "Emma Williams",
      mrn: "EWI-2024-9012",
      age: "28",
      gender: "Female",
      smoker: "No",
      alcohol: "Occasional",
      diabetes: "No",
      hypertension: "No",
      allergies: "Shellfish, Latex"
    },
    {
      name: "Robert Martinez",
      mrn: "RMA-2024-3456",
      age: "71",
      gender: "Male",
      smoker: "Yes",
      alcohol: "Yes",
      diabetes: "Yes",
      hypertension: "Yes",
      allergies: "Sulfa drugs"
    },
    {
      name: "Lisa Anderson",
      mrn: "LAN-2024-7890",
      age: "34",
      gender: "Female",
      smoker: "No",
      alcohol: "No",
      diabetes: "No",
      hypertension: "No",
      allergies: "None"
    }
  ];

  const clinicalNotes = patients.map((patient, idx) => ({
    id: `note-${Date.now() - idx * 100000}`,
    patientName: patient.name,
    patientMRN: patient.mrn,
    demographics: {
      age: patient.age,
      gender: patient.gender,
      smoker: patient.smoker,
      alcohol: patient.alcohol,
      diabetes: patient.diabetes,
      hypertension: patient.hypertension,
      allergies: patient.allergies
    },
    date: new Date(Date.now() - idx * 86400000 * 7).toISOString(),
    transcript: getSampleTranscript(patient.name),
    subjective: getSampleSubjective(patient),
    objective: getSampleObjective(patient),
    assessment: getSampleAssessment(patient),
    plan: getSamplePlan(patient)
  }));

  const drafts = [
    {
      id: `draft-${Date.now()}`,
      patientName: "James Wilson",
      patientMRN: "JWI-2024-4567",
      date: new Date().toISOString(),
      status: "draft",
      conversation: [
        { speaker: "Doctor", text: "Good morning, Mr. Wilson. What brings you in today?", timestamp: Date.now() - 300000 },
        { speaker: "Patient", text: "I've been having chest pain for the past few days, especially when I climb stairs.", timestamp: Date.now() - 280000 },
        { speaker: "Doctor", text: "Can you describe the pain? Is it sharp, dull, or pressure-like?", timestamp: Date.now() - 260000 },
        { speaker: "Patient", text: "It feels like pressure, right in the center of my chest. Sometimes it goes to my left arm.", timestamp: Date.now() - 240000 }
      ],
      transcript: "Good morning, Mr. Wilson. What brings you in today? I've been having chest pain...",
      extractedInfo: {
        age: "58",
        gender: "Male",
        smoker: "Yes",
        alcohol: "Occasional",
        diabetes: "No",
        hypertension: "Yes"
      },
      detectedTasks: [
        {
          id: "task-1",
          type: "Lab Order",
          description: "ECG and cardiac enzymes",
          reason: "Evaluate chest pain",
          details: {},
          status: "pending",
          timestamp: new Date().toISOString()
        }
      ]
    }
  ];

  return { clinicalNotes, drafts };
};

const getSampleTranscript = (name: string) => {
  return `Doctor: Good morning, ${name}. How are you feeling today?
Patient: I've been having some issues with my health lately.
Doctor: Can you tell me more about what you've been experiencing?
Patient: I've been feeling tired and have some shortness of breath.
Doctor: How long has this been going on?
Patient: About two weeks now.
Doctor: Have you noticed any other symptoms?`;
};

const getSampleSubjective = (patient: any) => {
  const complaints = [
    "chest pain radiating to left arm",
    "persistent cough with greenish sputum",
    "severe headaches with photophobia",
    "abdominal pain in right upper quadrant",
    "knee pain with swelling and limited mobility"
  ];
  
  return `**Chief Complaint:** ${complaints[Math.floor(Math.random() * complaints.length)]}

**History of Present Illness:**
• Patient reports onset of symptoms approximately 2 weeks ago
• Symptoms have been progressively worsening
• Pain rated 6-7/10 on pain scale
• Symptoms worse in the morning, improve with rest

**Review of Systems:**
• Constitutional: Reports fatigue and occasional fever
• Cardiovascular: ${patient.hypertension === "Yes" ? "**History of hypertension**" : "No chest pain"}
• Respiratory: Denies shortness of breath at rest

**Past Medical History:**
${patient.diabetes === "Yes" ? "• **Type 2 Diabetes Mellitus** - well controlled\n" : ""}${patient.hypertension === "Yes" ? "• **Essential Hypertension** - on medication\n" : ""}${patient.smoker === "Yes" ? "• **Active Smoker** - 1 pack per day\n" : ""}${patient.smoker === "Former" ? "• Former smoker - quit 5 years ago\n" : ""}${patient.alcohol !== "No" ? `• Alcohol use: ${patient.alcohol}\n` : ""}
${patient.allergies !== "None" ? `**Known Allergies:** ${patient.allergies}` : "**Known Allergies:** No known drug allergies"}`;
};

const getSampleObjective = (patient: any) => {
  return `**Vital Signs:**
• Blood Pressure: ${patient.hypertension === "Yes" ? "145/92 mmHg" : "118/76 mmHg"}
• Heart Rate: 78 bpm
• Respiratory Rate: 16 breaths/min
• Temperature: 98.6°F (37°C)
• Oxygen Saturation: 98% on room air
${patient.age && parseInt(patient.age) > 50 ? "• BMI: 28.5 kg/m²" : ""}

**Physical Examination:**

• **General:** Alert and oriented x3, appears stated age, ${patient.smoker === "Yes" ? "**appears chronically ill**" : "no acute distress"}

• **Cardiovascular:**
  - Regular rate and rhythm
  - No murmurs, rubs, or gallops
  - Peripheral pulses 2+ bilaterally
  ${patient.hypertension === "Yes" ? "- **Elevated blood pressure noted**" : ""}

• **Respiratory:**
  - Clear to auscultation bilaterally
  - No wheezes, rales, or rhonchi
  - Normal respiratory effort
  ${patient.smoker === "Yes" || patient.smoker === "Former" ? "- Decreased breath sounds in lower lobes" : ""}

• **Neurological:**
  - Cranial nerves II-XII intact
  - Motor strength 5/5 in all extremities
  - Sensation intact to light touch
  - Gait steady and coordinated

• **Skin:** Warm, dry, no rashes or lesions noted`;
};

const getSampleAssessment = (patient: any) => {
  const diagnoses = [
    "Acute bronchitis with secondary bacterial infection",
    "Musculoskeletal chest pain, likely costochondritis",
    "Tension-type headache with possible migraine component",
    "Acute gastroenteritis with dehydration",
    "Osteoarthritis of the knee, moderate severity"
  ];

  return `**Primary Diagnosis:** ${diagnoses[Math.floor(Math.random() * diagnoses.length)]}

**Differential Diagnoses:**
• Consider alternative etiologies based on symptom progression
• Rule out more serious underlying conditions
• Monitor for development of complications

**Clinical Impression:**
• Patient presents with concerning symptoms requiring evaluation
• Current condition appears stable but requires treatment
• **Risk factors identified:**
${patient.diabetes === "Yes" ? "  - **Diabetes Mellitus** - increases infection risk\n" : ""}${patient.hypertension === "Yes" ? "  - **Hypertension** - cardiovascular risk factor\n" : ""}${patient.smoker === "Yes" ? "  - **Active smoker** - significant health risk\n" : ""}${patient.age && parseInt(patient.age) > 60 ? "  - Advanced age - increased complication risk\n" : ""}
• Prognosis is good with appropriate treatment and follow-up
• Patient counseled on warning signs and when to seek emergency care`;
};

const getSamplePlan = (patient: any) => {
  return `**Medications:**
• Start antibiotic therapy: Azithromycin 500mg PO daily x 5 days
• Analgesic: Ibuprofen 400mg PO q6h PRN pain
• Continue current medications for chronic conditions
${patient.diabetes === "Yes" ? "• Continue Metformin as prescribed\n" : ""}${patient.hypertension === "Yes" ? "• Continue Lisinopril 10mg daily\n" : ""}

**Diagnostic Tests:**
• Laboratory work ordered:
  - Complete Blood Count (CBC)
  - Comprehensive Metabolic Panel (CMP)
  ${patient.diabetes === "Yes" ? "- Hemoglobin A1C\n  " : ""}${patient.hypertension === "Yes" ? "- Lipid panel\n  " : ""}
• Chest X-ray ordered to rule out pneumonia
• ECG if chest pain worsens

**Follow-up Care:**
• Return to clinic in 1-2 weeks for re-evaluation
• Sooner if symptoms worsen or new symptoms develop
• Call office if fever > 101°F or severe pain develops
• Monitor blood pressure at home if hypertensive

**Patient Education:**
• Discussed diagnosis, treatment plan, and expected course
• Emphasized importance of medication compliance
• Reviewed warning signs requiring immediate medical attention
${patient.smoker === "Yes" ? "• **Smoking cessation counseling provided** - offered resources and support\n" : ""}${patient.alcohol === "Yes" ? "• **Alcohol moderation discussed** - recommended limiting intake\n" : ""}${patient.diabetes === "Yes" ? "• Reviewed diabetic diet and blood sugar monitoring\n" : ""}
• Provided written instructions and patient education materials
• Patient verbalized understanding and agreed with plan

**Referrals:**
• Consider cardiology consult if symptoms persist
• Physical therapy referral for rehabilitation as needed`;
};
