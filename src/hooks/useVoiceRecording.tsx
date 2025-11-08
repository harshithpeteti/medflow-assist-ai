import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecordingOptions {
  language?: string;
  onSpeakerDetected?: (speaker: 'doctor' | 'patient') => void;
}

export const useVoiceRecording = (options: VoiceRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('patient');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const pitchDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Analyze pitch to detect speaker changes
  const analyzePitch = useCallback(() => {
    if (!analyzerRef.current || !audioContextRef.current) return;

    const bufferLength = analyzerRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyzerRef.current.getFloatTimeDomainData(dataArray);

    // Simple autocorrelation for pitch detection
    let maxCorrelation = 0;
    let fundamentalFrequency = 0;
    
    for (let lag = 1; lag < bufferLength / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < bufferLength / 2; i++) {
        correlation += dataArray[i] * dataArray[i + lag];
      }
      if (correlation > maxCorrelation && correlation > 0.01) {
        maxCorrelation = correlation;
        fundamentalFrequency = audioContextRef.current!.sampleRate / lag;
      }
    }

    // Detect speaker based on pitch (male voices typically 85-180 Hz, female/child 165-300 Hz)
    if (fundamentalFrequency > 0) {
      const isLowPitch = fundamentalFrequency < 165;
      const detectedSpeaker = isLowPitch ? 'doctor' : 'patient';
      
      if (detectedSpeaker !== currentSpeaker) {
        setCurrentSpeaker(detectedSpeaker);
        options.onSpeakerDetected?.(detectedSpeaker);
      }
    }
  }, [currentSpeaker, options]);

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

      // Set up audio analysis for speaker detection
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
      source.connect(analyzerRef.current);

      // Start pitch detection for speaker identification
      pitchDetectionIntervalRef.current = setInterval(analyzePitch, 500);

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
              body: { 
                audio: base64Audio,
                language: options.language || 'auto'
              }
            });

            if (error) {
              console.error("Transcription error:", error);
              toast.error("Transcription failed");
              setError(error.message);
              return;
            }

            if (data?.text) {
              console.log("Transcription received:", data.text);
              // Add speaker label to transcript
              const speakerLabel = currentSpeaker === 'doctor' ? '[Doctor]' : '[Patient]';
              setTranscript(prev => prev + `${speakerLabel} ${data.text} `);
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
      
      // Clear pitch detection interval
      if (pitchDetectionIntervalRef.current) {
        clearInterval(pitchDetectionIntervalRef.current);
        pitchDetectionIntervalRef.current = null;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      analyzerRef.current = null;
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
    currentSpeaker,
    startRecording,
    stopRecording,
    getCurrentTranscript,
    error,
  };
};
