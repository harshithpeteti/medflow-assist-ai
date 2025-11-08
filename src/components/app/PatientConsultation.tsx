import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  Square, 
  User,
  RefreshCw,
  Loader2,
  Beaker,
  Pill,
  UserPlus,
  Clock,
  Plus,
  X,
  Check,
  History,
  AlertCircle,
  Stethoscope,
  Edit3,
  Save,
  FileText
} from "lucide-react";
import PreviousVisitsModal from "./PreviousVisitsModal";
import MedicalNotesPreviewModal from "./MedicalNotesPreviewModal";
import { DustWorkflowIndicator } from "./DustWorkflowIndicator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { LanguageSelector } from "./LanguageSelector";

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
  const [patientName, setPatientName] = useState("");
  const [currentPatient, setCurrentPatient] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [isDetectingTasks, setIsDetectingTasks] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskType, setNewTaskType] = useState<DetectedTask["type"]>("Lab Order");
  const [showPreviousVisits, setShowPreviousVisits] = useState(false);
  const [previousVisits, setPreviousVisits] = useState<any[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editableTask, setEditableTask] = useState<DetectedTask | null>(null);
  const [showMedicalNotesPreview, setShowMedicalNotesPreview] = useState(false);
  const [generatedSOAP, setGeneratedSOAP] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [dustWorkflowStatus, setDustWorkflowStatus] = useState<'processing' | 'optimized' | 'error' | 'idle'>('idle');
  
  // Speaker identification
  const [currentSpeaker, setCurrentSpeaker] = useState<"doctor" | "patient">("doctor");
  const [conversationTranscript, setConversationTranscript] = useState<Array<{
    speaker: "doctor" | "patient";
    text: string;
    timestamp: number;
  }>>([]);

  const { 
    transcript,
    isListening,
    currentSpeaker: detectedSpeaker,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    error: voiceError
  } = useVoiceRecording({
    language: selectedLanguage,
    onSpeakerDetected: (speaker) => {
      setCurrentSpeaker(speaker);
      console.log("Speaker detected:", speaker);
    }
  });

  
  const lastTranscriptLength = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const lastSpeaker = useRef<"doctor" | "patient">("doctor");
  
  useEffect(() => {
    if (transcript.length > lastTranscriptLength.current && isRecording) {
      const newText = transcript.substring(lastTranscriptLength.current);
      if (newText.trim()) {
        setConversationTranscript(prev => {
          if (prev.length === 0 || lastSpeaker.current !== currentSpeaker) {
            lastSpeaker.current = currentSpeaker;
            return [...prev, {
              speaker: currentSpeaker,
              text: newText,
              timestamp: Date.now()
            }];
          }
          
          const updated = [...prev];
          const lastEntry = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastEntry,
            text: lastEntry.text + " " + newText
          };
          return updated;
        });
        lastTranscriptLength.current = transcript.length;
      }
    }
  }, [transcript, currentSpeaker, isRecording]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationTranscript]);

  const handleStartConsultation = () => {
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    const storedNotes = JSON.parse(localStorage.getItem("clinicalNotes") || "[]");
    const existingPatient = storedNotes.find(
      (note: any) => note.patientName.toLowerCase() === patientName.trim().toLowerCase()
    );

    if (existingPatient) {
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
      toast.success(`Welcome back ${patientName}! (${patientVisits.length} previous visits)`);
    } else {
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

  const detectTasksFromTranscript = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    setIsDetectingTasks(true);
    try {
      // Step 1: Detect tasks using AI
      const { data, error } = await supabase.functions.invoke(
        "detect-medical-tasks",
        { body: { transcription: text } }
      );

      if (error) throw error;
      
      if (data?.tasks && Array.isArray(data.tasks)) {
        // Step 2: Optimize tasks with Dust workflow
        console.log("Optimizing tasks with Dust workflow...");
        const dustResult = await optimizeTasksWithDust(data.tasks);
        
        const optimizedTasks = dustResult.success ? dustResult.tasks : data.tasks;
        
        setDetectedTasks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTasks = optimizedTasks.filter((t: DetectedTask) => !existingIds.has(t.id));
          return [...prev, ...newTasks];
        });
        
        if (optimizedTasks.length > 0) {
          const message = dustResult.success 
            ? `Detected and optimized ${optimizedTasks.length} task(s) with Dust AI`
            : `Detected ${optimizedTasks.length} task(s) from consultation`;
          toast.success(message);
        }
      }
    } catch (error: any) {
      console.error("Error detecting tasks:", error);
      toast.error("Failed to detect tasks");
    } finally {
      setIsDetectingTasks(false);
    }
  };

  const optimizeTasksWithDust = async (tasks: DetectedTask[]) => {
    setDustWorkflowStatus('processing');
    try {
      const { data, error } = await supabase.functions.invoke('dust-workflow', {
        body: {
          workflowType: 'optimize-tasks',
          payload: {
            tasks: tasks.map(t => ({
              type: t.type,
              description: t.description,
              reason: t.reason,
              urgency: t.urgency,
              details: t.details
            })),
            patientContext: {
              name: currentPatient?.name,
              isReturnVisit: isReturnVisit,
              previousVisits: previousVisits.length
            }
          }
        }
      });

      if (error) {
        console.error("Dust optimization error:", error);
        setDustWorkflowStatus('error');
        return { success: false, tasks };
      }

      // Parse Dust response and enhance tasks
      const dustTasks = data?.result?.run?.results?.[0]?.[0]?.value || tasks;
      
      // Merge Dust optimizations with original tasks
      const optimized = tasks.map((task, idx) => {
        const dustEnhancement = dustTasks[idx] || {};
        return {
          ...task,
          priority: dustEnhancement.priority || task.urgency,
          reasoning: dustEnhancement.reasoning,
          estimatedTime: dustEnhancement.estimatedTime,
          dependencies: dustEnhancement.dependencies || [],
          recommendedAction: dustEnhancement.recommendedAction
        };
      });

      setDustWorkflowStatus('optimized');
      setTimeout(() => setDustWorkflowStatus('idle'), 3000);
      
      return { success: true, tasks: optimized };
    } catch (error) {
      console.error("Error in Dust optimization:", error);
      setDustWorkflowStatus('error');
      setTimeout(() => setDustWorkflowStatus('idle'), 3000);
      return { success: false, tasks };
    }
  };

  const handleStartRecording = async () => {
    if (!currentPatient) {
      toast.error("Please start a consultation first");
      return;
    }
    
    try {
      setIsRecording(true);
      setConversationTranscript([]);
      lastTranscriptLength.current = 0;
      lastSpeaker.current = "doctor";
      setCurrentSpeaker("doctor");
      
      await startVoiceRecording();
      toast.success("Recording started - Speaker detection active");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    await stopVoiceRecording();
    toast.success("Recording stopped - Analyzing consultation...");
    
    if (!transcript || transcript.length < 50) {
      toast.error("Transcript too short to analyze");
      return;
    }

    await detectTasksFromTranscript(transcript);
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
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setDetectedTasks(prev => [newTask, ...prev]);
    setNewTaskDescription("");
    toast.success("Task added");
  };

  const removeTask = (taskId: string) => {
    setDetectedTasks(prev => prev.filter(t => t.id !== taskId));
    toast.info("Task removed");
  };

  const approveTask = async (taskId: string) => {
    const taskToApprove = detectedTasks.find(t => t.id === taskId);
    
    if (expandedTaskId === taskId && editableTask) {
      // Validate prescription tasks with Dust before approval
      if (editableTask.type === "Prescription") {
        toast.info("Validating prescription with Dust AI...");
        
        try {
          const { data } = await supabase.functions.invoke('dust-workflow', {
            body: {
              workflowType: 'validate-prescription',
              payload: {
                prescription: editableTask,
                currentMedications: [],
                allergies: []
              }
            }
          });

          if (data?.result?.validation?.hasIssues) {
            toast.error(`Validation issues: ${data.result.validation.issues.join(', ')}`);
            return;
          }
        } catch (error) {
          console.error("Prescription validation error:", error);
        }
      }

      // Route task with Dust
      const routingResult = await routeTaskWithDust(editableTask);
      
      setDetectedTasks(prev =>
        prev.map(t => t.id === taskId ? { 
          ...editableTask, 
          status: "reviewed" as const,
          routedTo: routingResult.department,
          assignedTo: routingResult.specialist
        } : t)
      );
      setExpandedTaskId(null);
      setEditableTask(null);
      toast.success(`Task approved and routed to ${routingResult.department}`);
    } else {
      if (taskToApprove) {
        const routingResult = await routeTaskWithDust(taskToApprove);
        setDetectedTasks(prev =>
          prev.map(t => t.id === taskId ? { 
            ...t, 
            status: "reviewed" as const,
            routedTo: routingResult.department,
            assignedTo: routingResult.specialist
          } : t)
        );
        toast.success(`Task approved and routed to ${routingResult.department}`);
      } else {
        setDetectedTasks(prev =>
          prev.map(t => t.id === taskId ? { ...t, status: "reviewed" as const } : t)
        );
        toast.success("Task approved");
      }
    }
  };

  const routeTaskWithDust = async (task: DetectedTask) => {
    try {
      const { data } = await supabase.functions.invoke('dust-workflow', {
        body: {
          workflowType: 'task-routing',
          payload: {
            task,
            patientContext: {
              name: currentPatient?.name,
              isReturnVisit: isReturnVisit
            }
          }
        }
      });

      return {
        department: data?.result?.routing?.department || 'General',
        specialist: data?.result?.routing?.specialist || 'Unassigned',
        priority: data?.result?.routing?.priority || task.urgency
      };
    } catch (error) {
      console.error("Error routing task:", error);
      return { department: 'General', specialist: 'Unassigned', priority: task.urgency };
    }
  };

  const toggleTaskExpand = (task: DetectedTask) => {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
      setEditableTask(null);
    } else {
      setExpandedTaskId(task.id);
      setEditableTask({ ...task });
    }
  };

  const generateSOAPNote = async () => {
    if (conversationTranscript.length === 0) {
      toast.error("No consultation transcript available");
      return;
    }

    const fullTranscript = conversationTranscript
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n');

    try {
      toast.info("Generating SOAP note...");
      const { data, error } = await supabase.functions.invoke("generate-soap-note-ai", {
        body: { transcription: fullTranscript }
      });

      if (error) throw error;

      setGeneratedSOAP(data);
      setShowMedicalNotesPreview(true);
    } catch (error: any) {
      console.error("Error generating SOAP:", error);
      toast.error("Failed to generate SOAP note");
    }
  };

  const saveToMedicalNotes = () => {
    if (!generatedSOAP || !currentPatient) return;

    const noteToSave = {
      id: Date.now().toString(),
      patientName: currentPatient.name,
      patientMRN: currentPatient.mrn,
      demographics: currentPatient.demographics,
      date: new Date().toISOString(),
      transcript: conversationTranscript
        .map(entry => `${entry.speaker}: ${entry.text}`)
        .join('\n'),
      subjective: generatedSOAP.subjective || "",
      objective: generatedSOAP.objective || "",
      assessment: generatedSOAP.assessment || "",
      plan: generatedSOAP.plan || "",
    };

    const existingNotes = JSON.parse(localStorage.getItem("clinicalNotes") || "[]");
    localStorage.setItem("clinicalNotes", JSON.stringify([noteToSave, ...existingNotes]));
    
    setShowMedicalNotesPreview(false);
    toast.success("Saved to Clinical Notes");
    
    // Dispatch storage event to refresh ClinicalNotes component
    window.dispatchEvent(new Event('storage'));
  };

  const saveDraft = () => {
    const draftData = {
      patientName: currentPatient?.name,
      patientMRN: currentPatient?.mrn,
      conversationTranscript,
      detectedTasks,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("consultationDraft", JSON.stringify(draftData));
    toast.success("Draft saved");
  };

  const getTaskIcon = (type: DetectedTask["type"]) => {
    switch (type) {
      case "Lab Order": return Beaker;
      case "Prescription": return Pill;
      case "Referral": return UserPlus;
      case "Follow-up": return Clock;
    }
  };

  const getTaskColor = (type: DetectedTask["type"]) => {
    switch (type) {
      case "Lab Order": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "Prescription": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "Referral": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Follow-up": return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 animate-fade-in">
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
              <div className="space-y-4">
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
                    <User className="h-5 w-5" />
                    Start
                  </Button>
                </div>
                <div className="flex justify-center">
                  <LanguageSelector 
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    disabled={false}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left Side - Tasks Section */}
          <div className="w-[45%] flex flex-col space-y-4 overflow-hidden">
            {/* Header */}
            <Card className="p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{currentPatient.name}</h2>
                    <p className="text-xs text-muted-foreground">MRN: {currentPatient.mrn}</p>
                  </div>
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
                        History
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isListening && !isRecording}
                  size="sm"
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Record
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Tasks Section */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Detected Tasks</h3>
                    <p className="text-xs text-muted-foreground">Review and approve tasks from consultation</p>
                    <DustWorkflowIndicator status={dustWorkflowStatus} />
                  </div>
                  {isDetectingTasks && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>

                {/* Add Manual Task */}
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
                    placeholder="Add task manually..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addManualTask()}
                    className="flex-1"
                  />
                  <Button onClick={addManualTask} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {detectedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {detectedTasks.map((task) => {
                      const Icon = getTaskIcon(task.type);
                      const colorClass = getTaskColor(task.type);
                      const isExpanded = expandedTaskId === task.id;

                      return (
                        <Card
                          key={task.id}
                          className={`border-l-4 transition-all duration-300 ${
                            task.status === "reviewed"
                              ? "bg-green-500/5 border-l-green-500"
                              : colorClass
                          } ${isExpanded ? "scale-105 shadow-lg" : ""}`}
                        >
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => toggleTaskExpand(task)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary" className="text-xs">
                                      {task.type}
                                    </Badge>
                                    {task.urgency && (
                                      <Badge variant="outline" className={`text-xs ${
                                        task.urgency === "stat" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                        task.urgency === "urgent" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                      }`}>
                                        {task.urgency.toUpperCase()}
                                      </Badge>
                                    )}
                                     {task.status === "reviewed" && (
                                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                        ✓ Approved
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">{task.timestamp}</span>
                                  </div>
                                  <p className="text-sm font-medium text-foreground mb-1">
                                    {task.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {task.reason}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                {task.status !== "reviewed" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => approveTask(task.id)}
                                    className="h-8 w-8 p-0 hover:bg-green-500/10"
                                    title="Approve & Send"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTask(task.id)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                  title="Remove"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Edit View */}
                          {isExpanded && editableTask && (
                            <div className="border-t p-4 space-y-3 bg-background/50" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2 mb-2">
                                <Edit3 className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold text-foreground">Edit Task Details</h4>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Type</label>
                                <select
                                  value={editableTask.type}
                                  onChange={(e) => setEditableTask({ ...editableTask, type: e.target.value as DetectedTask["type"] })}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                                >
                                  <option value="Lab Order">Lab Order</option>
                                  <option value="Prescription">Prescription</option>
                                  <option value="Referral">Referral</option>
                                  <option value="Follow-up">Follow-up</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <Textarea
                                  value={editableTask.description}
                                  onChange={(e) => setEditableTask({ ...editableTask, description: e.target.value })}
                                  className="min-h-[80px]"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                                <Textarea
                                  value={editableTask.reason}
                                  onChange={(e) => setEditableTask({ ...editableTask, reason: e.target.value })}
                                  className="min-h-[60px]"
                                />
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveTask(task.id)}
                                  className="gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Accept & Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setExpandedTaskId(null);
                                    setEditableTask(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground italic">
                      {isRecording 
                        ? "Tasks will appear here as they're detected from the conversation..."
                        : "No tasks yet. Start recording or add tasks manually above."}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          {/* Right Side - Live Transcription */}
          <div className="w-[55%] flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-foreground">Live Transcription</h2>
                <p className="text-xs text-muted-foreground">Real-time conversation transcript</p>
              </div>

              {isListening && (
                <div className="mx-4 mt-4 flex items-center justify-between gap-2 text-sm bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium text-foreground">🎙️ Recording - Auto-detecting speaker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {currentSpeaker === "doctor" ? (
                        <>
                          <Stethoscope className="h-3 w-3" />
                          Doctor
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3" />
                          Patient
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              )}

              <ScrollArea className="flex-1 p-4 scroll-smooth">
                <div className="min-h-full">
                  {conversationTranscript.length > 0 ? (
                    <div className="space-y-4 pb-4">
                      {conversationTranscript.map((entry, idx) => (
                        <div 
                          key={idx} 
                          className={`flex gap-3 animate-fade-in ${entry.speaker === "doctor" ? "justify-start" : "justify-end"}`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className={`flex gap-2 max-w-[85%] ${entry.speaker === "patient" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              entry.speaker === "doctor" 
                                ? "bg-blue-500/10 text-blue-500" 
                                : "bg-green-500/10 text-green-500"
                            }`}>
                              {entry.speaker === "doctor" ? (
                                <Stethoscope className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              entry.speaker === "doctor"
                                ? "bg-blue-500/10 border border-blue-500/20"
                                : "bg-green-500/10 border border-green-500/20"
                            }`}>
                              <p className="text-xs font-semibold mb-1 text-muted-foreground capitalize">
                                {entry.speaker}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={transcriptEndRef} className="h-1" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Mic className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground italic">
                        Click "Record" to begin transcribing the conversation...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Speaker will be automatically detected based on voice
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              {conversationTranscript.length > 0 && (
                <div className="p-4 border-t flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={generateSOAPNote}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Save to Medical Notes
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <PreviousVisitsModal
        open={showPreviousVisits}
        onClose={() => setShowPreviousVisits(false)}
        visits={previousVisits}
        patientName={currentPatient?.name || ""}
      />

      <MedicalNotesPreviewModal
        isOpen={showMedicalNotesPreview}
        onClose={() => setShowMedicalNotesPreview(false)}
        onSave={saveToMedicalNotes}
        patientName={currentPatient?.name || ""}
        patientMRN={currentPatient?.mrn || ""}
        soapNote={generatedSOAP || { subjective: "", objective: "", assessment: "", plan: "" }}
        demographics={currentPatient?.demographics}
      />
    </div>
  );
};

export default PatientConsultation;
