import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, Mic, Hospital, BedDouble, ArrowRight, Users, ClipboardList } from "lucide-react";

type ConsultationMode = "outpatient" | "inpatient";

interface DashboardOverviewProps {
  onStartConsultation: (mode: ConsultationMode) => void;
}

const DashboardOverview = ({ onStartConsultation }: DashboardOverviewProps) => {
  const stats = [
    {
      label: "Patients Today",
      value: "12",
      change: "+3 from yesterday",
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Notes Generated",
      value: "28",
      change: "70% time saved",
      icon: FileText,
      color: "text-accent",
    },
    {
      label: "Active Tasks",
      value: "8",
      change: "2 high priority",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Completed Today",
      value: "34",
      change: "+12% efficiency",
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

  const recentPatients = [
    { name: "John Davis", time: "10:30 AM", status: "Completed", type: "Follow-up" },
    { name: "Emma Wilson", time: "11:15 AM", status: "In Progress", type: "New Patient" },
    { name: "Michael Brown", time: "2:00 PM", status: "Scheduled", type: "Annual Check" },
  ];

  const pendingTasks = [
    { title: "Lab Results - John Davis", priority: "High", type: "Review Required" },
    { title: "Prescription Refill - Sarah Johnson", priority: "Medium", type: "Pharmacy" },
    { title: "Referral Letter - Emma Wilson", priority: "High", type: "Cardiology" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-primary-foreground shadow-elevated">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Dr. Mitchell</h1>
          <p className="text-primary-foreground/90">Select consultation type to begin your workflow</p>
        </div>
      </div>

      {/* Consultation Mode Selection */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Start New Consultation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Outpatient Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-elevated cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <Hospital className="h-8 w-8 text-primary" />
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  Single Visit
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Outpatient Care</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For patients visiting the clinic for diagnosis, treatment, or follow-up without hospital admission.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Typical workflows:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Consultation & examination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Lab orders & prescriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Specialist referrals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Follow-up scheduling</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => onStartConsultation("outpatient")}
                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                size="lg"
              >
                <Mic className="h-5 w-5" />
                Start Outpatient Consultation
                <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* Inpatient Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-elevated cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <BedDouble className="h-8 w-8 text-accent" />
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Multi-Day Stay
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Inpatient Care</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For admitted patients requiring continuous monitoring, treatment, and coordinated care across multiple teams.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Typical workflows:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Daily rounds & progress notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Nurse task coordination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Multi-department orders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>Continuous vital monitoring</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => onStartConsultation("inpatient")}
                className="w-full gap-2 group-hover:bg-accent group-hover:text-accent-foreground"
                size="lg"
              >
                <Mic className="h-5 w-5" />
                Start Inpatient Rounds
                <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="p-6 hover:shadow-elevated transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Today's Schedule</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentPatients.map((patient, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.type}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-foreground">{patient.time}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    patient.status === "Completed" ? "bg-green-500/10 text-green-500" :
                    patient.status === "In Progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Pending Tasks</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {pendingTasks.map((task, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className={`mt-1 ${
                  task.priority === "High" ? "text-orange-500" : "text-muted-foreground"
                }`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  task.priority === "High" 
                    ? "bg-orange-500/10 text-orange-500" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
