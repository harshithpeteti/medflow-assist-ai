import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Eye } from "lucide-react";

const ClinicalNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    {
      id: 1,
      patient: "Emma Wilson",
      date: "2024-01-15",
      time: "10:30 AM",
      type: "SOAP Note",
      status: "completed",
      preview: "S: Patient presents with chest discomfort and shortness of breath for 3 days. Symptoms worsen with exertion...",
    },
    {
      id: 2,
      patient: "John Davis",
      date: "2024-01-15",
      time: "9:15 AM",
      type: "Follow-up",
      status: "completed",
      preview: "S: Patient returns for follow-up on hypertension management. Reports good medication compliance...",
    },
    {
      id: 3,
      patient: "Sarah Johnson",
      date: "2024-01-14",
      time: "3:30 PM",
      type: "SOAP Note",
      status: "completed",
      preview: "S: Annual physical examination. Patient reports no new concerns. General health status good...",
    },
    {
      id: 4,
      patient: "Michael Brown",
      date: "2024-01-14",
      time: "2:00 PM",
      type: "Consultation",
      status: "draft",
      preview: "S: Patient complains of persistent lower back pain for 2 weeks. No trauma history...",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinical Notes</h1>
          <p className="text-muted-foreground">AI-generated documentation from consultations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, date, or note type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">All Notes</Button>
            <Button variant="ghost">SOAP</Button>
            <Button variant="ghost">Follow-up</Button>
            <Button variant="ghost">Consultation</Button>
          </div>
        </div>
      </Card>

      {/* Notes List */}
      <div className="grid gap-4">
        {notes.map((note, index) => (
          <Card 
            key={note.id}
            className="p-6 hover:shadow-elevated transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">{note.patient}</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {note.type}
                  </Badge>
                  <Badge 
                    variant={note.status === "completed" ? "default" : "secondary"}
                    className={note.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                  >
                    {note.status === "completed" ? "Completed" : "Draft"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{note.preview}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {note.date}
                  </span>
                  <span>{note.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClinicalNotes;
