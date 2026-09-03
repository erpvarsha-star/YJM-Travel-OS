import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from "@google/genai";
import { searchFlightsMock, searchHotelsMock } from './mockTravelService';
import { tools, systemInstruction } from './geminiService';
import { TripPlan } from '../types';

// --- Audio Helpers (Encoding/Decoding) ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Live Service Class ---

export class LiveService {
  private ai: GoogleGenAI;
  private session: LiveSession | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private onPlanReceived: (plan: TripPlan) => void;
  private onDisconnect: () => void;
  private onConnect: () => void;

  constructor(apiKey: string, onPlanReceived: (plan: TripPlan) => void, onConnect: () => void, onDisconnect: () => void) {
    this.ai = new GoogleGenAI({ apiKey });
    this.onPlanReceived = onPlanReceived;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Resume contexts if they are suspended (browser policy)
    if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
    if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        tools: tools,
        systemInstruction: systemInstruction + "\n\nIMPORTANT: You are in a real-time voice conversation. Keep responses shorter and conversational. When you have a plan ready, use the submit_final_plan tool immediately.",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => {
          console.log("Live session connected");
          this.onConnect();
          
          if (!this.inputAudioContext || !this.mediaStream) return;

          this.source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
          this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };

          this.source.connect(this.processor);
          this.processor.connect(this.inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && this.outputAudioContext) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(
              decode(base64Audio), 
              this.outputAudioContext, 
              24000, 
              1
            );
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext.destination);
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
          }

          // Handle Interruption
          if (message.serverContent?.interrupted) {
             this.nextStartTime = 0;
          }

          // Handle Tool Calls
          if (message.toolCall) {
            console.log("Live Tool Call:", message.toolCall);
            for (const fc of message.toolCall.functionCalls) {
              let result: any = { error: "Unknown function" };
              
              if (fc.name === 'search_flights') {
                 result = searchFlightsMock(fc.args.origin as string, fc.args.destination as string, fc.args.date as string);
              } else if (fc.name === 'search_hotels') {
                 result = searchHotelsMock(fc.args.city as string, fc.args.stars as number);
              } else if (fc.name === 'submit_final_plan') {
                 const plan = fc.args as unknown as TripPlan;
                 this.onPlanReceived(plan);
                 result = { success: true, message: "Plan displayed to user." };
              }

              // Send response back
              sessionPromise.then(session => session.sendToolResponse({
                functionResponses: {
                  id: fc.id,
                  name: fc.name,
                  response: { result }
                }
              }));
            }
          }
        },
        onclose: () => {
          console.log("Live session closed");
          this.onDisconnect();
        },
        onerror: (err) => {
          console.error("Live session error:", err);
          this.disconnect();
        }
      }
    });
    
    this.session = await sessionPromise;
  }

  disconnect() {
    if (this.session) {
      // The SDK doesn't expose a direct 'close' method on the session object easily in all versions, 
      // but usually the connection is managed by the client. 
      // We will stop audio processing which effectively stops the "Live" feel.
      // Ideally, the SDK would have a disconnect method. 
      // Based on docs: "Use `session.close()` to close the connection"
      // @ts-ignore - session.close might be missing in type defs depending on version but required by docs
      if (typeof this.session.close === 'function') {
         // @ts-ignore
         this.session.close();
      }
      this.session = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    
    this.onDisconnect();
  }
}