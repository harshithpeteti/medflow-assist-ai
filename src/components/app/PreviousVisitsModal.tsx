import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText } from "lucide-react";

interface PreviousVisit {
  id: string;
  patientName: string;
  patientMRN: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface PreviousVisitsModalProps {
  open: boolean;
  onClose: () => void;
  visits: PreviousVisit[];
  patientName: string;
}

const PreviousVisitsModal = ({ open, onClose, visits, patientName }: PreviousVisitsModalProps) => {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Previous Visits - {patientName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {visits.length} previous consultation{visits.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[70vh]">
          {visits.length > 0 ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <Card key={visit.id} className="p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Consultation</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(visit.date)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Subjective */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-primary rounded-full" />
                        <h4 className="font-semibold text-sm">Subjective</h4>
                      </div>
                      <p className="text-sm text-foreground pl-3 leading-relaxed">
                        {visit.subjective}
                      </p>
                    </div>

                    <Separator />

                    {/* Objective */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-accent rounded-full" />
                        <h4 className="font-semibold text-sm">Objective</h4>
                      </div>
                      <p className="text-sm text-foreground pl-3 leading-relaxed">
                        {visit.objective}
                      </p>
                    </div>

                    <Separator />

                    {/* Assessment */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-primary rounded-full" />
                        <h4 className="font-semibold text-sm">Assessment</h4>
                      </div>
                      <p className="text-sm text-foreground pl-3 leading-relaxed">
                        {visit.assessment}
                      </p>
                    </div>

                    <Separator />

                    {/* Plan */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-accent rounded-full" />
                        <h4 className="font-semibold text-sm">Plan</h4>
                      </div>
                      <p className="text-sm text-foreground pl-3 leading-relaxed">
                        {visit.plan}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No previous visits found</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PreviousVisitsModal;
