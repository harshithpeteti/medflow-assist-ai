import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface DustWorkflowIndicatorProps {
  status: 'processing' | 'optimized' | 'error' | 'idle';
  message?: string;
}

export const DustWorkflowIndicator = ({ status, message }: DustWorkflowIndicatorProps) => {
  if (status === 'idle') return null;

  return (
    <Badge 
      variant={status === 'error' ? 'destructive' : 'secondary'}
      className="gap-1.5 animate-fade-in"
    >
      {status === 'processing' && (
        <>
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>Dust AI Optimizing...</span>
        </>
      )}
      {status === 'optimized' && (
        <>
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>{message || 'Optimized by Dust'}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>{message || 'Optimization failed'}</span>
        </>
      )}
    </Badge>
  );
};
