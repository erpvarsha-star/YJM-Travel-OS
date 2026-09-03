import React, { useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useLiveGemini } from '../hooks/useLiveGemini';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ isOpen, onClose }) => {
  const { isConnected, isConnecting, connect, disconnect, error, volume } = useLiveGemini();

  // Auto-connect when opened
  useEffect(() => {
    if (isOpen) {
      connect();
    } else {
      disconnect();
    }
  }, [isOpen]); 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Status Text */}
        <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Voyager Live</h2>
            <p className="text-blue-200/80 font-medium">
                {error ? <span className="text-red-400">{error}</span> : 
                 isConnecting ? "Connecting to satellite..." : 
                 isConnected ? "Listening..." : "Disconnected"}
            </p>
        </div>

        {/* Visualizer Circle */}
        <div className="relative flex items-center justify-center">
             {/* Pulsing rings */}
             {isConnected && (
                 <>
                    <div 
                        className="absolute rounded-full border border-blue-500/30 transition-all duration-100 ease-linear"
                        style={{ 
                            width: `${120 + volume * 200}px`, 
                            height: `${120 + volume * 200}px`,
                            opacity: 0.5 - volume * 0.2
                        }}
                    />
                    <div 
                        className="absolute rounded-full border border-blue-400/40 transition-all duration-75 ease-linear"
                        style={{ 
                            width: `${100 + volume * 150}px`, 
                            height: `${100 + volume * 150}px`,
                            opacity: 0.6 - volume * 0.2
                        }}
                    />
                 </>
             )}

             {/* Main Circle */}
             <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-500 ${
                 isConnecting ? 'bg-slate-700 animate-pulse' : 
                 isConnected ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-800'
             }`}>
                {isConnected ? <Mic size={32} className="text-white" /> : <MicOff size={32} className="text-slate-400" />}
             </div>
        </div>

        <div className="mt-12 text-center max-w-sm text-sm text-slate-400">
           {isConnected ? 
             "Speak naturally. You can interrupt me anytime." : 
             "Starting audio secure link..."}
        </div>
        
        <button 
            onClick={onClose}
            className="mt-16 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
        >
            End Session
        </button>

      </div>
    </div>
  );
};