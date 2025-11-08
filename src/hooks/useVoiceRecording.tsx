import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing audio...");
        
        if (audioChunksRef.current.length === 0) {
          console.log("No audio data captured");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            console.log("Sending audio to Whisper API...");
            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
              body: { audio: base64Audio }
            });

            if (error) {
              console.error("Transcription error:", error);
              toast.error("Transcription failed");
              setError(error.message);
              return;
            }

            if (data?.text) {
              console.log("Transcription received:", data.text);
              setTranscript(prev => prev + data.text + " ");
            }
          } catch (err) {
            console.error("Error calling transcription:", err);
            toast.error("Failed to transcribe audio");
            setError(err instanceof Error ? err.message : "Transcription failed");
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording in chunks (every 3 seconds)
      mediaRecorder.start();
      setIsRecording(true);
      
      // Automatically stop and restart to create chunks for real-time transcription
      const chunkInterval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          audioChunksRef.current = [];
          mediaRecorderRef.current.start();
        }
      }, 1500);

      // Store interval for cleanup
      (mediaRecorderRef.current as any).chunkInterval = chunkInterval;

      console.log("Recording started with OpenAI Whisper");

    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
      setError("Failed to start recording. Please check microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      // Clear chunk interval
      const interval = (mediaRecorderRef.current as any).chunkInterval;
      if (interval) {
        clearInterval(interval);
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      mediaRecorderRef.current = null;
      console.log("Recording stopped");
    }
  }, []);

  const getCurrentTranscript = useCallback(() => {
    return transcript;
  }, [transcript]);

  return {
    isRecording,
    isListening: isRecording,
    transcript,
    startRecording,
    stopRecording,
    getCurrentTranscript,
    error,
  };
};
