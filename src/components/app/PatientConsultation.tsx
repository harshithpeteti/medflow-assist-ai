import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  Square, 
  User,
  Search,
  RefreshCw,
  Loader2,
  Beaker,
  Pill,
  UserPlus,
  Activity,
  Plus,
  X,
  CheckCircle,
  History
} from "lucide-react";
import SOAPReviewModal from "./SOAPReviewModal";
import PreviousVisitsModal from "./PreviousVisitsModal";
import { toast } from "sonner";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface DetectedTask {
  id: string;
  type: "Lab Order" | "Prescription" | "Referral" | "Follow-up";
  description: string;
  reason: string;
  details: any;
  urgency?: string;
  status: "pending" | "reviewed" | "sent";
  timestamp: string;
}

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const PatientConsultation = () => {
  const [patientName, setPatientName] = useState("");
  const [currentPatient, setCurrentPatient] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);
  const [showSOAPReview, setShowSOAPReview] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskType, setNewTaskType] = useState<DetectedTask["type"]>("Lab Order");
  const [showPreviousVisits, setShowPreviousVisits] = useState(false);
  const [previousVisits, setPreviousVisits] = useState<any[]>([]);
  
  // Patient demographics - editable during consultation
  const [demographics, setDemographics] = useState({
    age: "",
    gender: "",
    smoker: "No",
    alcohol: "No",
    diabetes: "No",
    hypertension: "No",
    allergies: "",
  });

  const { 
    transcript,
    isListening,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    error: voiceError
  } = useVoiceRecording();

  const handleStartConsultation = () => {
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    // Check if patient exists in localStorage
    const storedNotes = JSON.parse(localStorage.getItem("clinicalNotes") || "[]");
    const existingPatient = storedNotes.find(
      (note: any) => note.patientName.toLowerCase() === patientName.trim().toLowerCase()
    );

    if (existingPatient) {
      // Return visit - load patient data
      const patientVisits = storedNotes.filter(
        (note: any) => note.patientName.toLowerCase() === patientName.trim().toLowerCase()
      );
      
      setCurrentPatient({
        name: patientName.trim(),
        mrn: existingPatient.patientMRN,
        visitCount: patientVisits.length,
        lastVisit: new Date(patientVisits[patientVisits.length - 1].date).toLocaleDateString(),
        demographics: existingPatient.demographics || {},
      });
      setIsReturnVisit(true);
      setPreviousVisits(patientVisits);
      setDemographics(existingPatient.demographics || demographics);
      toast.success(`Welcome back ${patientName}! (${patientVisits.length} previous visits)`);
    } else {
      // New patient - go straight to consultation
      const newMRN = `${patientName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
      setCurrentPatient({
        name: patientName.trim(),
        mrn: newMRN,
        visitCount: 0,
        lastVisit: "Never",
        demographics: {},
      });
      setIsReturnVisit(false);
      setPreviousVisits([]);
      toast.success(`New patient: ${patientName}`);
    }
  };

  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Auto-detect tasks every 30 seconds
  useEffect(() => {
    if (!isRecording || !transcript) return;

    const interval = setInterval(() => {
      if (transcript.length > 100) {
        detectTasksFromTranscript(transcript);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRecording, transcript]);

  const detectTasksFromTranscript = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    try {
      // Mock task detection based on keywords
      const mockTasks: DetectedTask[] = [];
      
      if (text.toLowerCase().includes('blood test') || text.toLowerCase().includes('lab')) {
        mockTasks.push({
          id: Date.now().toString() + '-lab',
          type: "Lab Order",
          description: "Complete Blood Count (CBC)",
          reason: "Detected mention of blood test in consultation",
          details: {},
          status: "pending",
          timestamp: new Date().toISOString(),
        });
      }
      
      if (text.toLowerCase().includes('medication') || text.toLowerCase().includes('prescription')) {
        mockTasks.push({
          id: Date.now().toString() + '-rx',
          type: "Prescription",
          description: "Review and prescribe medication",
          reason: "Medication discussed during consultation",
          details: {},
          status: "pending",
          timestamp: new Date().toISOString(),
        });
      }
      
      if (text.toLowerCase().includes('follow up') || text.toLowerCase().includes('next visit')) {
        mockTasks.push({
          id: Date.now().toString() + '-followup',
          type: "Follow-up",
          description: "Schedule follow-up appointment",
          reason: "Follow-up mentioned in consultation",
          details: {},
          status: "pending",
          timestamp: new Date().toISOString(),
        });
      }

      if (mockTasks.length > 0) {
        setDetectedTasks(prev => {
          const existingIds = new Set(prev.map(t => t.description));
          const newTasks = mockTasks.filter(t => !existingIds.has(t.description));
          return [...prev, ...newTasks];
        });
      }
    } catch (error: any) {
      console.error("Error detecting tasks:", error);
    }
  };


  const handleStartRecording = async () => {
    if (!currentPatient) {
      toast.error("Please start a consultation first");
      return;
    }
    setIsRecording(true);
    await startVoiceRecording();
    toast.success("Recording started");
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    await stopVoiceRecording();
    toast.success("Recording stopped");
    
    // Generate SOAP note and show review modal
    setIsGeneratingSOAP(true);
    try {
      // Mock SOAP note generation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
      
      const demographics = currentPatient?.demographics || {};
      const mockSOAP: SoapNote = {
        subjective: `**Chief Complaint:** Main presenting symptoms\n\n**History of Present Illness:**\n${transcript.substring(0, 200)}...\n\n**Review of Systems:** As documented during consultation\n\n**Past Medical History:**\n${demographics.diabetes === "Yes" ? "• Type 2 Diabetes Mellitus\n" : ""}${demographics.hypertension === "Yes" ? "• Essential Hypertension\n" : ""}${demographics.smoker === "Yes" || demographics.smoker === "Former" ? `• Tobacco use (${demographics.smoker})\n` : ""}${demographics.alcohol === "Yes" ? "• Alcohol use\n" : ""}${demographics.allergies ? `\n**Known Allergies:** ${demographics.allergies}` : ""}`,
        
        objective: `**Vital Signs:** Within normal limits\n\n**Physical Examination:**\n• **General:** Alert and oriented, appears stated age\n• **Cardiovascular:** Regular rate and rhythm, no murmurs\n• **Respiratory:** Clear to auscultation bilaterally, no distress\n• **Neurological:** Cranial nerves intact, normal gait\n• **Other findings:** As documented during consultation`,
        
        assessment: `**Primary Diagnosis:** [Based on clinical presentation]\n\n**Differential Diagnoses:**\n• Consider alternative diagnoses based on symptoms\n• Further evaluation needed\n\n**Clinical Impression:**\n• Patient presents with symptoms requiring evaluation\n• Current condition appears stable\n• Risk factors noted: ${demographics.diabetes === "Yes" ? "Diabetes, " : ""}${demographics.hypertension === "Yes" ? "Hypertension, " : ""}${demographics.smoker === "Yes" ? "Active smoker" : ""}`,
        
        plan: `**Medications:**\n• Review current medications\n• Adjust dosages as needed\n• New prescriptions as indicated\n\n**Diagnostic Tests:**\n• Laboratory work: CBC, CMP as indicated\n• Imaging studies if clinically necessary\n\n**Follow-up Care:**\n• Return visit in 2-4 weeks or sooner if symptoms worsen\n• Monitor response to treatment\n\n**Patient Education:**\n• Discussed diagnosis and treatment options\n• Medication compliance emphasized\n• Lifestyle modifications reviewed\n${demographics.smoker === "Yes" ? "• Smoking cessation counseling provided\n" : ""}${demographics.alcohol === "Yes" ? "• Alcohol moderation discussed\n" : ""}\n**Referrals:** As needed based on clinical assessment`
      };

      setSoapNote(mockSOAP);
      setShowSOAPReview(true);
      toast.success("SOAP note generated");
    } catch (error: any) {
      console.error("Error generating SOAP note:", error);
      toast.error("Failed to generate SOAP note");
    } finally {
      setIsGeneratingSOAP(false);
    }
    
    await generateRecommendedQuestions();
  };

  const addManualTask = () => {
    if (!newTaskDescription.trim()) {
      toast.error("Please enter task description");
      return;
    }

    const newTask: DetectedTask = {
      id: Date.now().toString(),
      type: newTaskType,
      description: newTaskDescription,
      reason: "Manually added by doctor",
      details: {},
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    setDetectedTasks(prev => [newTask, ...prev]);
    setNewTaskDescription("");
    toast.success("Task added");
  };

  const removeTask = (taskId: string) => {
    setDetectedTasks(prev => prev.filter(t => t.id !== taskId));
    toast.info("Task removed");
  };

  const markTaskComplete = (taskId: string) => {
    setDetectedTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: "reviewed" as const } : t)
    );
    toast.success("Task marked as complete");
  };

  const generateRecommendedQuestions = async () => {
    if (!transcript) return;
    
    // Generate recommended follow-up questions based on transcript
    const questions = [
      "Can you describe the pain level on a scale of 1-10?",
      "Have you experienced any side effects from current medications?",
      "Are there any activities that worsen your symptoms?",
      "Have you noticed any triggers for your condition?",
      "How has this affected your daily activities?"
    ];
    setRecommendedQuestions(questions);
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 animate-fade-in">
      {/* Patient Name Entry */}
      {!currentPatient ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 w-full max-w-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Start New Consultation</h2>
                <p className="text-sm text-muted-foreground">
                  Enter patient name or ID. System will detect if this is a return visit.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter patient name or ID..."
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleStartConsultation()}
                  className="flex-1 text-lg h-14"
                />
                <Button 
                  onClick={handleStartConsultation} 
                  size="lg"
                  className="gap-2 h-14 px-8"
                >
                  <UserPlus className="h-5 w-5" />
                  Start
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* Left Sidebar - Patient Info & Demographics */}
          <Card className="w-80 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground truncate">{currentPatient.name}</h2>
                  <p className="text-xs text-muted-foreground">MRN: {currentPatient.mrn}</p>
                  {isReturnVisit && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 mt-2">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Visit #{currentPatient.visitCount + 1}
                    </Badge>
                  )}
                </div>
              </div>
              
              {isReturnVisit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviousVisits(true)}
                  className="w-full gap-2"
                >
                  <History className="h-3 w-3" />
                  View Previous Visits
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Patient Information</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Age</label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={demographics.age}
                        onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Gender</label>
                      <select
                        value={demographics.gender}
                        onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm h-9"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Medical History</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Smoker</label>
                      <select
                        value={demographics.smoker}
                        onChange={(e) => setDemographics({ ...demographics, smoker: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm h-9"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Former">Former</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Alcohol Use</label>
                      <select
                        value={demographics.alcohol}
                        onChange={(e) => setDemographics({ ...demographics, alcohol: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm h-9"
                      >
                        <option value="No">No</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Yes">Regular</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Diabetes</label>
                      <select
                        value={demographics.diabetes}
                        onChange={(e) => setDemographics({ ...demographics, diabetes: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm h-9"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Hypertension</label>
                      <select
                        value={demographics.hypertension}
                        onChange={(e) => setDemographics({ ...demographics, hypertension: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm h-9"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Known Allergies</label>
                      <Textarea
                        placeholder="List any allergies..."
                        value={demographics.allergies}
                        onChange={(e) => setDemographics({ ...demographics, allergies: e.target.value })}
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="w-full gap-2"
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Main Content */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Recording & Transcription with Tabs */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Live Transcription</h2>
          </div>

          <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="questions">Recommended Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="flex-1 p-4 overflow-hidden">
              {isListening && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording in progress...
                </div>
              )}

              <ScrollArea className="h-full border border-border rounded-lg p-4 bg-background">
                {transcript ? (
                  <p className="text-foreground whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Click "Start Consultation" to begin transcribing...
                  </p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="questions" className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full">
                {recommendedQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedQuestions.map((question, idx) => (
                      <Card key={idx} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <p className="text-sm text-foreground">{question}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Recommended questions will appear here after consultation starts...
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Tasks Section */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Consultation Tasks</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks detected from transcription + manually added
            </p>
          </div>

          {/* Add Manual Task */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex gap-2">
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as DetectedTask["type"])}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="Lab Order">Lab Order</option>
                <option value="Prescription">Prescription</option>
                <option value="Referral">Referral</option>
                <option value="Follow-up">Follow-up</option>
              </select>
              <Input
                placeholder="Add task description..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addManualTask()}
                className="flex-1"
              />
              <Button onClick={addManualTask} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {detectedTasks.length > 0 ? (
              <div className="space-y-3">
                {detectedTasks.map((task) => {
                  const icons = {
                    "Lab Order": Beaker,
                    "Prescription": Pill,
                    "Referral": UserPlus,
                    "Follow-up": Activity,
                  };
                  const Icon = icons[task.type];

                  return (
                    <Card
                      key={task.id}
                      className={`p-4 ${
                        task.status === "reviewed"
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {task.type}
                              </Badge>
                              {task.status === "reviewed" && (
                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {task.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {task.status !== "reviewed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markTaskComplete(task.id)}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTask(task.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No tasks yet. Tasks will be detected automatically from the transcription, or you can add them manually above.
              </p>
            )}
          </ScrollArea>
        </Card>

        {/* SOAP Review Modal */}
        <SOAPReviewModal
          open={showSOAPReview}
          onClose={() => {
            setShowSOAPReview(false);
            setSoapNote(null);
            setDetectedTasks([]);
            setRecommendedQuestions([]);
          }}
          soapNote={soapNote}
          patientName={currentPatient?.name || ""}
          patientMRN={currentPatient?.mrn || ""}
          patientDemographics={currentPatient?.demographics}
          transcript={transcript}
        />

          {/* Previous Visits Modal */}
          <PreviousVisitsModal
            open={showPreviousVisits}
            onClose={() => setShowPreviousVisits(false)}
            visits={previousVisits}
            patientName={currentPatient?.name || ""}
          />
        </div>
        </>
      )}
    </div>
  );
};

export default PatientConsultation;