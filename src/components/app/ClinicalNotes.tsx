import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Download, Calendar, User } from "lucide-react";

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
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{selectedNote.patientName}</h1>
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      SOAP Note
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Completed
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedNote.date)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">MRN: {selectedNote.patientMRN}</p>
                  
                  {selectedNote.demographics && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedNote.demographics.age && (
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">Age:</span> {selectedNote.demographics.age}
                        </span>
                      )}
                      {selectedNote.demographics.gender && (
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">Gender:</span> {selectedNote.demographics.gender}
                        </span>
                      )}
                      {selectedNote.demographics.smoker && selectedNote.demographics.smoker !== "No" && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Smoker: {selectedNote.demographics.smoker}
                        </Badge>
                      )}
                      {selectedNote.demographics.diabetes === "Yes" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          Diabetes
                        </Badge>
                      )}
                      {selectedNote.demographics.hypertension === "Yes" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          Hypertension
                        </Badge>
                      )}
                      {selectedNote.demographics.allergies && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Allergies: {selectedNote.demographics.allergies}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 max-w-4xl">
              {[
                { title: "Subjective", content: selectedNote.subjective, subtitle: "Patient's reported symptoms and history" },
                { title: "Objective", content: selectedNote.objective, subtitle: "Clinical findings and measurements" },
                { title: "Assessment", content: selectedNote.assessment, subtitle: "Clinical diagnosis and evaluation" },
                { title: "Plan", content: selectedNote.plan, subtitle: "Treatment plan and follow-up" },
              ].map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-gradient-primary rounded-full" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                      <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  <Card className="p-5 bg-muted/30 border-l-4 border-l-primary">
                    <div className="text-foreground leading-relaxed space-y-2">
                      {section.content.split('\n').map((line, lineIdx) => {
                        if (line.trim().startsWith('•')) {
                          return (
                            <div key={lineIdx} className="flex gap-3">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              <span className="flex-1">{line.substring(1).trim()}</span>
                            </div>
                          );
                        } else if (line.trim().startsWith('-')) {
                          return (
                            <div key={lineIdx} className="flex gap-3 ml-6">
                              <span className="text-muted-foreground">-</span>
                              <span className="flex-1 text-sm">{line.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        return line.trim() ? <p key={lineIdx}>{line}</p> : <div key={lineIdx} className="h-1" />;
                      })}
                    </div>
                  </Card>
                  
                  {idx < 3 && <Separator className="my-4" />}
                </div>
              ))}
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
