import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Beaker, Pill, UserPlus, Clock, Check, X } from "lucide-react";

interface DetectedTask {
  id: string;
  type: "Lab Order" | "Prescription" | "Referral" | "Follow-up";
  description: string;
  reason: string;
  details: any;
  status: "pending" | "reviewed" | "sent";
  timestamp: string;
}

interface TaskReviewModalProps {
  task: DetectedTask;
  onClose: () => void;
  onAccept: (task: DetectedTask) => void;
}

const TaskReviewModal = ({ task, onClose, onAccept }: TaskReviewModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTaskIcon = (type: DetectedTask["type"]) => {
    switch (type) {
      case "Lab Order":
        return { icon: Beaker, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "Prescription":
        return { icon: Pill, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "Referral":
        return { icon: UserPlus, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "Follow-up":
        return { icon: Clock, color: "text-green-500", bg: "bg-green-500/10" };
    }
  };

  const taskStyle = getTaskIcon(task.type);
  const Icon = taskStyle.icon;

  const renderTaskDetails = () => {
    switch (task.type) {
      case "Lab Order":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Ordered Tests</h4>
              <div className="space-y-2">
                {task.details.tests.map((test: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{test}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Urgency</p>
                <Badge variant="outline">{task.details.urgency}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time Ordered</p>
                <p className="text-sm font-medium text-foreground">{task.timestamp}</p>
              </div>
            </div>
            {task.details.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                <p className="text-sm text-foreground">{task.details.notes}</p>
              </div>
            )}
          </div>
        );

      case "Prescription":
        return (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Medication</p>
                  <p className="text-lg font-semibold text-foreground">{task.details.medication}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dosage</p>
                    <p className="text-sm font-medium text-foreground">{task.details.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                    <p className="text-sm font-medium text-foreground">{task.details.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-medium text-foreground">{task.details.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="text-sm font-medium text-foreground">{task.timestamp}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Instructions</p>
                  <p className="text-sm text-foreground">{task.details.instructions}</p>
                </div>
              </div>
            </Card>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Send to Pharmacy</p>
              <p className="text-sm font-medium text-foreground">{task.details.pharmacy}</p>
            </div>
          </div>
        );

      case "Referral":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Specialty</p>
                <p className="text-base font-semibold text-foreground">{task.details.specialist}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Physician</p>
                <p className="text-base font-semibold text-foreground">{task.details.doctor}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <Badge variant={task.details.priority === "Urgent" ? "destructive" : "secondary"}>
                {task.details.priority}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Referral Reason</p>
              <p className="text-sm text-foreground">{task.details.reason}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`transition-all duration-300 ${isExpanded ? 'max-w-3xl' : 'max-w-2xl'}`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${taskStyle.bg}`}>
              <Icon className={`h-6 w-6 ${taskStyle.color}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{task.type}</DialogTitle>
              <DialogDescription className="text-sm">{task.description}</DialogDescription>
            </div>
            <Badge variant="secondary">{task.timestamp}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Clinical Reasoning */}
          <Card className="p-4 bg-accent/5 border-accent/20">
            <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              Clinical Reasoning
            </h4>
            <p className="text-sm text-foreground">{task.reason}</p>
          </Card>

          {/* Task-specific Details */}
          <div 
            className={`transition-all duration-300 ${isExpanded ? 'scale-105' : 'scale-100'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
          >
            {renderTaskDetails()}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={() => onAccept(task)} className="gap-2">
            <Check className="h-4 w-4" />
            Accept & Send to {task.type === "Prescription" ? "Pharmacy" : task.type === "Lab Order" ? "Lab" : "Specialist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReviewModal;
