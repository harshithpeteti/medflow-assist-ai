import { useState, useEffect, useRef } from "react";
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
  History,
  Stethoscope,
  Save
} from "lucide-react";
import SOAPReviewModal from "./SOAPReviewModal";
import PreviousVisitsModal from "./PreviousVisitsModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  
  // AI-extracted medical information
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [isExtractingInfo, setIsExtractingInfo] = useState(false);
  
  // Speaker identification
  const [currentSpeaker, setCurrentSpeaker] = useState<"Doctor" | "Patient">("Doctor");
  const [conversationTranscript, setConversationTranscript] = useState<Array<{
    speaker: "Doctor" | "Patient";
    text: string;
    timestamp: number;
  }>>([]);

  const { 
    transcript,
    isListening,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    error: voiceError
  } = useVoiceRecording();
  
  // Track when transcript changes to add to conversation
  const lastTranscriptLength = useRef(0);
  
  useEffect(() => {
    if (transcript.length > lastTranscriptLength.current && isRecording) {
      const newText = transcript.substring(lastTranscriptLength.current);
      if (newText.trim()) {
        setConversationTranscript(prev => [...prev, {
          speaker: currentSpeaker,
          text: newText,
          timestamp: Date.now()
        }]);
        lastTranscriptLength.current = transcript.length;
      }
    }
  }, [transcript, currentSpeaker, isRecording]);

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
      setExtractedInfo(existingPatient.demographics || null);
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
    setConversationTranscript([]);
    lastTranscriptLength.current = 0;
    await startVoiceRecording();
    toast.success("Recording started");
  };
  
  const saveDraft = () => {
    if (!currentPatient || conversationTranscript.length === 0) {
      toast.error("No consultation data to save");
      return;
    }
    
    const draft = {
      id: Date.now().toString(),
      patientName: currentPatient.name,
      patientMRN: currentPatient.mrn,
      date: new Date().toISOString(),
      status: "draft",
      conversation: conversationTranscript,
      transcript,
      extractedInfo,
      detectedTasks
    };
    
    const existingDrafts = JSON.parse(localStorage.getItem("consultationDrafts") || "[]");
    localStorage.setItem("consultationDrafts", JSON.stringify([draft, ...existingDrafts]));
    
    toast.success("Draft saved successfully");
    
    // Reset consultation
    setCurrentPatient(null);
    setPatientName("");
    setConversationTranscript([]);
    setExtractedInfo(null);
    setDetectedTasks([]);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    await stopVoiceRecording();
    toast.success("Recording stopped");
    
    if (!transcript || transcript.length < 50) {
      toast.error("Transcript too short to generate SOAP note");
      return;
    }

    // Extract medical information from transcript using AI
    setIsExtractingInfo(true);
    try {
      const { data: extractedData, error: extractError } = await supabase.functions.invoke(
        "extract-medical-info",
        { body: { transcript } }
      );

      if (extractError) throw extractError;
      
      setExtractedInfo(extractedData);
      toast.success("Medical information extracted");
    } catch (error: any) {
      console.error("Error extracting medical info:", error);
      toast.error("Failed to extract medical information");
    } finally {
      setIsExtractingInfo(false);
    }
    
    // Generate SOAP note with AI
    setIsGeneratingSOAP(true);
    try {
      const { data: soapData, error: soapError } = await supabase.functions.invoke(
        "generate-soap-note-ai",
        { 
          body: { 
            transcript,
            medicalInfo: extractedInfo 
          } 
        }
      );

      if (soapError) throw soapError;

      setSoapNote(soapData);
      setShowSOAPReview(true);
      toast.success("SOAP note generated");
    } catch (error: any) {
      console.error("Error generating SOAP note:", error);
      toast.error(error.message || "Failed to generate SOAP note");
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
    if (!transcript || transcript.length < 50) return;
    
    try {
      const { data: questions, error } = await supabase.functions.invoke(
        "generate-questions",
        { body: { transcript } }
      );

      if (error) throw error;
      
      if (questions && Array.isArray(questions)) {
        setRecommendedQuestions(questions);
      }
    } catch (error: any) {
      console.error("Error generating questions:", error);
      // Fallback to generic questions on error
      setRecommendedQuestions([
        "Can you describe the pain level on a scale of 1-10?",
        "Have you experienced any side effects from current medications?",
        "Are there any activities that worsen your symptoms?"
      ]);
    }
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
          {/* Main Content */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Patient Header with Start Recording */}
            <Card className="p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-foreground">{currentPatient.name}</h2>
                      {isReturnVisit && (
                        <>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Visit #{currentPatient.visitCount + 1}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreviousVisits(true)}
                            className="gap-1 h-7 text-xs"
                          >
                            <History className="h-3 w-3" />
                            Previous Visits
                          </Button>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">MRN: {currentPatient.mrn}</p>
                  </div>
                  
                  {/* Extracted Medical Info - Live Display */}
                  {extractedInfo && (
                    <div className="flex flex-wrap gap-2">
                      {extractedInfo.age && (
                        <Badge variant="secondary">{extractedInfo.age} yrs</Badge>
                      )}
                      {extractedInfo.gender && (
                        <Badge variant="secondary">{extractedInfo.gender}</Badge>
                      )}
                      {extractedInfo.smoker === "Yes" && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-semibold">
                          **SMOKER**
                        </Badge>
                      )}
                      {extractedInfo.diabetes === "Yes" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-semibold">
                          **DIABETIC**
                        </Badge>
                      )}
                      {extractedInfo.hypertension === "Yes" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-semibold">
                          **HTN**
                        </Badge>
                      )}
                      {extractedInfo.alcohol === "Yes" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Alcohol Use
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className="gap-2 flex-shrink-0"
                  disabled={isGeneratingSOAP || isExtractingInfo}
                >
                  {isGeneratingSOAP || isExtractingInfo ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isRecording ? (
                    <>
                      <Square className="h-5 w-5" />
                      Stop & Generate SOAP
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                {(isRecording || conversationTranscript.length > 0) && (
                  <Button
                    onClick={saveDraft}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Save className="h-5 w-5" />
                    Save Draft
                  </Button>
                )}
              </div>
            </Card>
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
                <div className="flex items-center justify-between gap-2 text-sm bg-muted/50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Recording in progress...</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={currentSpeaker === "Doctor" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSpeaker("Doctor")}
                      className="h-7 gap-1"
                    >
                      <Stethoscope className="h-3 w-3" />
                      Doctor
                    </Button>
                    <Button
                      variant={currentSpeaker === "Patient" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSpeaker("Patient")}
                      className="h-7 gap-1"
                    >
                      <User className="h-3 w-3" />
                      Patient
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="h-full border border-border rounded-lg p-4 bg-background">
                {conversationTranscript.length > 0 ? (
                  <div className="space-y-4">
                    {conversationTranscript.map((entry, idx) => (
                      <div key={idx} className={`flex gap-3 ${entry.speaker === "Doctor" ? "justify-start" : "justify-end"}`}>
                        <div className={`flex gap-2 max-w-[80%] ${entry.speaker === "Patient" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            entry.speaker === "Doctor" 
                              ? "bg-blue-500/10 text-blue-500" 
                              : "bg-green-500/10 text-green-500"
                          }`}>
                            {entry.speaker === "Doctor" ? (
                              <Stethoscope className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            entry.speaker === "Doctor"
                              ? "bg-blue-500/10 border border-blue-500/20"
                              : "bg-green-500/10 border border-green-500/20"
                          }`}>
                            <p className="text-xs font-semibold mb-1 text-muted-foreground">
                              {entry.speaker}
                            </p>
                            <p className="text-sm text-foreground">{entry.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Click "Start Recording" to begin transcribing the conversation...
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
          patientDemographics={extractedInfo}
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