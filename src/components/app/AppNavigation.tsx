import { Activity, LayoutDashboard, FileText, ClipboardList, Users, Settings, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type View = "overview" | "consultation" | "notes" | "tasks" | "patients" | "nurse";

interface AppNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const AppNavigation = ({ currentView, onViewChange }: AppNavigationProps) => {
  const navItems = [
    { id: "overview" as View, icon: LayoutDashboard, label: "Dashboard" },
    { id: "consultation" as View, icon: Activity, label: "Live Consultation" },
    { id: "notes" as View, icon: FileText, label: "Clinical Notes" },
    { id: "tasks" as View, icon: ClipboardList, label: "Tasks & Workflows" },
    { id: "patients" as View, icon: Users, label: "Patients" },
    { id: "nurse" as View, icon: Stethoscope, label: "Nurse Board" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">MedFlow</span>
              <p className="text-xs text-muted-foreground">AI Clinical Assistant</p>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                onClick={() => onViewChange(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            ))}
          </div>
          
          {/* User Section */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">Dr. Sarah Mitchell</p>
                <p className="text-xs text-muted-foreground">General Practice</p>
              </div>
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Dr. Sarah Mitchell" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex lg:hidden gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              size="sm"
              className="gap-2 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AppNavigation;
