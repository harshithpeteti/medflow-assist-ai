import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, StopCircle, Save, User, FileText, CheckCircle, Clock, AlertCircle, Beaker, FileSignature, UserPlus, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskReviewModal from "./TaskReviewModal";

interface DetectedTask {
  id: string;
  type: "Lab Order" | "Prescription" | "Referral" | "Follow-up";
  description: string;
  reason: string;
  details: any;
  status: "pending" | "reviewed" | "sent";
  timestamp: string;
}

const ActiveConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DetectedTask | null>(null);
  const { toast } = useToast();

  const transcript = [
    { speaker: "Doctor", text: "Good morning, how are you feeling today?", time: "10:32" },
    { speaker: "Patient", text: "I've been experiencing some chest discomfort and shortness of breath.", time: "10:32" },
    { speaker: "Doctor", text: "When did these symptoms start?", time: "10:33" },
    { speaker: "Patient", text: "About three days ago. It gets worse when I climb stairs.", time: "10:33" },
    { speaker: "Doctor", text: "Any history of heart problems in your family?", time: "10:34" },
    { speaker: "Patient", text: "Yes, my father had a heart attack at 55.", time: "10:34" },
    { speaker: "Doctor", text: "I'd like to order some tests - CBC, lipid panel, and troponin levels.", time: "10:35" },
    { speaker: "Doctor", text: "Let's start you on aspirin 81mg daily as a precaution.", time: "10:36" },
  ];

  const savedNotes = [
    { 
      id: "1", 
      patient: "John Davis", 
      date: "Nov 8, 2024", 
      time: "09:15",
      diagnosis: "Hypertension, Type 2 Diabetes",
      tasks: { completed: 3, total: 3 }
    },
    { 
      id: "2", 
      patient: "Sarah Johnson", 
      date: "Nov 8, 2024", 
      time: "08:30",
      diagnosis: "Upper Respiratory Infection",
      tasks: { completed: 2, total: 2 }
    },
    { 
      id: "3", 
      patient: "Michael Brown", 
      date: "Nov 7, 2024", 
      time: "16:45",
      diagnosis: "Acute Lower Back Pain",
      tasks: { completed: 1, total: 2 }
    },
  ];

  const detectedTasks: DetectedTask[] = [
    { 
      id: "1",
      type: "Lab Order", 
      description: "CBC, Lipid Panel, Troponin levels", 
      reason: "Patient presenting with chest discomfort and shortness of breath with family history of heart disease",
      details: {
        tests: ["Complete Blood Count", "Lipid Panel", "Troponin levels"],
        urgency: "Routine",
        notes: "Patient has family history - father had MI at 55"
      },
      status: "pending",
      timestamp: "10:35"
    },
    { 
      id: "2",
      type: "Prescription", 
      description: "Aspirin 81mg daily", 
      reason: "Preventive measure due to chest discomfort and cardiovascular risk factors",
      details: {
        medication: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food in the morning",
        pharmacy: "MedPlus Pharmacy - Main St"
      },
      status: "pending",
      timestamp: "10:36"
    },
    { 
      id: "3",
      type: "Referral", 
      description: "Cardiology consultation - Dr. James Chen", 
      reason: "Further evaluation needed for chest discomfort with concerning symptoms",
      details: {
        specialist: "Cardiology",
        doctor: "Dr. James Chen",
        priority: "Urgent",
        reason: "Chest pain, dyspnea, positive family history"
      },
      status: "pending",
      timestamp: "10:36"
    },
  ];

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    setIsPaused(false);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Consultation transcript saved" : "AI is now listening",
    });
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
        return { icon: Clock, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
    }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 animate-fade-in">
      {/* Left Sidebar - Saved Notes */}
      <Card className="w-80 flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Saved Notes
          </h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {savedNotes.map((note) => (
              <Card 
                key={note.id} 
                className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{note.patient}</h3>
                      <p className="text-xs text-muted-foreground">{note.date} • {note.time}</p>
                    </div>
                    {note.tasks.completed === note.tasks.total ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{note.diagnosis}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {note.tasks.completed}/{note.tasks.total} Tasks
                    </Badge>
                    {note.tasks.completed === note.tasks.total && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Section */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Section - Start Consultation */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Emma Wilson</h3>
                <p className="text-sm text-muted-foreground">Age 48 • Female • MRN: EMW-2024-1142</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isRecording ? "default" : "secondary"} className="px-4 py-2">
                {isRecording && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                )}
                {isRecording ? "Recording" : "Ready"}
              </Badge>
              <Button 
                onClick={handleToggleRecording}
                variant={isRecording ? "destructive" : "hero"}
                className="gap-2"
                size="lg"
              >
                {isRecording ? (
                  <>
                    <StopCircle className="h-5 w-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Consultation
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Middle Section - Live Transcription */}
        <Card className="flex-1 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Live Transcription
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save Note
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {transcript.map((entry, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    entry.speaker === "Doctor" 
                      ? "bg-primary/5 border-l-4 border-primary" 
                      : "bg-muted/50 border-l-4 border-accent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{entry.speaker}</span>
                    <span className="text-xs text-muted-foreground">{entry.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{entry.text}</p>
                </div>
              ))}
              
              {isRecording && (
                <div className="flex items-center gap-2 text-muted-foreground p-3">
                  <div className="flex gap-1">
                    <span className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-sm">Listening...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Bottom Section - AI Detected Tasks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            AI-Detected Tasks
            <Badge variant="secondary" className="ml-2">{detectedTasks.length}</Badge>
          </h2>
          <div className="grid grid-cols-3 gap-4">
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
                      <h3 className="font-semibold text-foreground mb-1">{task.type}</h3>
                      <p className="text-sm text-foreground mb-2">{task.description}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.reason}</p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Review & Accept
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>

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

export default ActiveConsultation;
