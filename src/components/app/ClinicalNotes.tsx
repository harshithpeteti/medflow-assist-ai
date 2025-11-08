import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Download, Calendar, User } from "lucide-react";

const ClinicalNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<number>(1);

  const notes = [
    {
      id: 1,
      patient: "Emma Wilson",
      date: "2024-01-15",
      time: "10:30 AM",
      type: "SOAP Note",
      status: "completed",
      preview: "S: Patient presents with chest discomfort and shortness of breath for 3 days. Symptoms worsen with exertion...",
      fullNote: `Subjective:
Patient presents with chest discomfort and shortness of breath for 3 days. Symptoms worsen with exertion. No fever, cough, or leg swelling. Patient denies recent travel or prolonged immobility.

Objective:
Vital Signs: BP 142/88, HR 92, RR 18, Temp 98.6°F, SpO2 96% on room air
Physical Exam: Alert and oriented. Mild respiratory distress. Lungs clear to auscultation bilaterally. Heart regular rate and rhythm, no murmurs. No peripheral edema.

Assessment:
1. Chest pain - likely cardiac etiology, rule out acute coronary syndrome
2. Shortness of breath - multifactorial (cardiac vs pulmonary)
3. Hypertension - suboptimal control

Plan:
1. Order EKG, troponin levels, BNP, chest X-ray
2. Start aspirin 325mg, nitroglycerin as needed
3. Cardiology consult
4. Adjust antihypertensive medication
5. Monitor vital signs q4h
6. Patient education on warning signs`,
    },
    {
      id: 2,
      patient: "John Davis",
      date: "2024-01-15",
      time: "9:15 AM",
      type: "Follow-up",
      status: "completed",
      preview: "S: Patient returns for follow-up on hypertension management. Reports good medication compliance...",
      fullNote: `Subjective:
Patient returns for follow-up on hypertension management. Reports good medication compliance. Home BP readings averaging 128/82.

Objective:
BP today: 130/84, HR 68
Labs: Normal renal function, electrolytes within normal limits

Assessment:
Hypertension - improved control on current regimen

Plan:
Continue current medications. Follow up in 3 months.`,
    },
    {
      id: 3,
      patient: "Sarah Johnson",
      date: "2024-01-14",
      time: "3:30 PM",
      type: "SOAP Note",
      status: "completed",
      preview: "S: Annual physical examination. Patient reports no new concerns. General health status good...",
      fullNote: `Subjective:
Annual physical examination. Patient reports no new concerns. General health status good. Maintaining active lifestyle.

Objective:
Vital Signs: All within normal limits
Physical Exam: Unremarkable. All systems normal.

Assessment:
Healthy adult, routine health maintenance

Plan:
Continue current lifestyle. Schedule next annual exam.`,
    },
    {
      id: 4,
      patient: "Michael Brown",
      date: "2024-01-14",
      time: "2:00 PM",
      type: "Consultation",
      status: "draft",
      preview: "S: Patient complains of persistent lower back pain for 2 weeks. No trauma history...",
      fullNote: `Subjective:
Patient complains of persistent lower back pain for 2 weeks. No trauma history. Pain radiates down left leg.

Objective:
Limited range of motion in lumbar spine. Positive straight leg raise test on left.

Assessment:
Likely lumbar radiculopathy

Plan:
MRI lumbar spine. Physical therapy referral. NSAIDs for pain management.`,
    },
  ];

  const selectedNote = notes.find(n => n.id === selectedNoteId);

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
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedNoteId === note.id ? "bg-muted border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{note.patient}</h3>
                    <Badge 
                      variant={note.status === "completed" ? "default" : "secondary"}
                      className={`text-xs ${note.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}`}
                    >
                      {note.status === "completed" ? "Done" : "Draft"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{note.date}</span>
                    <span>•</span>
                    <span>{note.time}</span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {note.type}
                  </Badge>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Section - Note Content */}
      {selectedNote && (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{selectedNote.patient}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {selectedNote.type}
                    </Badge>
                    <Badge 
                      variant={selectedNote.status === "completed" ? "default" : "secondary"}
                      className={selectedNote.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                    >
                      {selectedNote.status === "completed" ? "Completed" : "Draft"}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedNote.date} at {selectedNote.time}</span>
                    </div>
                  </div>
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
              {selectedNote.fullNote.split('\n\n').map((section, idx) => {
                const lines = section.split('\n');
                const title = lines[0].replace(':', '');
                const content = lines.slice(1).join('\n');
                
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-10 bg-gradient-primary rounded-full" />
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">
                          {title === 'Subjective' && 'Patient\'s reported symptoms and history'}
                          {title === 'Objective' && 'Clinical findings and measurements'}
                          {title === 'Assessment' && 'Clinical diagnosis and evaluation'}
                          {title === 'Plan' && 'Treatment plan and follow-up'}
                        </p>
                      </div>
                    </div>
                    
                    <Card className="p-5 bg-muted/30 border-l-4 border-l-primary">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                        {content}
                      </p>
                    </Card>
                    
                    {idx < selectedNote.fullNote.split('\n\n').length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default ClinicalNotes;
