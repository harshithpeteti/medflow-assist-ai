import { Button } from "@/components/ui/button";
import { Database, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { generateFakeData } from "@/utils/fakeDataGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DevDataButton = () => {
  const loadFakeData = () => {
    const { clinicalNotes, drafts } = generateFakeData();
    
    // Load clinical notes
    localStorage.setItem("clinicalNotes", JSON.stringify(clinicalNotes));
    
    // Load drafts
    localStorage.setItem("consultationDrafts", JSON.stringify(drafts));
    
    // Trigger storage event to refresh components
    window.dispatchEvent(new Event('storage'));
    
    toast.success("Fake data loaded successfully!", {
      description: `Added ${clinicalNotes.length} clinical notes and ${drafts.length} draft consultation.`
    });
  };

  const clearAllData = () => {
    localStorage.removeItem("clinicalNotes");
    localStorage.removeItem("consultationDrafts");
    window.dispatchEvent(new Event('storage'));
    toast.success("All data cleared");
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-50">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-background border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all clinical notes and consultation drafts from local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground">
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        onClick={loadFakeData}
        variant="outline"
        size="sm"
        className="gap-2 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <Database className="h-4 w-4" />
        Load Demo Data
      </Button>
    </div>
  );
};
