import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Save, AlertCircle, Beaker, Pill, UserPlus, Activity, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import TaskReviewModal from "./TaskReviewModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedTask, setSelectedTask] = useState<DetectedTask | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskType, setNewTaskType] = useState<DetectedTask["type"]>("Lab Order");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [isDetectingTasks, setIsDetectingTasks] = useState(false);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const { toast } = useToast();

  const { isRecording, transcript, startRecording, stopRecording } = useVoiceRecording({
    onTranscriptionUpdate: (text) => {
      // Auto-detect tasks every 30 seconds of new speech
      if (text.length > 100 && !isDetectingTasks) {
        detectTasksFromTranscript(text);
      }
    },
  });

  const detectTasksFromTranscript = async (text: string) => {
    if (!text || text.trim().length === 0) return;
    
    setIsDetectingTasks(true);
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
        toast({
          title: "Rate Limit",
          description: "AI task detection temporarily paused. Please slow down.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDetectingTasks(false);
    }
  };

  const generateSOAPNote = async () => {
    if (!transcript || transcript.trim().length === 0) {
      toast({
        title: "No Content",
        description: "No transcription available to generate SOAP note.",
        variant: "destructive",
      });
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
        toast({
          title: "SOAP Note Generated",
          description: "Clinical documentation is ready for review.",
        });
      }
    } catch (error: any) {
      console.error("Error generating SOAP note:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SOAP note.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSOAP(false);
    }
  };

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleEndConsultation = async () => {
    stopRecording();
    setConversationEnded(true);
    
    // Generate final tasks and SOAP note
    await detectTasksFromTranscript(transcript);
    await generateSOAPNote();
  };

  const handleAddTask = () => {
    if (!newTaskDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task Added",
      description: `${newTaskType} has been added to the queue`,
    });
    setIsAddingTask(false);
    setNewTaskDescription("");
    setNewTaskType("Lab Order");
  };

  const getTaskIcon = (type: DetectedTask["type"]) => {
    switch (type) {
      case "Lab Order":
        return { icon: Beaker, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
      case "Prescription":
        return { icon: Pill, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case "Referral":
        return { icon: UserPlus, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
      case "Follow-up":
        return { icon: Activity, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
    }
  };

  // Main consultation interface
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              ← Back
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                🏥 Outpatient Consultation
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isRecording && !conversationEnded && (
              <Button 
                onClick={handleStartRecording}
                size="lg"
                className="gap-2"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            )}
            {isRecording && (
              <>
                <Badge variant="default" className="px-4 py-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  Recording
                </Badge>
                <Button 
                  onClick={handleEndConsultation}
                  variant="destructive"
                  className="gap-2"
                  size="lg"
                >
                  <MicOff className="h-5 w-5" />
                  End Consultation
                </Button>
              </>
            )}
            {conversationEnded && (
              <Badge variant="secondary" className="px-4 py-2">
                Ended
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Detected Tasks - LEFT SIDE (1/3) */}
        <Card className="p-6 h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Tasks
                <Badge variant="secondary" className="ml-2">{detectedTasks.length}</Badge>
              </h3>
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsAddingTask(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {detectedTasks.map((task) => {
                const taskStyle = getTaskIcon(task.type);
                const Icon = taskStyle.icon;
                
                return (
                  <Card 
                    key={task.id}
                    className={`p-4 border-2 ${taskStyle.border} hover:shadow-lg transition-all cursor-pointer group`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${taskStyle.bg}`}>
                          <Icon className={`h-5 w-5 ${taskStyle.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {task.timestamp}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-1 text-sm">{task.type}</h4>
                        <p className="text-xs text-foreground mb-2 line-clamp-2">{task.description}</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground text-xs"
                      >
                        Review
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Live Transcription - RIGHT SIDE (2/3) */}
        <Card className="p-6 h-[600px] flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              {!isRecording && !conversationEnded ? "Consultation Transcription" : isRecording ? "Live Transcription" : "Consultation Summary"}
            </h3>
            {conversationEnded && (
              <Button variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save Note
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1">
            {!isRecording && !conversationEnded ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Ready to Start</p>
                <p className="text-sm text-center max-w-md">
                  Click the "Start Recording" button above to begin the consultation transcription
                </p>
              </div>
            ) : isRecording ? (
              <div className="space-y-3 pr-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {transcript || "Listening..."}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mt-4 pt-4 border-t">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-xs">Listening and detecting tasks...</p>
                  {isDetectingTasks && (
                    <Loader2 className="h-3 w-3 animate-spin ml-2" />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {isGeneratingSOAP ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generating SOAP note...</p>
                  </div>
                ) : soapNote ? (
                  <>
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-semibold text-foreground mb-2">Subjective</h4>
                      <p className="text-sm text-foreground">{soapNote.subjective}</p>
                    </div>
                    
                    <div className="border-l-4 border-accent pl-4 py-2">
                      <h4 className="font-semibold text-foreground mb-2">Objective</h4>
                      <p className="text-sm text-foreground">{soapNote.objective}</p>
                    </div>
                    
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-semibold text-foreground mb-2">Assessment</h4>
                      <p className="text-sm text-foreground whitespace-pre-line">{soapNote.assessment}</p>
                    </div>
                    
                    <div className="border-l-4 border-accent pl-4 py-2">
                      <h4 className="font-semibold text-foreground mb-2">Plan</h4>
                      <p className="text-sm text-foreground whitespace-pre-line">{soapNote.plan}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No SOAP note generated yet</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Manually add a task to the consultation workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-type">Task Type</Label>
              <Select value={newTaskType} onValueChange={(value) => setNewTaskType(value as DetectedTask["type"])}>
                <SelectTrigger id="task-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lab Order">Lab Order</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task details..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Review Modal */}
      {selectedTask && (
        <TaskReviewModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onAccept={(task) => {
            toast({
              title: "Task Accepted",
              description: `${task.type} has been processed and sent.`,
            });
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientConsultation;
