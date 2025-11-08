import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Activity } from "lucide-react";
import { toast } from "sonner";

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPReviewModalProps {
  open: boolean;
  onClose: () => void;
  soapNote: SoapNote | null;
  patientName: string;
  patientMRN: string;
  patientDemographics?: any;
  transcript: string;
}

const SOAPReviewModal = ({ open, onClose, soapNote, patientName, patientMRN, patientDemographics, transcript }: SOAPReviewModalProps) => {
  const [editedNote, setEditedNote] = useState<SoapNote | null>(soapNote);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Update editedNote when soapNote prop changes
  useEffect(() => {
    setEditedNote(soapNote);
  }, [soapNote]);

  const handleApprove = () => {
    if (!editedNote) return;

    // Store in localStorage
    const existingNotes = JSON.parse(localStorage.getItem("clinicalNotes") || "[]");
    const newNote = {
      id: Date.now().toString(),
      patientName,
      patientMRN,
      demographics: patientDemographics,
      date: new Date().toISOString(),
      transcript,
      ...editedNote,
    };
    localStorage.setItem("clinicalNotes", JSON.stringify([newNote, ...existingNotes]));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    toast.success("SOAP note approved and saved to Clinical Notes", {
      description: "The note is now available in the Clinical Notes section"
    });
    onClose();
  };

  const handleReject = () => {
    toast.info("SOAP note discarded");
    onClose();
  };

  const updateSection = (section: keyof SoapNote, value: string) => {
    if (!editedNote) return;
    setEditedNote({ ...editedNote, [section]: value });
    setEditingSection(null);
  };

  if (!editedNote) return null;

  const sections = [
    {
      key: "subjective" as keyof SoapNote,
      title: "Subjective",
      subtitle: "Patient's reported symptoms and history",
      color: "blue-500",
      icon: "👤"
    },
    {
      key: "objective" as keyof SoapNote,
      title: "Objective", 
      subtitle: "Clinical findings and measurements",
      color: "green-500",
      icon: "🔬"
    },
    {
      key: "assessment" as keyof SoapNote,
      title: "Assessment",
      subtitle: "Clinical diagnosis and evaluation",
      color: "purple-500",
      icon: "🎯"
    },
    {
      key: "plan" as keyof SoapNote,
      title: "Plan",
      subtitle: "Treatment plan and follow-up",
      color: "orange-500",
      icon: "📋"
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review & Approve SOAP Note</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {patientName} • {patientMRN}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={section.key}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{section.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                      <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  {editingSection === section.key ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedNote[section.key]}
                        onChange={(e) => setEditedNote({ ...editedNote, [section.key]: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingSection(null)}>
                          Done
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditedNote(soapNote);
                            setEditingSection(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card
                      className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setEditingSection(section.key)}
                    >
                      <div className="text-foreground leading-relaxed space-y-4">
                        {editedNote[section.key].split('\n').map((line, idx) => {
                          const trimmedLine = line.trim();
                          
                          // Bold headers (text between **)
                          if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                            const headerText = trimmedLine.replace(/\*\*/g, '');
                            return (
                              <div key={idx} className="flex items-center gap-2 mt-3 mb-2">
                                <div className="w-1.5 h-5 bg-primary rounded-full" />
                                <h4 className="font-bold text-foreground text-base tracking-tight">
                                  {headerText}
                                </h4>
                              </div>
                            );
                          }
                          
                          // Bullet points with •
                          if (trimmedLine.startsWith('•')) {
                            return (
                              <div key={idx} className="flex gap-3 ml-4 group">
                                <span className="text-primary font-bold mt-1 text-lg">•</span>
                                <span className="flex-1 pt-0.5 group-hover:text-primary transition-colors">{trimmedLine.substring(1).trim()}</span>
                              </div>
                            );
                          }
                          
                          // Sub-items with -
                          if (trimmedLine.startsWith('-')) {
                            return (
                              <div key={idx} className="flex gap-3 ml-10">
                                <span className="text-muted-foreground mt-0.5">-</span>
                                <span className="flex-1 text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                              </div>
                            );
                          }
                          
                          // Empty lines for spacing
                          if (!trimmedLine) {
                            return <div key={idx} className="h-2" />;
                          }
                          
                          // Regular paragraph text
                          return <p key={idx} className="text-sm ml-4">{line}</p>;
                        })}
                      </div>
                      <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span>Click anywhere to edit this section</span>
                      </div>
                    </Card>
                  )}
                </div>
                {idx < sections.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject} className="gap-2">
            <XCircle className="h-4 w-4" />
            Discard
          </Button>
          <Button onClick={handleApprove} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approve & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SOAPReviewModal;
