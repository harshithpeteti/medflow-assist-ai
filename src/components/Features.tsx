import { FileText, Workflow, Users, BarChart3, Clock, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Clinical Note Generation",
    description: "AI listens, transcribes, and creates structured notes in SOAP or your preferred format—instantly.",
  },
  {
    icon: Workflow,
    title: "Automated Task Routing",
    description: "Automatically generates lab requests, referrals, prescriptions, and schedules based on conversation.",
  },
  {
    icon: Users,
    title: "Nurse Task Integration",
    description: "Routes care instructions to nurse dashboards with patient details, timing, and priority tracking.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Gain insights into workload, patient outcomes, and process efficiency to optimize care delivery.",
  },
  {
    icon: Clock,
    title: "Real-Time Processing",
    description: "Instant conversion from speech to action—no delays, no manual entry, no errors.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security ensuring patient data privacy and regulatory compliance.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl font-bold text-foreground">
            Everything You Need for Seamless Clinical Workflows
          </h2>
          <p className="text-xl text-muted-foreground">
            From conversation to coordination—MedFlow handles the entire clinical documentation and task management process.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-card border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
