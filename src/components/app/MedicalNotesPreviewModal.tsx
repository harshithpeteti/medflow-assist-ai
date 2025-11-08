import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, FileText } from "lucide-react";

interface MedicalNotesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  patientName: string;
  patientMRN: string;
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  demographics?: any;
}

const MedicalNotesPreviewModal = ({
  isOpen,
  onClose,
  onSave,
  patientName,
  patientMRN,
  soapNote,
  demographics,
}: MedicalNotesPreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Medical Notes Preview
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-6">
            {/* Patient Header */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{patientName}</h2>
                <p className="text-sm text-muted-foreground">MRN: {patientMRN}</p>
              </div>

              {demographics && (
                <div className="flex flex-wrap gap-3">
                  {demographics.age && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Age: {demographics.age}
                    </Badge>
                  )}
                  {demographics.gender && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Gender: {demographics.gender}
                    </Badge>
                  )}
                  {demographics.smoker && demographics.smoker !== "No" && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Smoker: {demographics.smoker}
                    </Badge>
                  )}
                  {demographics.diabetes === "Yes" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      Diabetes
                    </Badge>
                  )}
                  {demographics.hypertension === "Yes" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      Hypertension
                    </Badge>
                  )}
                  {demographics.allergies && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      Allergies: {demographics.allergies}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* SOAP Sections */}
            {[
              { title: "Subjective", content: soapNote.subjective, subtitle: "Patient's reported symptoms and history", icon: "👤" },
              { title: "Objective", content: soapNote.objective, subtitle: "Clinical findings and measurements", icon: "🔬" },
              { title: "Assessment", content: soapNote.assessment, subtitle: "Clinical diagnosis and evaluation", icon: "🎯" },
              { title: "Plan", content: soapNote.plan, subtitle: "Treatment plan and follow-up", icon: "📋" },
            ].map((section, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                  </div>
                </div>
                
                <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-l-4 border-l-primary">
                  <div className="text-foreground leading-relaxed space-y-4">
                    {section.content.split('\n').map((line, lineIdx) => {
                      const trimmedLine = line.trim();
                      
                      if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
                        const headerText = trimmedLine.replace(/\*\*/g, '');
                        return (
                          <div key={lineIdx} className="flex items-center gap-2 mt-3 mb-2">
                            <div className="w-1.5 h-5 bg-primary rounded-full" />
                            <h4 className="font-bold text-foreground text-base tracking-tight">
                              {headerText}
                            </h4>
                          </div>
                        );
                      }
                      
                      if (trimmedLine.startsWith('•')) {
                        return (
                          <div key={lineIdx} className="flex gap-3 ml-4">
                            <span className="text-primary font-bold mt-1 text-lg">•</span>
                            <span className="flex-1 pt-0.5">{trimmedLine.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      
                      if (trimmedLine.startsWith('-')) {
                        return (
                          <div key={lineIdx} className="flex gap-3 ml-10">
                            <span className="text-muted-foreground mt-0.5">-</span>
                            <span className="flex-1 text-sm text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      
                      if (!trimmedLine) {
                        return <div key={lineIdx} className="h-2" />;
                      }
                      
                      return <p key={lineIdx} className="text-sm ml-4">{line}</p>;
                    })}
                  </div>
                </Card>
                
                {idx < 3 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save to Clinical Notes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalNotesPreviewModal;
