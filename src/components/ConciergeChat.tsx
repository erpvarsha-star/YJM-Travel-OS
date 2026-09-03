import React, { useState, useRef, useEffect } from 'react';
import { Trip, ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Compass, 
  Utensils, 
  ShieldAlert, 
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface ConciergeChatProps {
  trip: Trip;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ConciergeChat: React.FC<ConciergeChatProps> = ({
  trip,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I'm your Yoyo Travel Brain concierge for **${trip.destination}**. I'm synced with your ${trip.durationDays}-day schedule, packing checklist, and notes. Ask me anything: secret dining spots, transit navigation hacks, emergency etiquette, or backup rain plans!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        `Best hidden dinner spots near ${trip.destination}`,
        `What should I book in advance for this trip?`,
        `How do I get around cheaply on public transit?`,
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompt passed in (e.g. from Itinerary view)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          tripContext: {
            destination: trip.destination,
            country: trip.country,
            durationDays: trip.durationDays,
            startDate: trip.startDate,
            endDate: trip.endDate,
            travelStyle: trip.travelStyle,
            currency: trip.currency,
            currencySymbol: trip.currencySymbol,
            totalBudget: trip.totalBudget,
            itinerary: trip.itinerary,
            brainNotes: trip.brainNotes,
          },
          chatHistory: messages.slice(-6),
        }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm ready to help with your trip!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [
          `Where is the nearest convenience store?`,
          `How much should I tip in ${trip.destination}?`,
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Concierge request error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I'm having a brief connection hitch. Please verify your GEMINI_API_KEY or retry in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickChips = [
    { label: 'Dinner Gems', query: `Recommend 3 authentic local dinner spots in ${trip.destination} with exact dishes to order.` },
    { label: 'Transit Pass Hack', query: `What is the cheapest and easiest transport card or pass to use in ${trip.destination}?` },
    { label: 'Rainy Day Backup', query: `Give me an indoor cultural or fun backup plan for ${trip.destination} if it rains.` },
    { label: 'Scam & Safety Check', query: `What common tourist scams or safety faux pas should I watch out for in ${trip.destination}?` },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs sm:text-sm text-stone-900">
                Gemini Travel Concierge
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Live Memory
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Grounded in {trip.destination} ({trip.durationDays}d, {trip.travelStyle})
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-fresh',
                role: 'assistant',
                content: `Chat cleared. What can I check for your trip to ${trip.destination}?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors text-xs flex items-center space-x-1"
          title="Reset conversation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200/60'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-amber-200' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Follow-up suggestions from model */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 space-y-1">
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                      Follow-up Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sugg, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sugg)}
                          className="text-[11px] bg-white hover:bg-stone-50 text-stone-700 px-2 py-1 rounded-md border border-stone-200 transition-colors text-left"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-7 w-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-stone-100 text-stone-500 rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center space-x-2 border border-stone-200/60">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span>Yoyo Travel Brain thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 overflow-x-auto flex items-center space-x-2">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
          Instant:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="shrink-0 text-[11px] bg-white hover:bg-amber-50 hover:text-amber-900 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          id="concierge-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Yoyo anything about ${trip.destination}...`}
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <button
          type="submit"
          id="btn-concierge-send"
          disabled={!input.trim() || isLoading}
          className="bg-amber-600 hover:bg-amber-700 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 flex items-center space-x-1"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
