import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Save, Search, User, AlertCircle, Beaker, Pill, UserPlus, Clock, Activity, Syringe, FileText as FileTextIcon, Stethoscope } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DetectedTask | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const { toast } = useToast();

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
            <Badge variant={isRecording ? "default" : "secondary"} className="px-4 py-2">
              {isRecording && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              )}
              {isRecording ? "Recording" : "Ended"}
            </Badge>
            {isRecording && (
              <Button 
                onClick={handleEndConsultation}
                variant="destructive"
                className="gap-2"
                size="lg"
              >
                <MicOff className="h-5 w-5" />
                End Consultation
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SOAP Notes */}
        <Card className="p-6 h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileTextIcon className="h-5 w-5 text-primary" />
              Clinical Documentation
            </h3>
            {conversationEnded && (
              <Button variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save Note
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1">
            {isRecording ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="flex gap-1 mb-4">
                  <span className="w-2 h-8 bg-primary rounded-full animate-pulse" />
                  <span className="w-2 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <p className="text-sm">Listening to consultation...</p>
                <p className="text-xs mt-2">SOAP note will be generated after ending consultation</p>
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
