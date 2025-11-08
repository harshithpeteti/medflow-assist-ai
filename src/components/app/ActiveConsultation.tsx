import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, StopCircle, Save, User, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ActiveConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();

  const transcript = [
    { speaker: "Doctor", text: "Good morning, how are you feeling today?", time: "10:32" },
    { speaker: "Patient", text: "I've been experiencing some chest discomfort and shortness of breath.", time: "10:32" },
    { speaker: "Doctor", text: "When did these symptoms start?", time: "10:33" },
    { speaker: "Patient", text: "About three days ago. It gets worse when I climb stairs.", time: "10:33" },
    { speaker: "Doctor", text: "Any history of heart problems in your family?", time: "10:34" },
    { speaker: "Patient", text: "Yes, my father had a heart attack at 55.", time: "10:34" },
  ];

  const detectedTasks = [
    { type: "Lab Order", description: "CBC, Lipid Panel, Troponin levels", status: "pending" },
    { type: "Referral", description: "Cardiology consultation - Dr. James Chen", status: "pending" },
    { type: "Prescription", description: "Aspirin 81mg daily", status: "pending" },
  ];

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    setIsPaused(false);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Consultation transcript saved" : "AI is now listening",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Consultation</h1>
          <p className="text-muted-foreground">Real-time AI transcription and task detection</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isRecording ? "default" : "secondary"} className="px-4 py-2">
            {isRecording && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            )}
            {isRecording ? "Recording" : "Ready"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <Card className="lg:col-span-1 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Emma Wilson</h3>
              <p className="text-sm text-muted-foreground">Age 48 • Female</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">MRN</p>
              <p className="font-medium text-foreground">EMW-2024-1142</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visit Type</p>
              <p className="font-medium text-foreground">New Patient Consultation</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chief Complaint</p>
              <p className="font-medium text-foreground">Chest discomfort, Shortness of breath</p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Button 
              onClick={handleToggleRecording}
              variant={isRecording ? "destructive" : "hero"}
              className="w-full gap-2"
              size="lg"
            >
              {isRecording ? (
                <>
                  <StopCircle className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <Button 
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                className="w-full gap-2"
              >
                {isPaused ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}
          </div>
        </Card>

        {/* Transcript */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Transcript
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcript.map((entry, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  entry.speaker === "Doctor" 
                    ? "bg-primary/5 border-l-4 border-primary" 
                    : "bg-muted/50 border-l-4 border-accent"
                } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{entry.speaker}</span>
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                </div>
                <p className="text-foreground">{entry.text}</p>
              </div>
            ))}
            
            {isRecording && (
              <div className="flex items-center gap-2 text-muted-foreground p-4">
                <div className="flex gap-1">
                  <span className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-sm">Listening...</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Auto-Detected Tasks */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">AI-Detected Tasks</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {detectedTasks.map((task, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {task.type}
                </Badge>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <p className="text-sm text-foreground mb-3">{task.description}</p>
              <Button size="sm" variant="outline" className="w-full">
                Review & Approve
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ActiveConsultation;
