import { AlertCircle, Clock, FileX, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Clock,
    stat: "50%",
    label: "of physician time spent on documentation instead of patient care",
  },
  {
    icon: FileX,
    stat: "30%",
    label: "error rate in manual data entry across clinical workflows",
  },
  {
    icon: TrendingDown,
    stat: "45%",
    label: "of healthcare professionals report burnout from administrative burden",
  },
];

const Problem = () => {
  return (
    <section className="py-24 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 text-destructive font-medium">
              <AlertCircle className="h-5 w-5" />
              <span>The Challenge</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Healthcare Workers Spend More Time on Paperwork Than Patients
            </h2>
            <p className="text-xl text-muted-foreground">
              Manual documentation and fragmented systems create inefficiency, errors, and burnout across the healthcare workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-2">
                  <problem.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold text-destructive">{problem.stat}</div>
                <p className="text-muted-foreground">{problem.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
