import { Stethoscope, Heart, Pill, FlaskConical, UserCog, Users2 } from "lucide-react";

const userTypes = [
  {
    icon: Stethoscope,
    title: "Doctors & GPs",
    description: "Focus on patients while AI handles documentation and task generation.",
    type: "Primary",
  },
  {
    icon: Heart,
    title: "Nurses",
    description: "Receive clear, prioritized care tasks with complete patient context.",
    type: "Primary",
  },
  {
    icon: Pill,
    title: "Pharmacists",
    description: "Get accurate prescriptions instantly without manual transcription.",
    type: "Secondary",
  },
  {
    icon: FlaskConical,
    title: "Lab Technicians",
    description: "Receive detailed test orders directly from physician conversations.",
    type: "Secondary",
  },
  {
    icon: UserCog,
    title: "Admin Staff",
    description: "Automatic billing codes and appointment scheduling from encounters.",
    type: "Secondary",
  },
  {
    icon: Users2,
    title: "Patients",
    description: "Benefit from faster, more coordinated, and error-free care delivery.",
    type: "Tertiary",
  },
];

const Users = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl font-bold text-foreground">
            Built for Every Healthcare Professional
          </h2>
          <p className="text-xl text-muted-foreground">
            MedFlow streamlines workflows across the entire care team—from physicians to administrative staff
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTypes.map((user, index) => (
            <div 
              key={index}
              className="group relative p-6 rounded-xl border border-border bg-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-primary transition-all duration-300">
                  <user.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{user.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {user.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Users;
