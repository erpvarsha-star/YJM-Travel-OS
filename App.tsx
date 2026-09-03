import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, Map, MapPin, BedDouble, Plane, Tag, Navigation, Calendar, Scale,
  Sparkles, Wallet, BrainCircuit, ShieldCheck, ChevronDown, Plus, 
  Layers, MessageSquare, Mic, User, CheckCircle, ArrowRight, 
  ExternalLink, TrendingUp, AlertCircle, RefreshCw, X, GitFork, ArrowLeftRight,
  FolderClock
} from 'lucide-react';

import { 
  Trip, 
  TravelOSState, 
  LoyaltyAccount, 
  Message, 
  SavedTrip, 
  UserProfile, 
  Strategy, 
  ResearchEntry,
  ConflictChoiceData
} from './types';

// Services
import { sendMessageToGemini } from './services/geminiService';
import { INITIAL_LOYALTY, INITIAL_TRIPS, generateFullTripWithAI } from './services/travelBrainService';

// TravelOS Workspace Components
import { ItineraryView } from './src/components/ItineraryView';
import { PackingView } from './src/components/PackingView';
import { ExpenseView } from './src/components/ExpenseView';
import { BrainView } from './src/components/BrainView';
import { CulturalView } from './src/components/CulturalView';
import { NewTripModal } from './src/components/NewTripModal';
import { AppCombinerModal } from './src/components/AppCombinerModal';

// Voyager AI Modals & Chat Components
import { VoiceOverlay } from './components/VoiceOverlay';
import { FlightSearchModal } from './components/FlightSearchModal';
import { HotelSearchModal } from './components/HotelSearchModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SavedTripsModal } from './components/SavedTripsModal';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';

type ActiveTab = 'strategy' | 'itinerary' | 'search' | 'packing' | 'expenses' | 'brain' | 'culture';

