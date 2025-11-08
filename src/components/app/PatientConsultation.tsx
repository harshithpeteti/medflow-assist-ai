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
  CheckCircle
} from "lucide-react";
import SOAPReviewModal from "./SOAPReviewModal";
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
  const [selectedPatient, setSelectedPatient] = useState<number | null>(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);
  const [showSOAPReview, setShowSOAPReview] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskType, setNewTaskType] = useState<DetectedTask["type"]>("Lab Order");

  const { 
    transcript,
    isListening,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    error: voiceError
  } = useVoiceRecording();

  // Mock patient data
  const patients = [
    {
      id: 1,
      name: "Emma Wilson",
      age: 48,
      mrn: "EMW-2024-1142",
      lastVisit: "Dec 20, 2024",
      visitCount: 3,
      conditions: ["Hypertension", "Type 2 Diabetes"],
    },
    {
      id: 2,
      name: "John Davis",
      age: 62,
      mrn: "JDA-2023-0892",
      lastVisit: "Jan 10, 2025",
      visitCount: 8,
      conditions: ["Hypertension"],
    },
    {
      id: 3,
      name: "Sarah Johnson",
      age: 35,
      mrn: "SJO-2024-0234",
      lastVisit: "Never",
      visitCount: 0,
      conditions: [],
    },
  ];

  const currentPatient = patients.find(p => p.id === selectedPatient);

  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Set return visit status when patient is selected
  useEffect(() => {
    if (currentPatient && currentPatient.visitCount > 0) {
      setIsReturnVisit(true);
    } else {
      setIsReturnVisit(false);
    }
  }, [currentPatient]);

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
    if (!selectedPatient) {
      toast.error("Please select a patient first");
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
      
      const mockSOAP: SoapNote = {
        subjective: `Patient ${currentPatient?.name} presents with symptoms discussed during consultation. ${transcript.substring(0, 200)}...`,
        objective: "Vital signs stable. Physical examination findings documented during visit.",
        assessment: "Clinical impression based on patient history and examination findings.",
        plan: "Treatment plan to be determined based on assessment. Follow-up as needed."
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
      {/* Left Sidebar - Patient List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Patients</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedPatient === patient.id ? "bg-muted border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{patient.name}</h3>
                    <p className="text-xs text-muted-foreground">{patient.age} yrs • {patient.mrn}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {patient.visitCount > 0 ? (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Return Visit
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                          New Patient
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Patient Header */}
        {currentPatient && (
          <Card className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{currentPatient.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{currentPatient.age} years old</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>MRN: {currentPatient.mrn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReturnVisit ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Return Visit ({currentPatient.visitCount} total)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        New Patient
                      </Badge>
                    )}
                  </div>

                  {currentPatient.conditions.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Medical History:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentPatient.conditions.map((condition, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {isReturnVisit && (
                    <p className="text-xs text-muted-foreground">
                      Last visit: {currentPatient.lastVisit}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "hero"}
                size="lg"
                className="gap-2 flex-shrink-0"
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Consultation
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

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
          transcript={transcript}
        />
      </div>
    </div>
  );
};

export default PatientConsultation;