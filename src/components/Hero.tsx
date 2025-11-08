import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-medical-ai.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                AI-Powered Clinical Assistant
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Transform Medical Conversations into{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Automated Workflows
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              MedFlow uses AI to convert doctor-patient conversations into structured notes, 
              automated lab requests, prescriptions, and coordinated care tasks—reducing 
              documentation time and minimizing errors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={() => window.location.href = '/app'}>
                Try Demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">70%</div>
                <div className="text-sm text-muted-foreground">Less Documentation Time</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Always Available</div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative animate-fade-in lg:block hidden">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img 
                src={heroImage} 
                alt="AI-powered medical workflow interface showing patient data and automated task management"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-elevated animate-float">
              <div className="text-sm font-medium text-foreground">Active Sessions</div>
              <div className="text-2xl font-bold text-primary">247</div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-elevated animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-sm font-medium text-foreground">Time Saved Today</div>
              <div className="text-2xl font-bold text-accent">12.4 hrs</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
};

export default Hero;
