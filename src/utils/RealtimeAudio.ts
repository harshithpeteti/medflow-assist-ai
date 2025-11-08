import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

interface TranscriptSegment {
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: number;
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private currentSpeaker: 'doctor' | 'patient' = 'doctor';
  private lastSpeechTime: number = 0;
  private isAISpeaking: boolean = false;
  private currentTranscript: string = '';

  constructor(
    private onTranscript: (segment: TranscriptSegment) => void,
    private onError: (error: string) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log('Initializing Realtime API...');

      // Get ephemeral token
      const { data, error } = await supabase.functions.invoke("realtime-token");
      
      if (error || !data?.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('Ephemeral token obtained');

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Handle remote audio
      this.pc.ontrack = e => {
        console.log('Received remote audio track');
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      this.pc.addTrack(ms.getTracks()[0]);
      console.log('Added local audio track');

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("open", () => {
        console.log('Data channel opened');
      });

      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        this.handleRealtimeEvent(event);
      });

      this.dc.addEventListener("error", (e) => {
        console.error('Data channel error:', e);
        this.onError('Connection error occurred');
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('Created offer');

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${sdpResponse.status}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log('WebRTC connection established');

    } catch (error) {
      console.error("Error initializing chat:", error);
      this.onError(error instanceof Error ? error.message : 'Failed to initialize');
      throw error;
    }
  }

  private handleRealtimeEvent(event: any) {
    console.log('Realtime event:', event.type);

    switch (event.type) {
      case 'session.created':
        console.log('Session created');
        break;

      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        this.currentTranscript = '';
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        break;

      case 'conversation.item.input_audio_transcription.delta':
        // Process partial transcripts in real-time
        if (event.delta) {
          this.currentTranscript += event.delta;
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('Transcription completed:', event.transcript);
        // Emit immediately when transcription is complete
        if (event.transcript && event.transcript.trim()) {
          this.onTranscript({
            speaker: this.currentSpeaker,
            text: event.transcript.trim(),
            timestamp: Date.now()
          });
        }
        this.currentTranscript = '';
        break;

      case 'response.audio.delta':
        this.isAISpeaking = true;
        break;

      case 'response.audio.done':
        this.isAISpeaking = false;
        break;

      case 'error':
        console.error('Realtime API error:', event);
        this.onError(event.error?.message || 'Unknown error');
        break;
    }
  }

  setCurrentSpeaker(speaker: 'doctor' | 'patient') {
    this.currentSpeaker = speaker;
    console.log('Speaker set to:', speaker);
  }

  disconnect() {
    console.log('Disconnecting...');
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
  }
}
