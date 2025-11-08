import { useState } from "react";
import AppNavigation from "@/components/app/AppNavigation";
import ActiveConsultation from "@/components/app/ActiveConsultation";
import ClinicalNotes from "@/components/app/ClinicalNotes";
import TaskQueue from "@/components/app/TaskQueue";
import PatientList from "@/components/app/PatientList";
import DashboardOverview from "@/components/app/DashboardOverview";

type View = "overview" | "consultation" | "notes" | "tasks" | "patients";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("consultation");

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <DashboardOverview onStartConsultation={() => setCurrentView("consultation")} />;
      case "consultation":
        return <ActiveConsultation />;
      case "notes":
        return <ClinicalNotes />;
      case "tasks":
        return <TaskQueue />;
      case "patients":
        return <PatientList />;
      default:
        return <DashboardOverview onStartConsultation={() => setCurrentView("consultation")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto px-6 py-8">
        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;
