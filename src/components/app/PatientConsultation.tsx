import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Save, Search, User, AlertCircle, Beaker, Pill, UserPlus, Clock } from "lucide-react";
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

const PatientConsultation = () => {
  const [patientName, setPatientName] = useState("");
  const [patientSelected, setPatientSelected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DetectedTask | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const { toast } = useToast();

  const transcript = [
    { speaker: "Doctor", text: "Good morning, how are you feeling today?", time: "10:32" },
    { speaker: "Patient", text: "I've been experiencing some chest discomfort and shortness of breath.", time: "10:32" },
    { speaker: "Doctor", text: "When did these symptoms start?", time: "10:33" },
    { speaker: "Patient", text: "About three days ago. It gets worse when I climb stairs.", time: "10:33" },
  ];

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

  const handleStartConsultation = () => {
    if (!patientName.trim()) {
      toast({
        title: "Patient Name Required",
        description: "Please enter a patient name to start consultation",
        variant: "destructive"
      });
      return;
    }
    setPatientSelected(true);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
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

  // Before selecting patient
  if (!patientSelected) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-88px)] animate-fade-in">
        <Card className="w-full max-w-2xl p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Start New Consultation</h1>
              <p className="text-muted-foreground">Enter patient information to begin</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Patient Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search or enter patient name..."
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleStartConsultation()}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chief Complaint (Optional)</label>
                <Textarea
                  placeholder="Brief description of patient's concern..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <Button 
              onClick={handleStartConsultation}
              variant="hero" 
              size="lg" 
              className="w-full gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Consultation
            </Button>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Workflow Steps</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Enter Patient Information</p>
                    <p className="text-xs text-muted-foreground">Search for existing patient or add new</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Start Recording</p>
                    <p className="text-xs text-muted-foreground">AI will transcribe and detect clinical tasks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Review & Accept Tasks</p>
                    <p className="text-xs text-muted-foreground">Approve prescriptions, orders, and referrals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Save Clinical Notes</p>
                    <p className="text-xs text-muted-foreground">AI-generated documentation ready to sign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // After selecting patient - show consultation interface
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Patient Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{patientName}</h2>
              {chiefComplaint && (
                <p className="text-sm text-muted-foreground">Chief Complaint: {chiefComplaint}</p>
              )}
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
                  <MicOff className="h-5 w-5" />
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
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Transcription */}
        <Card className="p-6 h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Live Transcription
            </h3>
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

        {/* AI Detected Tasks */}
        <Card className="p-6 h-[500px] flex flex-col">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            AI-Detected Tasks
            <Badge variant="secondary" className="ml-2">{detectedTasks.length}</Badge>
          </h3>
          
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
                        <h4 className="font-semibold text-foreground mb-1">{task.type}</h4>
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
          </ScrollArea>
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

export default PatientConsultation;
