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
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const PatientConsultation = () => {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [soapNote, setSoapNote] = useState("");
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);

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
      const { data, error } = await supabase.functions.invoke("detect-medical-tasks", {
        body: { transcription: text },
      });

      if (error) throw error;

      if (data?.tasks && data.tasks.length > 0) {
        setDetectedTasks(prev => {
          const existingIds = new Set(prev.map(t => t.description));
          const newTasks = data.tasks.filter((t: DetectedTask) => 
            !existingIds.has(t.description)
          );
          return [...prev, ...newTasks];
        });
      }
    } catch (error: any) {
      console.error("Error detecting tasks:", error);
      if (error.message?.includes("Rate limit")) {
        toast.error("AI task detection temporarily paused. Please slow down.");
      }
    }
  };

  const generateSOAPNote = async () => {
    if (!transcript || transcript.trim().length === 0) {
      toast.error("No transcription available to generate SOAP note.");
      return;
    }

    setIsGeneratingSOAP(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-soap-note", {
        body: { transcription: transcript },
      });

      if (error) throw error;

      if (data?.soapNote) {
        setSoapNote(data.soapNote);
        toast.success("SOAP note generated successfully");
      }
    } catch (error: any) {
      console.error("Error generating SOAP note:", error);
      toast.error(error.message || "Failed to generate SOAP note");
    } finally {
      setIsGeneratingSOAP(false);
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
    
    // Generate SOAP note and recommended questions after recording stops
    await generateSOAPNote();
    await generateRecommendedQuestions();
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
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentPatient.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{currentPatient.age} years • MRN: {currentPatient.mrn}</span>
                    {isReturnVisit && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Return Visit ({currentPatient.visitCount} total)
                      </Badge>
                    )}
                  </div>
                  {currentPatient.conditions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {currentPatient.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {isReturnVisit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last visit: {currentPatient.lastVisit}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "hero"}
                size="lg"
                className="gap-2"
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

        {/* SOAP Note */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">SOAP Note</h2>
            {isGeneratingSOAP && (
              <Badge variant="secondary" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </Badge>
            )}
          </div>

          <ScrollArea className="flex-1 p-6">
            {soapNote ? (
              <div className="space-y-6">
                {soapNote.split('\n\n').map((section, idx) => {
                  const lines = section.split('\n');
                  const title = lines[0];
                  const content = lines.slice(1).join('\n');
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-primary rounded-full" />
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                      </div>
                      <Card className="p-4 bg-muted/30">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
                      </Card>
                      {idx < soapNote.split('\n\n').length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                SOAP note will be automatically generated after the consultation ends...
              </p>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default PatientConsultation;