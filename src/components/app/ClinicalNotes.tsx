import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Download, Calendar, User, Phone, Heart, Activity, Pill, AlertTriangle } from "lucide-react";

interface StoredNote {
  id: string;
  patientName: string;
  patientMRN: string;
  demographics?: any;
  date: string;
  transcript: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const ClinicalNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<StoredNote[]>([]);

  useEffect(() => {
    // Load notes from localStorage and refresh when component mounts
    const loadNotes = () => {
      const storedNotes = JSON.parse(localStorage.getItem("clinicalNotes") || "[]");
      setNotes(storedNotes);
      if (storedNotes.length > 0 && !selectedNoteId) {
        setSelectedNoteId(storedNotes[0].id);
      }
    };
    
    loadNotes();
    
    // Listen for storage events to refresh when new notes are added
    const handleStorageChange = () => {
      loadNotes();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.patientMRN.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 animate-fade-in">
      {/* Left Sidebar - Notes List (Email-like) */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Clinical Notes</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">All</Button>
            <Button variant="ghost" size="sm">SOAP</Button>
            <Button variant="ghost" size="sm">Follow-up</Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedNoteId === note.id ? "bg-muted border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">{note.patientName}</h3>
                      <Badge 
                        variant="default"
                        className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(note.date)}</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      SOAP Note
                    </Badge>
                    
                    <p className="text-xs text-muted-foreground">{note.patientMRN}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {searchQuery 
                  ? "No notes found matching your search."
                  : "No notes yet. Complete a consultation to create your first note."}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Section - Note Content */}
      {selectedNote ? (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-8 max-w-5xl mx-auto space-y-8">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-1">{selectedNote.patientName}</h1>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Clinical Note
                        </Badge>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          ✓ Completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              <Separator />

              {/* Patient Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Patient Information
                </h2>
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical Record Number</p>
                      <p className="text-sm font-semibold text-foreground">{selectedNote.patientMRN}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Visit Date
                      </p>
                      <p className="text-sm font-semibold text-foreground">{formatDate(selectedNote.date)}</p>
                    </div>
                    {selectedNote.demographics?.age && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age</p>
                        <p className="text-sm font-semibold text-foreground">{selectedNote.demographics.age} years</p>
                      </div>
                    )}
                    {selectedNote.demographics?.gender && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</p>
                        <p className="text-sm font-semibold text-foreground">{selectedNote.demographics.gender}</p>
                      </div>
                    )}
                    {selectedNote.demographics?.phone && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Contact
                        </p>
                        <p className="text-sm font-semibold text-foreground">{selectedNote.demographics.phone}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Medical History & Alerts */}
              {selectedNote.demographics && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Medical History & Alerts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedNote.demographics.allergies && (
                      <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-500/5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">Allergies</p>
                            <p className="text-sm text-muted-foreground">{selectedNote.demographics.allergies}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    
                    {(selectedNote.demographics.diabetes === "Yes" || selectedNote.demographics.hypertension === "Yes" || selectedNote.demographics.smoker !== "No") && (
                      <Card className="p-4 border-l-4 border-l-red-500 bg-red-500/5">
                        <div className="flex items-start gap-3">
                          <Activity className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Chronic Conditions</p>
                            <div className="space-y-1">
                              {selectedNote.demographics.diabetes === "Yes" && (
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 mr-2">
                                  Diabetes
                                </Badge>
                              )}
                              {selectedNote.demographics.hypertension === "Yes" && (
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 mr-2">
                                  Hypertension
                                </Badge>
                              )}
                              {selectedNote.demographics.smoker && selectedNote.demographics.smoker !== "No" && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                  Smoker: {selectedNote.demographics.smoker}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Clinical Documentation */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Clinical Documentation
                </h2>

                {/* Subjective - Chief Complaint & History */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Chief Complaint & History</h3>
                      <p className="text-xs text-muted-foreground">Patient-reported symptoms, history, and concerns</p>
                    </div>
                  </div>
                  <Card className="p-6 bg-gradient-to-br from-blue-500/5 via-background to-background border-l-4 border-l-blue-500">
                    <div className="prose prose-sm max-w-none">
                      {selectedNote.subjective.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                          return (
                            <h4 key={idx} className="font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                              <span className="w-1 h-4 bg-blue-500 rounded" />
                              {trimmedLine.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        if (trimmedLine.startsWith('•')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-2 mb-2">
                              <span className="text-blue-500 font-bold">•</span>
                              <span className="text-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (trimmedLine.startsWith('-')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-8 mb-1">
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (!trimmedLine) return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-sm text-foreground mb-2">{line}</p>;
                      })}
                    </div>
                  </Card>
                </div>

                {/* Objective - Physical Exam & Findings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Physical Examination & Findings</h3>
                      <p className="text-xs text-muted-foreground">Objective clinical observations and measurements</p>
                    </div>
                  </div>
                  <Card className="p-6 bg-gradient-to-br from-purple-500/5 via-background to-background border-l-4 border-l-purple-500">
                    <div className="prose prose-sm max-w-none">
                      {selectedNote.objective.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                          return (
                            <h4 key={idx} className="font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                              <span className="w-1 h-4 bg-purple-500 rounded" />
                              {trimmedLine.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        if (trimmedLine.startsWith('•')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-2 mb-2">
                              <span className="text-purple-500 font-bold">•</span>
                              <span className="text-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (trimmedLine.startsWith('-')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-8 mb-1">
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (!trimmedLine) return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-sm text-foreground mb-2">{line}</p>;
                      })}
                    </div>
                  </Card>
                </div>

                {/* Assessment - Diagnosis */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Clinical Assessment & Diagnosis</h3>
                      <p className="text-xs text-muted-foreground">Medical evaluation and diagnostic conclusions</p>
                    </div>
                  </div>
                  <Card className="p-6 bg-gradient-to-br from-orange-500/5 via-background to-background border-l-4 border-l-orange-500">
                    <div className="prose prose-sm max-w-none">
                      {selectedNote.assessment.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                          return (
                            <h4 key={idx} className="font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                              <span className="w-1 h-4 bg-orange-500 rounded" />
                              {trimmedLine.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        if (trimmedLine.startsWith('•')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-2 mb-2">
                              <span className="text-orange-500 font-bold">•</span>
                              <span className="text-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (trimmedLine.startsWith('-')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-8 mb-1">
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (!trimmedLine) return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-sm text-foreground mb-2">{line}</p>;
                      })}
                    </div>
                  </Card>
                </div>

                {/* Plan - Treatment Plan */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Treatment Plan & Follow-up</h3>
                      <p className="text-xs text-muted-foreground">Recommended treatments, medications, and next steps</p>
                    </div>
                  </div>
                  <Card className="p-6 bg-gradient-to-br from-green-500/5 via-background to-background border-l-4 border-l-green-500">
                    <div className="prose prose-sm max-w-none">
                      {selectedNote.plan.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                          return (
                            <h4 key={idx} className="font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                              <span className="w-1 h-4 bg-green-500 rounded" />
                              {trimmedLine.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        if (trimmedLine.startsWith('•')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-2 mb-2">
                              <span className="text-green-500 font-bold">•</span>
                              <span className="text-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (trimmedLine.startsWith('-')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-8 mb-1">
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (!trimmedLine) return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-sm text-foreground mb-2">{line}</p>;
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            {notes.length === 0 
              ? "No clinical notes yet. Complete a consultation to create your first note."
              : "Select a note from the list to view details"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default ClinicalNotes;
