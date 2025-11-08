import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
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
      color: "primary",
    },
    {
      key: "objective" as keyof SoapNote,
      title: "Objective",
      subtitle: "Clinical findings and measurements",
      color: "accent",
    },
    {
      key: "assessment" as keyof SoapNote,
      title: "Assessment",
      subtitle: "Clinical diagnosis and evaluation",
      color: "primary",
    },
    {
      key: "plan" as keyof SoapNote,
      title: "Plan",
      subtitle: "Treatment plan and follow-up",
      color: "accent",
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
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 bg-${section.color} rounded-full`} />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
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
                      className={`p-5 bg-muted/30 border-l-4 border-l-${section.color} cursor-pointer hover:bg-muted/50 transition-colors`}
                      onClick={() => setEditingSection(section.key)}
                    >
                      <div className="text-foreground leading-relaxed space-y-2">
                        {editedNote[section.key].split('\n').map((line, idx) => {
                          if (line.trim().startsWith('•')) {
                            return (
                              <div key={idx} className="flex gap-3">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span className="flex-1">{line.substring(1).trim()}</span>
                              </div>
                            );
                          } else if (line.trim().startsWith('-')) {
                            return (
                              <div key={idx} className="flex gap-3 ml-6">
                                <span className="text-muted-foreground">-</span>
                                <span className="flex-1 text-sm">{line.substring(1).trim()}</span>
                              </div>
                            );
                          }
                          return line.trim() ? <p key={idx}>{line}</p> : <div key={idx} className="h-1" />;
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">Click to edit</p>
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
