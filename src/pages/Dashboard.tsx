import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavigation from "@/components/app/AppNavigation";
import PatientConsultation from "@/components/app/PatientConsultation";
import ClinicalNotes from "@/components/app/ClinicalNotes";
import TaskQueue from "@/components/app/TaskQueue";
import PatientList from "@/components/app/PatientList";
import DashboardOverview from "@/components/app/DashboardOverview";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

type View = "overview" | "consultation" | "notes" | "tasks" | "patients";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("overview");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return (
          <DashboardOverview 
            onStartConsultation={() => setCurrentView("consultation")} 
          />
        );
      case "consultation":
        return <PatientConsultation />;
      case "notes":
        return <ClinicalNotes />;
      case "tasks":
        return <TaskQueue />;
      case "patients":
        return <PatientList />;
      default:
        return (
          <DashboardOverview 
            onStartConsultation={() => setCurrentView("consultation")} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto px-6 py-8">
        {renderView()}
      </main>
      <Toaster />
    </div>
  );
};

export default Dashboard;
