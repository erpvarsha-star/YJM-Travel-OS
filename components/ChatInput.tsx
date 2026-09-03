import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Search, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Capture text already in the input so we can append to it
    const initialInput = input; 

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      
      // Append transcript to initial input (handle spacing)
      const prefix = initialInput && !initialInput.endsWith(' ') ? initialInput + ' ' : initialInput;
      setInput(prefix + transcript);
      
      // Auto resize
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
         textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-slate-200 bg-white p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="pl-3 py-3 text-slate-400">
             <MapPin size={20} />
          </div>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask about flights, hotels, or itineraries..."
            className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none py-3 max-h-[120px] text-sm"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`p-3 rounded-xl flex-shrink-0 transition-all ${
              isListening
                ? 'bg-red-50 text-red-500 animate-pulse border border-red-100'
                : 'bg-transparent text-slate-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Dictate with voice"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`p-3 rounded-xl flex-shrink-0 transition-all ${
              input.trim() && !disabled
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {disabled ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-400">
             AI can make mistakes. Always check important travel info. Powered by Gemini 2.5 Flash with Google Search.
           </p>
        </div>
      </div>
    </div>
  );
};