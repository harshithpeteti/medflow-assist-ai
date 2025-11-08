import { useState } from "react";
import AppNavigation from "@/components/app/AppNavigation";
import PatientConsultation from "@/components/app/PatientConsultation";
import ClinicalNotes from "@/components/app/ClinicalNotes";
import TaskQueue from "@/components/app/TaskQueue";
import PatientList from "@/components/app/PatientList";
import DashboardOverview from "@/components/app/DashboardOverview";
import NurseTaskBoard from "@/components/app/NurseTaskBoard";

type View = "overview" | "consultation" | "notes" | "tasks" | "patients" | "nurse";
type ConsultationMode = "outpatient" | "inpatient";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("overview");
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>("outpatient");

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return (
          <DashboardOverview 
            onStartConsultation={(mode) => {
              setConsultationMode(mode);
              setCurrentView("consultation");
            }} 
          />
        );
      case "consultation":
        return <PatientConsultation mode={consultationMode} />;
      case "notes":
        return <ClinicalNotes />;
      case "tasks":
        return <TaskQueue />;
      case "patients":
        return <PatientList />;
      case "nurse":
        return <NurseTaskBoard />;
      default:
        return (
          <DashboardOverview 
            onStartConsultation={(mode) => {
              setConsultationMode(mode);
              setCurrentView("consultation");
            }} 
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
    </div>
  );
};

export default Dashboard;
