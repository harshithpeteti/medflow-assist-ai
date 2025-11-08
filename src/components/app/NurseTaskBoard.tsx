import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CheckCircle, Clock, User, Search, AlertTriangle, Pill, Syringe, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NurseTask {
  id: string;
  patientName: string;
  patientRoom: string;
  taskType: "vitals" | "medication" | "monitoring" | "general";
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignedBy: string;
  assignedAt: string;
  dueTime?: string;
  status: "pending" | "in-progress" | "completed";
  notes?: string;
}

const NurseTaskBoard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"pending" | "in-progress" | "completed">("pending");
  const { toast } = useToast();

  const tasks: NurseTask[] = [
    {
      id: "1",
      patientName: "Emma Wilson",
      patientRoom: "Room 301",
      taskType: "vitals",
      description: "Monitor vitals every 4 hours",
      priority: "high",
      assignedBy: "Dr. Smith",
      assignedAt: "10:35 AM",
      dueTime: "2:00 PM",
      status: "pending"
    },
    {
      id: "2",
      patientName: "Emma Wilson",
      patientRoom: "Room 301",
      taskType: "medication",
      description: "Stop IV antibiotics, start oral meds",
      priority: "urgent",
      assignedBy: "Dr. Smith",
      assignedAt: "10:36 AM",
      dueTime: "11:00 AM",
      status: "pending"
    },
    {
      id: "3",
      patientName: "John Davis",
      patientRoom: "Room 205",
      taskType: "medication",
      description: "Administer insulin injection",
      priority: "high",
      assignedBy: "Dr. Johnson",
      assignedAt: "9:15 AM",
      dueTime: "12:00 PM",
      status: "in-progress"
    },
    {
      id: "4",
      patientName: "Sarah Johnson",
      patientRoom: "Room 412",
      taskType: "monitoring",
      description: "Monitor oxygen saturation continuously",
      priority: "medium",
      assignedBy: "Dr. Williams",
      assignedAt: "8:30 AM",
      status: "in-progress"
    },
    {
      id: "5",
      patientName: "Michael Brown",
      patientRoom: "Room 108",
      taskType: "general",
      description: "Change wound dressing",
      priority: "medium",
      assignedBy: "Dr. Davis",
      assignedAt: "Yesterday",
      status: "completed",
      notes: "Wound healing well, no signs of infection"
    },
  ];

  const getTasksByStatus = (status: "pending" | "in-progress" | "completed") => {
    return tasks.filter(task => task.status === status);
  };

  const getTaskIcon = (type: NurseTask["taskType"]) => {
    switch (type) {
      case "vitals":
        return { icon: Thermometer, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "medication":
        return { icon: Pill, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "monitoring":
        return { icon: Activity, color: "text-green-500", bg: "bg-green-500/10" };
      case "general":
        return { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" };
    }
  };

  const getPriorityBadge = (priority: NurseTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: "Task Updated",
        description: `${task.description} marked as ${newStatus.replace("-", " ")}`,
      });
    }
  };

  const TaskCard = ({ task }: { task: NurseTask }) => {
    const taskStyle = getTaskIcon(task.taskType);
    const Icon = taskStyle.icon;

    return (
      <Card className="p-4 hover:shadow-md transition-all animate-fade-in">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${taskStyle.bg} flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${taskStyle.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{task.patientName}</h3>
                  {getPriorityBadge(task.priority)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{task.patientRoom}</p>
                <p className="text-sm text-foreground mb-2">{task.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Assigned by: {task.assignedBy}</span>
                  <span>•</span>
                  <span>{task.assignedAt}</span>
                  {task.dueTime && (
                    <>
                      <span>•</span>
                      <span className="font-medium">Due: {task.dueTime}</span>
                    </>
                  )}
                </div>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">Note: {task.notes}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {task.status === "pending" && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(task.id, "in-progress")}
                >
                  Start Task
                </Button>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleUpdateStatus(task.id, "completed")}
                >
                  Mark Complete
                </Button>
              </>
            )}
            {task.status === "in-progress" && (
              <Button 
                size="sm" 
                variant="default"
                className="flex-1"
                onClick={() => handleUpdateStatus(task.id, "completed")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            {task.status === "completed" && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nurse Task Board</h1>
          <p className="text-muted-foreground">Manage patient care tasks and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-2">
            {getTasksByStatus("pending").length} Pending
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-2">
            {getTasksByStatus("in-progress").length} In Progress
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Task Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({getTasksByStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2">
            <Clock className="h-4 w-4" />
            In Progress ({getTasksByStatus("in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({getTasksByStatus("completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {getTasksByStatus("pending").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="space-y-4">
            {getTasksByStatus("in-progress").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {getTasksByStatus("completed").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NurseTaskBoard;
