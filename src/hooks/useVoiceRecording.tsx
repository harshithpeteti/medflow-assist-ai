import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseVoiceRecordingProps {
  onTranscriptionUpdate: (text: string) => void;
}

export const useVoiceRecording = ({ onTranscriptionUpdate }: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef("");

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check for browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
          variant: "destructive",
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Voice recognition started");
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const updated = prev + finalTranscript;
            onTranscriptionUpdate(updated);
            return updated;
          });
        }

        interimTranscriptRef.current = interimTranscript;
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === "not-allowed") {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice recording.",
            variant: "destructive",
          });
        } else if (event.error === "no-speech") {
          console.log("No speech detected, continuing...");
        } else {
          toast({
            title: "Recording Error",
            description: `Error: ${event.error}`,
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        console.log("Voice recognition ended");
        if (isRecording) {
          // Restart if still supposed to be recording
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      toast({
        title: "Recording Started",
        description: "Listening to consultation...",
      });

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [isRecording, toast, onTranscriptionUpdate]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      recognitionRef.current = null;
      
      toast({
        title: "Recording Stopped",
        description: "Processing consultation...",
      });
    }
  }, [toast]);

  const getCurrentTranscript = useCallback(() => {
    return transcript + interimTranscriptRef.current;
  }, [transcript]);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    getCurrentTranscript,
  };
};
