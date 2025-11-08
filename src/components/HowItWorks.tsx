import { Mic, FileCheck, Send, Activity } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mic,
    title: "Conversation Capture",
    description: "AI listens to doctor-patient conversations and transcribes in real-time with medical context understanding.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Note Generation",
    description: "Automatically creates structured clinical notes in SOAP or custom format—ready for review and approval.",
  },
  {
    number: "03",
    icon: Send,
    title: "Task Detection & Routing",
    description: "Identifies lab orders, prescriptions, referrals, and nursing tasks—then routes them to appropriate systems.",
  },
  {
    number: "04",
    icon: Activity,
    title: "Workflow Integration",
    description: "Seamlessly syncs with hospital EHR, LIS, pharmacy, and billing systems for end-to-end automation.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl font-bold text-foreground">
            How MedFlow Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Four simple steps from conversation to coordinated care
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20" style={{ top: '4rem' }} />
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Step Number */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-elevated relative z-10">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {step.number}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
