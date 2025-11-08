import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Calendar, FileText, Plus } from "lucide-react";

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const patients = [
    {
      id: 1,
      name: "Emma Wilson",
      age: 48,
      gender: "Female",
      mrn: "EMW-2024-1142",
      lastVisit: "Today, 10:30 AM",
      status: "active",
      notes: 3,
      conditions: ["Hypertension", "Type 2 Diabetes"],
    },
    {
      id: 2,
      name: "John Davis",
      age: 62,
      gender: "Male",
      mrn: "JDA-2023-0892",
      lastVisit: "Today, 9:15 AM",
      status: "active",
      notes: 12,
      conditions: ["Hypertension"],
    },
    {
      id: 3,
      name: "Sarah Johnson",
      age: 35,
      gender: "Female",
      mrn: "SJO-2024-0234",
      lastVisit: "Yesterday, 3:30 PM",
      status: "active",
      notes: 5,
      conditions: ["Asthma"],
    },
    {
      id: 4,
      name: "Michael Brown",
      age: 45,
      gender: "Male",
      mrn: "MBR-2024-0567",
      lastVisit: "Jan 12, 2:00 PM",
      status: "scheduled",
      notes: 8,
      conditions: ["Back Pain"],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Records</h1>
          <p className="text-muted-foreground">Manage and view patient information</p>
        </div>
        <Button variant="hero" className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, MRN, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Patient Cards */}
      <div className="grid gap-4">
        {patients.map((patient, index) => (
          <Card 
            key={patient.id}
            className="p-6 hover:shadow-elevated transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Patient Avatar and Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                    <Badge 
                      variant={patient.status === "active" ? "default" : "secondary"}
                      className={patient.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                    >
                      {patient.status === "active" ? "Active" : "Scheduled"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{patient.age} • {patient.gender}</span>
                    <span>MRN: {patient.mrn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Last visit: {patient.lastVisit}
                  </div>
                </div>
              </div>

              {/* Middle Section - Conditions */}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patient.conditions.map((condition, idx) => (
                    <Badge key={idx} variant="outline" className="bg-muted/50">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex flex-col gap-2 lg:items-end justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{patient.notes} notes</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Records
                  </Button>
                  <Button variant="default" size="sm">
                    New Visit
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