export const App: React.FC = () => {
  // --- Unified State Management ---
  const [state, setState] = useState<TravelOSState>(() => {
    const saved = localStorage.getItem('travel_os_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.trips && parsed.trips.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse travel_os_state", e);
      }
    }
    return {
      profile: { loyalty: INITIAL_LOYALTY },
      trips: INITIAL_TRIPS
    };
  });

  const [activeTripId, setActiveTripId] = useState<string>(() => {
    return state.trips.length > 0 ? state.trips[0].id : '';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('strategy');

  // --- Modals State ---
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavedTripsOpen, setIsSavedTripsOpen] = useState(false);
  const [isCombinerOpen, setIsCombinerOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  // --- Concierge Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `👋 **Welcome to Voyager TravelOS!** I am your unified AI travel strategist.\n\nI have loaded your active trip **${state.trips[0]?.destination || 'Tokyo & Kyoto'}**. I can optimize your itinerary, calculate high-value points redemptions (CPP > 2.0¢), search live flights & hotels, or talk via **Live Voice Mode**.\n\nWhat would you like to plan today?`,
      timestamp: Date.now()
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('voyager_user_profile');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return {
      name: 'Yash',
      preferences: {
        cabinClass: 'business',
        budgetPriority: 'value',
        travelPace: 'balanced',
        seatPreference: 'window'
      },
      loyaltyPrograms: INITIAL_LOYALTY.map(l => ({
        id: l.program,
        provider: l.program,
        membershipId: l.membershipId || 'ACTIVE',
        balance: l.balance
      }))
    };
  });
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => {
    const stored = localStorage.getItem('voyager_saved_trips');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('travel_os_state', JSON.stringify(state));
  }, [state]);

  // Sync saved trips
  useEffect(() => {
    localStorage.setItem('voyager_saved_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  // Sync profile
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('voyager_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Current active trip
  const activeTrip: Trip | undefined = state.trips.find(t => t.id === activeTripId) || state.trips[0];

  // Helper to update active trip
  const handleUpdateActiveTrip = (updatedTrip: Trip) => {
    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
    }));
  };

  // Helper to create a new trip
  const handleCreateTrip = (newTrip: Trip) => {
    setState(prev => ({
      ...prev,
      trips: [newTrip, ...prev.trips]
    }));
    setActiveTripId(newTrip.id);
    setActiveTab('itinerary');

    // Add Concierge announcement
    setMessages(prev => [
      ...prev,
      {
        id: `created-${Date.now()}`,
        role: 'model',
        content: `🎉 **Created new trip for ${newTrip.destination}!**\n\nI have generated a tailored ${newTrip.durationDays}-day itinerary, packing checklist, cultural insights, and initial strategies with points arbitrage calculations.\n\nExplore the tabs or ask me any questions!`,
        timestamp: Date.now()
      }
    ]);
  };

  // Handle Send Message to Gemini Concierge
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: loadingId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isLoading: true
      }
    ]);

    // Build context-aware prompt if trip is active
    let contextualPrompt = text;
    if (activeTrip) {
      contextualPrompt = `[Context: Active trip is "${activeTrip.destination}", Dates: "${activeTrip.dates}", Budget: ${activeTrip.currencySymbol}${activeTrip.totalBudget}, Travelers: "${activeTrip.travellers || '2 Adults'}", Preferred Cabin: "${activeTrip.cabinPreference || 'Business'}"]. User says: ${text}`;
    }

    // Build history
    const history = messages
      .filter(m => !m.isLoading && m.content)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

    try {
      const response = await sendMessageToGemini(contextualPrompt, history, userProfile);

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: 'model',
            content: response.text,
            sources: response.sources,
            weather: response.weather,
            timestamp: Date.now()
          }
        ];
      });
    } catch (e) {
      console.error("Gemini Error", e);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: 'model',
            content: `I ran into an issue connecting to Gemini. Please verify your internet connection or API settings.`,
            timestamp: Date.now()
          }
        ];
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Save Trip from Chat
  const handleSaveChatTrip = (message: Message) => {
    const firstLine = message.content.split('\n').find(l => l.trim().length > 0) || 'Trip Note';
    const title = firstLine.replace(/^[#*\s]+/, '').substring(0, 45);
    const newSaved: SavedTrip = {
      id: message.id,
      content: message.content,
      timestamp: Date.now(),
      title: title || `Trip Discovery - ${new Date().toLocaleDateString()}`
    };

    if (savedTrips.some(t => t.id === newSaved.id)) return;
    setSavedTrips(prev => [newSaved, ...prev]);

    // Also add to active trip's Brain Notes
    if (activeTrip) {
      handleUpdateActiveTrip({
        ...activeTrip,
        brainNotes: [
          {
            id: `bn-${Date.now()}`,
            text: message.content.substring(0, 300) + '...',
            type: 'scratchpad',
            tags: ['saved-chat', activeTrip.destination.toLowerCase().replace(/\s+/g, '-')],
            createdAt: new Date().toISOString().slice(0, 10)
          },
          ...activeTrip.brainNotes
        ]
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#080b11] text-slate-100 font-sans overflow-hidden">
      {/* =========================================================================
          TOP UNIFIED NAVIGATION BAR
         ========================================================================= */}
      <header className="h-16 border-b border-slate-800 bg-[#0d131f]/95 backdrop-blur px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 select-none">
        
        {/* Brand & Active Trip Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">Voyager</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">TravelOS</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Unified Travel Workspace & Live AI Concierge</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Active Trip Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer">
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Current Trip</div>
                <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                  {activeTrip ? activeTrip.destination : 'No Active Trip'}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Your Trips</div>
              <div className="max-h-60 overflow-y-auto space-y-1 my-1">
                {state.trips.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTripId(t.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      t.id === activeTrip?.id ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{t.destination}</div>
                      <div className="text-[10px] text-slate-400">{t.dates}</div>
                    </div>
                    {t.id === activeTrip?.id && <CheckCircle size={14} className="text-blue-400 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsNewTripModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  <Plus size={14} /> Create New Trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Modals */}
          <button
            onClick={() => setIsFlightModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors"
            title="Search Flights"
          >
            <Plane size={14} className="text-sky-400" />
            <span className="hidden md:inline">Flights</span>
          </button>

          <button
            onClick={() => setIsHotelModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors"
            title="Search Hotels"
          >
            <BedDouble size={14} className="text-indigo-400" />
            <span className="hidden md:inline">Hotels</span>
          </button>

          {/* Loyalty Ledger Toggle */}
          <button
            onClick={() => setIsLoyaltyOpen(!isLoyaltyOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors"
            title="Loyalty Points Portfolio"
          >
            <Wallet size={14} className="text-amber-400" />
            <span className="hidden lg:inline">Loyalty</span>
          </button>

          {/* Gemini Live Voice Mode Button */}
          <button
            onClick={() => setIsVoiceMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
            title="Open Gemini Live Voice Assistant"
          >
            <Mic size={14} className="text-orange-400 animate-pulse" />
            <span className="hidden sm:inline">Live Voice</span>
          </button>

          {/* User Profile */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Traveler Profile & Preferences"
          >
            <User size={16} />
          </button>

          {/* History & Saved Plans / Dossiers */}
          <button
            onClick={() => setIsSavedTripsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors relative"
            title="Trip History & Saved Itineraries"
          >
            <FolderClock size={14} className="text-blue-400" />
            <span className="hidden md:inline">History</span>
            {savedTrips.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white font-mono">
                {savedTrips.length}
              </span>
            )}
          </button>

          {/* App Architecture Explainer Modal */}
          <button
            onClick={() => setIsCombinerOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors"
            title="Unified Architecture Blueprint"
          >
            <Layers size={13} />
            <span>Architecture</span>
          </button>

          {/* Concierge Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isChatOpen 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Concierge</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          LOYALTY PORTFOLIO BANNER (Expandable / Collapsible)
         ========================================================================= */}
      {isLoyaltyOpen && (
        <div className="bg-[#0b101b] border-b border-slate-800 px-6 py-3 flex items-center justify-between overflow-x-auto z-20 shrink-0 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 shrink-0 mr-4">
            <Wallet size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Loyalty Portfolio:</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {state.profile.loyalty.map((acc, i) => (
              <div key={acc.program + i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0">
                <span className={`w-2 h-2 rounded-full ${acc.color || 'bg-amber-400'}`} />
                <span className="font-medium text-slate-300">{acc.program}</span>
                <span className="font-mono font-bold text-amber-300">{acc.balance.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsLoyaltyOpen(false)}
            className="text-slate-500 hover:text-slate-300 p-1 ml-3"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION WORKSPACE (Workspace + Docked Concierge)
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT / CENTER: TRAVEL WORKSPACE */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080b11]">
          {activeTrip ? (
            <>
              {/* Trip Header Hero Bar */}
              <div className="relative border-b border-slate-800 bg-[#0d131f] shrink-0">
                {/* Background Hero Accent */}
                {activeTrip.heroImage && (
                  <div 
                    className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${activeTrip.heroImage})` }}
                  />
                )}
                
                <div className="relative px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {activeTrip.country}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} /> {activeTrip.dates} ({activeTrip.durationDays} Days)
                      </span>
                      {activeTrip.travelStyle && (
                        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline">
                          {activeTrip.travelStyle}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">{activeTrip.destination}</h1>
                  </div>

                  {/* Trip Quick Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Budget</div>
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {activeTrip.currencySymbol}{activeTrip.totalBudget?.toLocaleString()} {activeTrip.currency}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Spent to Date</div>
                      <div className="font-mono font-bold text-sm text-slate-200">
                        {activeTrip.currencySymbol}{activeTrip.expenses?.reduce((s, e) => s + e.amount, 0).toLocaleString() || 0}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleSendMessage(`Please review my itinerary for ${activeTrip.destination} and suggest 3 high-impact optimizations for time and local dining.`);
                        setIsChatOpen(true);
                      }}
                      className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-600/20 text-xs"
                    >
                      <Sparkles size={14} />
                      <span>AI Audit</span>
                    </button>
                  </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="flex items-center gap-1 px-6 border-t border-slate-800/80 overflow-x-auto select-none bg-slate-900/40">
                  {[
                    { id: 'strategy', label: 'Strategy & Points', icon: <Scale size={14} /> },
                    { id: 'itinerary', label: 'Day-by-Day Itinerary', icon: <Calendar size={14} /> },
                    { id: 'search', label: 'Flights & Stays', icon: <Plane size={14} /> },
                    { id: 'packing', label: 'Packing Checklist', icon: <Tag size={14} /> },
                    { id: 'expenses', label: 'Expense Ledger', icon: <Wallet size={14} /> },
                    { id: 'brain', label: 'Travel Brain & Notes', icon: <BrainCircuit size={14} /> },
                    { id: 'culture', label: 'Cultural & Safety', icon: <ShieldCheck size={14} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Content Views */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* 1. STRATEGY ENGINE & ARBITRAGE VIEW */}
                {activeTab === 'strategy' && (
                  <div className="space-y-8 max-w-6xl mx-auto">
                    {/* Executive Recommendation Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-purple-900/20 border border-blue-500/30 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Scale size={18} />
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Engine Recommendation</span>
                            <h2 className="text-lg font-black text-white">The Hybrid Connoisseur Path</h2>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Target CPP: 2.2¢+
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        Based on your current points portfolio (Amex Membership Rewards, Marriott Bonvoy) and flight cabin preferences, transferring points for premium long-haul flights while paying cash for boutique ryokans and high-speed rail yields the optimal balance of cash preservation and peak travel comfort.
                      </p>
                    </div>

                    {/* 4 Multi-Path Strategy Cards */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" />
                        Available Travel Execution Paths
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTrip.strategies?.map((strat, idx) => (
                          <div 
                            key={idx}
                            className={`p-5 rounded-2xl border transition-all ${
                              strat.type === 'balanced'
                                ? 'bg-slate-900/90 border-blue-500/50 ring-1 ring-blue-500/30 shadow-lg'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                                strat.type === 'balanced' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                strat.type === 'points' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                strat.type === 'value' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}>
                                {strat.type}
                              </span>
                              <div className="text-right">
                                <span className="text-base font-mono font-bold text-white">${strat.total_cash}</span>
                                {strat.total_points > 0 && (
                                  <span className="text-xs font-mono text-amber-400 ml-2">+{strat.total_points.toLocaleString()} pts</span>
                                )}
                              </div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-2">{strat.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">{strat.rationale}</p>
                            
                            {(strat.flightChoice || strat.hotelChoice) && (
                              <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
                                {strat.flightChoice && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Plane size={12} className="text-sky-400 shrink-0" />
                                    <span className="truncate">{strat.flightChoice}</span>
                                  </div>
                                )}
                                {strat.hotelChoice && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <BedDouble size={12} className="text-indigo-400 shrink-0" />
                                    <span className="truncate">{strat.hotelChoice}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Research Inbox (Found Flights & Stays) */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-400" />
                        Live Research Inbox & Points Valuations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeTrip.researchInbox?.map(item => (
                          <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  item.category === 'flight' ? 'bg-sky-500/20 text-sky-300' :
                                  item.category === 'hotel' ? 'bg-indigo-500/20 text-indigo-300' :
                                  'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {item.category}
                                </span>
                                {item.cpp && (
                                  <span className="font-mono font-bold text-emerald-400 text-[11px]">
                                    {item.cpp}¢ CPP
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
                              <p className="text-slate-400 text-[11px] mb-3">{item.provider}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="font-bold text-white text-sm">${item.price}</span>
                              {item.points_price && (
                                <span className="font-mono text-amber-400 font-semibold">{item.points_price.toLocaleString()} pts</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strategic Decision Log */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        Active Decision Log
                      </h3>
                      <div className="space-y-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                        {activeTrip.decisionLog?.map((log, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ITINERARY VIEW */}
                {activeTab === 'itinerary' && (
                  <ItineraryView 
                    trip={activeTrip} 
                    onUpdateTrip={handleUpdateActiveTrip} 
                    onAskConcierge={(query) => {
                      handleSendMessage(query);
                      setIsChatOpen(true);
                    }} 
                  />
                )}

                {/* 3. FLIGHTS & STAYS SEARCH VIEW */}
                {activeTab === 'search' && (
                  <div className="space-y-6 max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">Live Flights & Accommodation Engine</h2>
                        <p className="text-xs text-slate-400">Search real-time Google Flights & Hotels, flexible ±1/3/5 day fares, and award redemptions.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsFlightModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                        >
                          <Plane size={14} /> Search Flights
                        </button>
                        <button
                          onClick={() => setIsHotelModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <BedDouble size={14} /> Search Hotels
                        </button>
                      </div>
                    </div>

                    {/* Quick Flexible Date Search Bar (±1, ±3, ±5 Days) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Flexible Date Matrix Search (±1, ±3, ±5 Days)</div>
                          <div className="text-[11px] text-slate-400">Scan date clusters around {activeTrip.dates} for lowest cash fares or award seat availability.</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { label: '±1 Day', days: '1' },
                          { label: '±3 Days', days: '3' },
                          { label: '±5 Days', days: '5' },
                        ].map(flex => (
                          <button
                            key={flex.days}
                            onClick={() => {
                              handleSendMessage(`Search for flights to ${activeTrip.destination} with ±${flex.days} days flexibility around ${activeTrip.startDate}. Compare cash rates vs award redemptions and highlight any sweet spot days.`);
                              setIsChatOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
                          >
                            {flex.label}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            handleSendMessage(`Simulate a Seats.aero award space search for flights to ${activeTrip.destination} around ${activeTrip.dates}. Check Star Alliance, OneWorld, and SkyTeam partners and calculate CPP for business class.`);
                            setIsChatOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
                        >
                          <Sparkles size={12} className="inline mr-1" />
                          Seats.aero Award Scan
                        </button>
                      </div>
                    </div>

                    {/* Hacker Fares & Virtual Interlining (Kiwi / Kayak Algorithm) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 md:mt-0">
                          <GitFork size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-white">Kiwi & Kayak Hacker Fare Engine</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">20-45% Cheaper</span>
                          </div>
                          <div className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                            Google Flights ignores unpartnered airlines. Our engine calculates <strong>Split-Tickets</strong> (two separate one-ways), <strong>Virtual Interlining</strong> (unlinked hubs with 3.5h layover buffers), and <strong>Hidden-City</strong> routes to {activeTrip.destination}.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button
                          onClick={() => {
                            handleSendMessage(`Run a Kiwi/Kayak Hacker Fare search for flights to ${activeTrip.destination} around ${activeTrip.dates}. Check if booking two separate one-ways on different airlines or connecting through a low-cost carrier hub saves money compared to direct round-trips.`);
                            setIsChatOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
                        >
                          <ArrowLeftRight size={12} className="inline mr-1" />
                          Split-Ticket Scan
                        </button>
                        <button
                          onClick={() => setIsFlightModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                        >
                          Configure Hacker Filters
                        </button>
                      </div>
                    </div>

                    {/* AwardWallet & On-Device Agent Sync Explainer Banner */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 md:mt-0">
                          <Wallet size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-white mb-0.5">AwardWallet & Seats.aero Mobile Agent Sync</div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">
                            No API needed! Your on-device mobile agent (Android Accessibility / iOS Shortcuts / text copy) can capture AwardWallet balances or Seats.aero award screenshots and paste them straight into the <strong className="text-blue-400 cursor-pointer" onClick={() => setActiveTab('brain')}>Travel Brain</strong>. Gemini will parse them automatically into your loyalty portfolio and research inbox.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleSendMessage("I want to import my loyalty points balance or an award flight confirmation. How should I paste it?");
                          setIsChatOpen(true);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                      >
                        How to Sync
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTrip.researchInbox.map(item => (
                        <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{item.provider}</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">${item.price}</span>
                            </div>
                            <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                            <p className="text-xs text-slate-400 mb-3">Saved in Research Inbox for {activeTrip.destination}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-amber-400 font-mono font-semibold">{item.points_price ? `${item.points_price.toLocaleString()} Points` : 'Cash Fare'}</span>
                            <button
                              onClick={() => {
                                handleSendMessage(`Give me more details on ${item.title} and how to book it for ${activeTrip.destination}.`);
                                setIsChatOpen(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                            >
                              Inquire Concierge <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PACKING CHECKLIST VIEW */}
                {activeTab === 'packing' && (
                  <PackingView 
                    trip={activeTrip} 
                    onUpdateTrip={handleUpdateActiveTrip} 
                  />
                )}

                {/* 5. EXPENSE LEDGER VIEW */}
                {activeTab === 'expenses' && (
                  <ExpenseView 
                    trip={activeTrip} 
                    onUpdateTrip={handleUpdateActiveTrip} 
                  />
                )}

                {/* 6. COGNITIVE TRAVEL BRAIN VIEW */}
                {activeTab === 'brain' && (
                  <BrainView 
                    trip={activeTrip} 
                    onUpdateTrip={handleUpdateActiveTrip} 
                  />
                )}

                {/* 7. CULTURAL INTELLIGENCE VIEW */}
                {activeTab === 'culture' && (
                  <CulturalView 
                    trip={activeTrip} 
                    onUpdateTrip={handleUpdateActiveTrip} 
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                <Compass size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Active Trips Found</h2>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Create a new intelligent travel workspace with custom itineraries, points arbitrage strategies, and packing checklists.
              </p>
              <button
                onClick={() => setIsNewTripModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
              >
                <Plus size={16} /> Create First Trip
              </button>
            </div>
          )}
        </main>

        {/* =========================================================================
            RIGHT: DOCKED CONCIERGE CHAT COPILOT
           ========================================================================= */}
        {isChatOpen && (
          <aside className="w-full md:w-[420px] lg:w-[460px] border-l border-slate-800 bg-[#090e18] flex flex-col shrink-0 z-20 shadow-2xl transition-all">
            {/* Concierge Header */}
            <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between bg-[#0d131f] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sm text-white">Voyager Concierge</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">Gemini 2.5</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceMode(true)}
                  className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
                  title="Switch to Live Voice Mode"
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Minimize Concierge"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Context Strip */}
            {activeTrip && (
              <div className="px-4 py-2 bg-blue-950/30 border-b border-slate-800/80 text-[11px] text-blue-300 flex items-center justify-between">
                <span className="truncate">Active Dossier: <strong>{activeTrip.destination}</strong></span>
                <span className="font-mono text-slate-400">{activeTrip.dates}</span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onSave={msg.role === 'model' ? handleSaveChatTrip : undefined}
                  onSelectOption={handleSendMessage}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto select-none shrink-0">
              {[
                "Suggest 3 dinner spots",
                "How to redeem Amex points?",
                "Optimize Day 2",
                "Packing tips for rain"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-colors border border-slate-700/50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-[#0d131f] shrink-0">
              <ChatInput onSendMessage={handleSendMessage} disabled={isAiLoading} />
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          ALL APPLICATION MODALS & OVERLAYS
         ========================================================================= */}
      
      {/* 1. Live Web Audio Voice Mode Overlay */}
      <VoiceOverlay 
        isOpen={isVoiceMode} 
        onClose={() => setIsVoiceMode(false)} 
      />

      {/* 2. New Intelligent Trip Creator Modal */}
      <NewTripModal 
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
      />

      {/* 3. Flight Search Modal */}
      <FlightSearchModal 
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        onSearch={query => {
          handleSendMessage(query);
          setIsChatOpen(true);
        }}
      />

      {/* 4. Hotel Search Modal */}
      <HotelSearchModal 
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        onSearch={query => {
          handleSendMessage(query);
          setIsChatOpen(true);
        }}
      />

      {/* 5. User Travel Profile & Preferences Modal */}
      <UserProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSave={p => setUserProfile(p)}
        savedTripsCount={savedTrips.length}
      />

      {/* 6. Saved Trips Modal */}
      <SavedTripsModal 
        isOpen={isSavedTripsOpen}
        onClose={() => setIsSavedTripsOpen(false)}
        savedTrips={savedTrips}
        onDelete={id => setSavedTrips(prev => prev.filter(t => t.id !== id))}
        onUpdate={updated => setSavedTrips(prev => prev.map(t => t.id === updated.id ? updated : t))}
      />

      {/* 7. Architecture Combiner Blueprint Modal */}
      <AppCombinerModal 
        isOpen={isCombinerOpen}
        onClose={() => setIsCombinerOpen(false)}
      />
    </div>
  );
};

export default App;
