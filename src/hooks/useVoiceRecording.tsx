import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { RealtimeChat } from "@/utils/RealtimeAudio";

interface VoiceRecordingOptions {
  language?: string;
}

interface TranscriptSegment {
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: number;
}

export const useVoiceRecording = (options: VoiceRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  
  const realtimeChatRef = useRef<RealtimeChat | null>(null);

  const handleTranscript = useCallback((segment: TranscriptSegment) => {
    console.log('New transcript segment:', segment);
    setSegments(prev => [...prev, segment]);
    setTranscript(prev => prev + `[${segment.speaker === 'doctor' ? 'Doctor' : 'Patient'}] ${segment.text} `);
  }, []);

  const handleError = useCallback((errorMsg: string) => {
    console.error('Realtime error:', errorMsg);
    setError(errorMsg);
    toast.error(errorMsg);
  }, []);

  const toggleSpeaker = useCallback(() => {
    const newSpeaker = currentSpeaker === 'doctor' ? 'patient' : 'doctor';
    setCurrentSpeaker(newSpeaker);
    realtimeChatRef.current?.setCurrentSpeaker(newSpeaker);
    console.log('Toggled speaker to:', newSpeaker);
  }, [currentSpeaker]);

  const startRecording = useCallback(async () => {
    try {
      console.log('Starting realtime recording...');
      setError(null);
      
      realtimeChatRef.current = new RealtimeChat(handleTranscript, handleError);
      await realtimeChatRef.current.init();
      
      setIsRecording(true);
      toast.success("Voice recording started");
      console.log("Realtime recording started");

    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
      setError("Failed to start recording. Please check microphone permissions.");
    }
  }, [handleTranscript, handleError]);

  const stopRecording = useCallback(() => {
    if (realtimeChatRef.current) {
      realtimeChatRef.current.disconnect();
      realtimeChatRef.current = null;
      setIsRecording(false);
      console.log("Recording stopped");
      toast.info("Recording stopped");
    }
  }, []);

  const getCurrentTranscript = useCallback(() => {
    return transcript;
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChatRef.current) {
        realtimeChatRef.current.disconnect();
      }
    };
  }, []);

  return {
    isRecording,
    isListening: isRecording,
    transcript,
    segments,
    currentSpeaker,
    toggleSpeaker,
    startRecording,
    stopRecording,
    getCurrentTranscript,
    error,
  };
};
