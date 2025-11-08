import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Save, Search, User, AlertCircle, Beaker, Pill, UserPlus, Clock, Activity, Syringe, FileText as FileTextIcon, Stethoscope, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  status: "pending" | "reviewed" | "sent";
  timestamp: string;
}

const PatientConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DetectedTask | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskType, setNewTaskType] = useState<DetectedTask["type"]>("Lab Order");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("Patient: I've been having chest pain for the past few days...\n\nDoctor: Can you describe the pain? Is it sharp or dull?\n\nPatient: It's more of a dull ache, especially when I climb stairs.\n\nDoctor: Any shortness of breath with it?\n\nPatient: Yes, I get a bit winded...");
  const { toast } = useToast();

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Listening to consultation...",
    });
  };

  const soapNote = {
    subjective: "Patient reports chest discomfort and shortness of breath for the past three days. Symptoms worsen with exertion, particularly when climbing stairs. No associated fever or cough reported.",
    objective: "Vital signs: BP 140/90, HR 88, RR 16, SpO2 96% on room air. Cardiovascular exam reveals regular rate and rhythm, no murmurs. Chest clear to auscultation bilaterally.",
    assessment: "1. Chest pain - possible cardiac vs musculoskeletal etiology\n2. Hypertension - stage 1\n3. Shortness of breath - likely related to above",
    plan: "1. Order CBC, lipid panel, and troponin levels to rule out cardiac causes\n2. Start Aspirin 81mg daily for cardiovascular protection\n3. ECG today\n4. Follow up in 1 week or sooner if symptoms worsen\n5. Advised patient on warning signs requiring immediate ER visit"
  };

  const detectedTasks: DetectedTask[] = [
    { 
      id: "1",
      type: "Lab Order", 
      description: "CBC, Lipid Panel, Troponin levels", 
      reason: "Patient presenting with chest discomfort and shortness of breath",
      details: {
        tests: ["Complete Blood Count", "Lipid Panel", "Troponin levels"],
        urgency: "Routine",
      },
      status: "pending",
      timestamp: "10:35"
    },
    { 
      id: "2",
      type: "Prescription", 
      description: "Aspirin 81mg daily", 
      reason: "Preventive measure due to chest discomfort",
      details: {
        medication: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "30 days",
      },
      status: "pending",
      timestamp: "10:36"
    },
  ];

  const handleEndConsultation = () => {
    setIsRecording(false);
    setConversationEnded(true);
    toast({
      title: "Consultation Ended",
      description: "SOAP note generated successfully",
    });
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
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Patient</Badge>
                  <p className="text-sm text-foreground flex-1">
                    I've been having chest pain for the past few days...
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="default" className="mt-1">Doctor</Badge>
                  <p className="text-sm text-foreground flex-1">
                    Can you describe the pain? Is it sharp or dull?
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Patient</Badge>
                  <p className="text-sm text-foreground flex-1">
                    It's more of a dull ache, especially when I climb stairs.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="default" className="mt-1">Doctor</Badge>
                  <p className="text-sm text-foreground flex-1">
                    Any shortness of breath with it?
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Patient</Badge>
                  <p className="text-sm text-foreground flex-1">
                    Yes, I get a bit winded...
                  </p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mt-4 pt-4 border-t">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-xs">Listening...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
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
