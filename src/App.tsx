import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, BrainCircuit, History, Coins, Plus, 
  MapPin, Calendar, ArrowRight, ShieldCheck,
  PlaneTakeoff, Building2
} from 'lucide-react';
import { TravelOSState, Trip, ResearchEntry, Strategy, LoyaltyAccount } from './types';

// Initial state fallback if nothing in localStorage
const DEFAULT_STATE: TravelOSState = {
  profile: { 
    loyalty: [
      { program: "Marriott", balance: 145000, color: "bg-orange-500" },
      { program: "Amex MR", balance: 420000, color: "bg-blue-400" },
      { program: "Accor", balance: 12000, color: "bg-yellow-600" }
    ] 
  },
  trips: []
};

export default function App() {
  const [state, setState] = useState<TravelOSState | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [currentView, setCurrentView] = useState<'trip' | 'memory' | 'ledger' | 'new_trip'>('new_trip');
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [newTripStr, setNewTripStr] = useState("");
  const inboxEndRef = useRef<HTMLDivElement>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('travel_os_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        if (parsed.trips && parsed.trips.length > 0) {
          setActiveTripId(parsed.trips[0].id);
          setCurrentView('trip');
        } else {
           setCurrentView('new_trip');
        }
      } catch (e) {
        setState(DEFAULT_STATE);
        setCurrentView('new_trip');
      }
    } else {
      setState(DEFAULT_STATE);
      setCurrentView('new_trip');
    }
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
    if (state) {
      localStorage.setItem('travel_os_state', JSON.stringify(state));
    }
    // scrollToBottom
    if (inboxEndRef.current) {
        inboxEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state]);

  const activeTrip = state?.trips.find(t => t.id === activeTripId);

  const handleCommand = async () => {
    if (!commandInput.trim() || !state || !activeTripId) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentState: state,
          input: `[Trip: ${activeTrip?.destination}] ${commandInput}`
        })
      });

      if (!response.ok) {
        throw new Error('AI Engine failed to process');
      }

      const updatedState = await response.json();
      setState(updatedState);
      setCommandInput("");
    } catch (error) {
      console.error(error);
      alert("Failed to process command. Please ensure GEMINI_API_KEY is set in your environment.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDecide = async (strategyTitle: string) => {
    if (!state || !activeTripId) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentState: state,
          input: `I have decided to select the strategy: "${strategyTitle}". Please update the decision log for the trip: ${activeTrip?.destination}.`
        })
      });

      if (response.ok) {
        const updatedState = await response.json();
        setState(updatedState);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  }

  if (!state) return null;

  return (
    <div className="flex h-screen bg-[#020202] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* SIDEBAR: MULTI-TRIP MANAGEMENT */}
      <nav className="w-64 border-r border-white/5 bg-[#080808] flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
            <Zap className="text-white fill-current" size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">TravelOS</h1>
        </div>

        <div className="flex-1 px-4 space-y-6 overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Trips</span>
              <button onClick={() => setCurrentView('new_trip')} className="hover:text-white transition-colors cursor-pointer text-slate-500">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1">
              {state.trips.map((trip: Trip) => (
                <button 
                  key={trip.id}
                  onClick={() => { setActiveTripId(trip.id); setCurrentView('trip'); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTripId === trip.id && currentView === 'trip' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <MapPin size={16} />
                  <div className="text-left overflow-hidden">
                    <div className="text-sm font-bold truncate w-32">{trip.destination}</div>
                    <div className="text-[10px] opacity-50">{trip.dates}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Intelligence</span>
            <div className="mt-3 space-y-1">
              <NavItem icon={<History size={16}/>} label="Travel Memory" active={currentView === 'memory'} onClick={() => setCurrentView('memory')} />
              <NavItem icon={<Coins size={16}/>} label="Loyalty Ledger" active={currentView === 'ledger'} onClick={() => setCurrentView('ledger')} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="bg-gradient-to-br from-slate-900 to-black p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Yash's Profile</div>
            <div className="text-sm font-bold text-white mb-1">Status: Platinum</div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 w-3/4 h-full" />
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {currentView === 'new_trip' && (
           <NewTripView 
              onResearch={async (formData) => {
                 // First create the trip locally
                  const newTrip: Trip = {
                     id: Math.random().toString(36).substr(2, 9),
                     destination: formData.destination,
                     dates: formData.dates,
                     travellers: formData.travellers,
                     cabinPreference: formData.cabin,
                     hotelPreference: formData.hotel,
                     status: 'planning',
                     researchInbox: [],
                     strategies: [],
                     decisionLog: []
                 };
                 setState(prev => prev ? {...prev, trips: [...prev.trips, newTrip]} : null);
                 setActiveTripId(newTrip.id);
                 setCurrentView('trip');
                 
                 // Then trigger intelligence
                 if (state) {
                     setIsAiLoading(true);
                     try {
                        const response = await fetch('/api/intelligence', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              currentState: {...state, trips: [...state.trips, newTrip]},
                              input: `I am planning a new trip to ${formData.destination} for ${formData.dates}. We are ${formData.travellers}. I prefer ${formData.cabin} for flights and ${formData.hotel} for hotels. Please gather realistic research data (flights, hotels) matching these criteria into the researchInbox, then generate the 4 strategies.`
                            })
                        });
                        if (response.ok) {
                            const updatedState = await response.json();
                            setState(updatedState);
                        }
                     } catch(e) {
                         console.error(e);
                     } finally {
                         setIsAiLoading(false);
                     }
                 }
              }}
           />
        )}

        {currentView === 'trip' && activeTrip && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* HUD: LOYALTY PORTFOLIO */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#020202]/80 backdrop-blur-xl z-10 shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white">{activeTrip.destination}</h2>
                <div className="h-4 w-px bg-white/10" />
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Calendar size={14} /> {activeTrip.dates}
                </div>
              </div>

              <div className="flex gap-3">
                {state.profile.loyalty.map((l: LoyaltyAccount, i) => (
                  <div key={l.program + i} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${l.color || 'bg-slate-500'}`} />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 leading-none">{l.program}</div>
                      <div className="text-sm font-mono text-white leading-none mt-1">{l.balance.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </header>

            {/* WORKSPACE GRID */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* RESEARCH INBOX */}
              <section className="w-[400px] border-r border-white/5 flex flex-col bg-[#050505] shrink-0">
                <div className="p-6 border-b border-white/5 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                      <BrainCircuit size={14} /> Research Inbox
                    </h3>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCommand();
                        }
                      }}
                      disabled={isAiLoading}
                      placeholder="Paste context, flight details, configs, or commands..."
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 text-sm focus:border-blue-500/50 outline-none h-32 transition-all resize-none disabled:opacity-50 text-white placeholder:text-slate-600 block"
                    />
                    <button 
                      onClick={handleCommand}
                      className="absolute bottom-4 right-4 bg-blue-600 p-2 rounded-lg text-white opacity-0 group-focus-within:opacity-100 transition-opacity disabled:opacity-50 hover:bg-blue-500 cursor-pointer"
                      disabled={isAiLoading || !commandInput.trim()}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeTrip.researchInbox && activeTrip.researchInbox.length > 0 ? (
                    <>
                      {activeTrip.researchInbox.map((r: ResearchEntry, i) => <ResearchItem key={r.id || i} data={r} />)}
                      <div ref={inboxEndRef} className="h-4" />
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-600 text-sm italic">Inbox empty. Start routing data to the Scout.</div>
                  )}
                </div>
              </section>

              {/* STRATEGY ENGINE OUTPUT */}
              <section className="flex-1 p-10 overflow-y-auto bg-black relative">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white">Generated Strategies</h2>
                    {activeTrip.strategies && activeTrip.strategies.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-tighter shrink-0 ml-4">
                        <ShieldCheck size={14} /> Intelligence Verified
                      </div>
                    )}
                  </div>

                  {(!activeTrip.strategies || activeTrip.strategies.length === 0) ? (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-30 mt-12 bg-[#020202]">
                      <BrainCircuit size={48} className="mb-4 text-blue-500" />
                      <p className="text-lg font-medium tracking-tight">Strategy Engine Awaiting Context</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                       {/* Executive Summary Recommended */}
                       {activeTrip.strategies.find(s => s.type === 'balanced') && (
                          <div>
                             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                               <div className="bg-blue-600/20 p-2 rounded-lg">
                                  <Zap className="text-blue-500" size={18} />
                               </div>
                               Executive Recommendation
                             </h3>
                             <StrategyCard 
                                strategy={activeTrip.strategies.find(s => s.type === 'balanced')!} 
                                onDecide={() => handleDecide(activeTrip.strategies.find(s => s.type === 'balanced')!.title)} 
                                isFeatured={true}
                              />
                          </div>
                      )}

                      {/* Alternatives Grid */}
                      <div>
                        {activeTrip.strategies.some(s => s.type !== 'balanced') && (
                             <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest px-1">Alternative Paths</h3>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {activeTrip.strategies.filter(s => s.type !== 'balanced').map((s: Strategy, i) => (
                             <StrategyCard key={i} strategy={s} onDecide={() => handleDecide(s.title)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DECISION LOGS / MEMORY FEEDBACK */}
                  <div className="mt-12 mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Decision Logs & Memory</h3>
                    <div className="bg-[#080808] border border-white/5 rounded-2xl p-6">
                      {(!activeTrip.decisionLog || activeTrip.decisionLog.length === 0) ? (
                        <p className="text-sm text-slate-600 italic">No decisions logged for this trip yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {activeTrip.decisionLog.map((log: string, i: number) => (
                            <div key={i} className="flex gap-4 items-start">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                              <p className="text-sm text-slate-400">{log}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {currentView === 'memory' && <MemoryView state={state} />}
        {currentView === 'ledger' && <LedgerView state={state} />}

        {/* LOADING OVERLAY */}
        {isAiLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <BrainCircuit className="absolute m-auto text-blue-500" size={24} />
            </div>
            <p className="mt-4 text-xs font-bold tracking-widest text-white animate-pulse">ORCHESTRATING AGENTS...</p>
          </div>
        )}
      </main>
    </div>
  );
}

// SHARED SUB-COMPONENTS
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}>
      {icon} {label}
    </button>
  );
}

function ResearchItem({ data }: { data: ResearchEntry }) {
  const CategoryIcon = data.category === 'flight' ? PlaneTakeoff : data.category === 'hotel' ? Building2 : Coins;

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
           <CategoryIcon size={12} className="text-slate-400" />
           {data.category} • {data.provider}
        </span>
        {data.price !== undefined && (
           <span className="text-xs font-mono font-bold text-slate-300">${data.price}</span>
        )}
      </div>
      <div className="text-sm font-medium text-white mb-3 leading-tight">{data.title}</div>
      
      {(data.points_price || data.cpp) && (
        <div className="bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5">
            {data.points_price && (
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{data.points_price.toLocaleString()} pts</div>
            )}
            {data.cpp && data.cpp > 0 && (
                <div className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">{data.cpp.toFixed(2)} CPP</div>
            )}
        </div>
      )}
    </div>
  );
}

function StrategyCard({ strategy, onDecide, isFeatured }: { strategy: Strategy, onDecide: () => void, isFeatured?: boolean }) {
  const labels: Record<string, string> = {
    value: 'Best Value',
    premium: 'Premium',
    points: 'Best Points',
    balanced: 'Balanced (Recommended)'
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all flex flex-col ${isFeatured ? 'bg-gradient-to-b from-blue-900/10 to-[#080808] border-blue-500/30 shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)]' : 'bg-[#080808] border-white/5 hover:border-white/10'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isFeatured ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/10 text-slate-400'}`}>
          {labels[strategy.type] || strategy.type || "Option"}
        </div>
        <div className="text-right">
          <div className={`${isFeatured ? 'text-5xl border-b border-white/10 pb-2 mb-2' : 'text-3xl'} font-black text-white shrink-0`}>${strategy.total_cash || 0}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Est. Cash</div>
        </div>
      </div>
      <h3 className={`${isFeatured ? 'text-2xl' : 'text-xl'} font-bold text-white mb-3 tracking-tight`}>{strategy.title}</h3>
      <p className={`text-slate-400 mb-8 leading-relaxed italic flex-1 ${isFeatured ? 'text-base' : 'text-sm'}`}>"{strategy.rationale}"</p>
      
      {strategy.total_points > 0 && (
         <div className={`mb-6 text-sm font-mono font-bold flex items-center justify-between p-4 rounded-xl border ${isFeatured ? 'bg-blue-900/10 text-blue-400 border-blue-500/20' : 'text-slate-400 bg-black/40 border-white/5'}`}>
            <span className="font-sans text-xs uppercase tracking-widest">Points Allocation</span>
            <span>{strategy.total_points.toLocaleString()} pts</span>
         </div>
      )}

      <button onClick={onDecide} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer ${isFeatured ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
        Confirm Decision
      </button>
    </div>
  );
}

function MemoryView({ state }: { state: TravelOSState }) {
  return (
      <div className="flex-1 overflow-y-auto p-10 bg-black">
         <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-4 mb-8">
                 <div className="bg-white/10 p-3 rounded-xl">
                    <History size={24} className="text-white" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight">Travel Memory</h2>
             </div>
             <p className="text-slate-400 mb-10 leading-relaxed max-w-2xl">
                 This is the global decision memory for the Intelligence Engine. The Strategist uses these past decisions to learn your preferences and avoid previously rejected paths.
             </p>

             <div className="space-y-6">
                 {state.trips.map(trip => (
                     <div key={trip.id} className="bg-[#080808] border border-white/5 rounded-3xl p-8">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <h3 className="text-xl font-bold text-white tracking-tight">{trip.destination}</h3>
                                 <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{trip.dates}</span>
                             </div>
                         </div>
                         {(trip.decisionLog && trip.decisionLog.length > 0) ? (
                             <div className="space-y-4">
                                {trip.decisionLog.map((log: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start bg-white/5 p-4 border border-white/5 rounded-2xl">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                        <p className="text-sm text-slate-300">{log}</p>
                                    </div>
                                ))}
                             </div>
                         ) : (
                             <p className="text-sm text-slate-600 italic">No decisions logged for this trip yet.</p>
                         )}
                     </div>
                 ))}
             </div>
         </div>
      </div>
  );
}

function LedgerView({ state }: { state: TravelOSState }) {
    return (
        <div className="flex-1 overflow-y-auto p-10 bg-black">
             <div className="max-w-4xl mx-auto">
                 <div className="flex items-center gap-4 mb-8">
                     <div className="bg-yellow-600/20 text-yellow-500 p-3 rounded-xl border border-yellow-600/30">
                        <Coins size={24} />
                     </div>
                     <h2 className="text-3xl font-black text-white tracking-tight">Loyalty Ledger</h2>
                 </div>
                 <p className="text-slate-400 mb-10 leading-relaxed max-w-2xl">
                     Current balances monitored by the Banker. This directly influences CPP (Cents-Per-Point) calculations during Strategy generation.
                 </p>
    
                 <div className="grid grid-cols-2 gap-6">
                     {state.profile.loyalty.map((l: LoyaltyAccount, i) => (
                         <div key={l.program + i} className="bg-[#080808] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className={`w-4 h-4 rounded-full ${l.color || 'bg-slate-500'} shadow-lg shadow-black/50`} />
                                  <span className="text-lg font-bold text-white">{l.program}</span>
                              </div>
                              <div className="text-2xl font-mono text-white tracking-tighter flex items-baseline">
                                  {l.balance.toLocaleString()} 
                                  <span className="text-sm text-slate-500 ml-2 font-sans font-bold uppercase tracking-widest">PTS</span>
                              </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    )
}

function NewTripView({ onResearch }: { onResearch: (data: any) => void }) {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travellers, setTravellers] = useState('1 Adult');
  const [cabin, setCabin] = useState('Business');
  const [hotel, setHotel] = useState('5 Star / Luxury');

  return (
      <div className="flex-1 overflow-y-auto p-10 bg-[#020202] flex items-center justify-center">
         <div className="w-full max-w-2xl bg-[#080808] border border-white/5 p-10 rounded-[2rem] shadow-2xl">
              <h2 className="text-3xl font-black text-white mb-2">New Trip</h2>
              <p className="text-slate-400 mb-10">Define parameters for the Strategy Engine.</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Destination</label>
                    <input 
                       className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500" 
                       placeholder="e.g. Tokyo, Japan"
                       value={destination}
                       onChange={e => setDestination(e.target.value)}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Dates</label>
                        <input 
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500" 
                           placeholder="e.g. Oct 10 - Oct 24"
                           value={dates}
                           onChange={e => setDates(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Travellers</label>
                        <input 
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500" 
                           placeholder="e.g. 2 Adults"
                           value={travellers}
                           onChange={e => setTravellers(e.target.value)}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Cabin Preference</label>
                        <select 
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 appearance-none"
                           value={cabin}
                           onChange={e => setCabin(e.target.value)}
                        >
                            <option>Economy</option>
                            <option>Premium Economy</option>
                            <option>Business</option>
                            <option>First Class</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Hotel Preference</label>
                        <select 
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 appearance-none"
                           value={hotel}
                           onChange={e => setHotel(e.target.value)}
                        >
                            <option>Budget / Select Service</option>
                            <option>4 Star / Boutique</option>
                            <option>5 Star / Luxury</option>
                            <option>Ultra Luxury (Aman, etc)</option>
                        </select>
                    </div>
                 </div>

                 <button 
                    disabled={!destination.trim()}
                    onClick={() => onResearch({ destination, dates, travellers, cabin, hotel })}
                    className="w-full mt-8 py-5 rounded-2xl font-black bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-xl shadow-blue-600/20 text-lg tracking-tight"
                 >
                     RESEARCH TRIP
                 </button>
              </div>
         </div>
      </div>
  );
}

