import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { arrayBufferToBase64, base64ToBytes, decodeAudioData, float32ToPCM16 } from '../services/audioUtils';

interface UseLiveGeminiReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  volume: number; // For visualization 0-1
}

export const useLiveGemini = (): UseLiveGeminiReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for cleanup
  const sessionRef = useRef<any>(null); 
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Clean up function to stop everything
  const cleanup = useCallback(() => {
    // Close session
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Stop microphone stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect audio nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop playing audio
    audioQueueRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioQueueRef.current = [];

    // Close contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setVolume(0);
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 2. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are Voyager AI, a helpful travel companion. Keep your spoken responses concise, natural, and conversational. Summarize options briefly instead of reading long lists. Always quote prices in INR (Indian Rupees). Proactively check for and mention any applicable coupon codes or bank offers.",
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setIsConnected(true);
            setIsConnecting(false);

            // Start processing audio input
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5)); // Boost slightly for visualization

              // Convert to PCM16 and send
              const pcmData = float32ToPCM16(inputData);
              const base64Data = arrayBufferToBase64(pcmData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const serverContent = msg.serverContent;

            // Handle Audio Output
            if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
               const base64Audio = serverContent.modelTurn.parts[0].inlineData.data;
               const audioBytes = base64ToBytes(base64Audio);
               
               if (audioContextRef.current) {
                 const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
                 
                 const source = audioContextRef.current.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(audioContextRef.current.destination);
                 
                 // Schedule playback
                 const ctxTime = audioContextRef.current.currentTime;
                 // If nextStartTime is in the past, reset it to now
                 if (nextStartTimeRef.current < ctxTime) {
                    nextStartTimeRef.current = ctxTime;
                 }
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 
                 audioQueueRef.current.push(source);
                 source.onended = () => {
                    audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                 };
               }
            }

            // Handle Interruption
            if (serverContent?.interrupted) {
              console.log("Model interrupted");
              audioQueueRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              audioQueueRef.current = [];
              if (audioContextRef.current) {
                 nextStartTimeRef.current = audioContextRef.current.currentTime;
              }
            }
          },
          onclose: (e) => {
            console.log("Session closed", e);
            cleanup();
          },
          onerror: (err) => {
            console.error("Session error", err);
            setError("Connection error");
            cleanup();
          }
        }
      });
      
      // Store the session promise so we can close it later.
      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error("Failed to connect", err);
      setError("Failed to start voice session");
      cleanup();
    }
  }, [isConnected, isConnecting, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error,
    volume
  };
};