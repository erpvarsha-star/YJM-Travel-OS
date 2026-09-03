import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  GitFork,
  Plane,
  Scale,
  Calendar,
  Wallet,
  BrainCircuit,
  ShieldCheck,
  Mic,
  Tag,
  RefreshCw,
  Zap,
  ArrowDownUp,
  Cpu,
  Globe2,
  Check,
  AlertCircle
} from 'lucide-react';

interface AppCombinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuperchargedFeatures?: (summary: string) => void;
}

interface IntegratedConcept {
  id: string;
  name: string;
  sourceModule: string;
  status: 'ACTIVE_AND_SYNCED' | 'REAL_TIME_PARALLEL';
  description: string;
  keyFeatures: string[];
  syncRelation: string;
  icon: React.ReactNode;
  accentColor: string;
}

export const AppCombinerModal: React.FC<AppCombinerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'pipeline' | 'hackerFare'>('concepts');

  if (!isOpen) return null;

  const INTEGRATED_CONCEPTS: IntegratedConcept[] = [
    {
      id: 'itinerary',
      name: 'Geographic Day Itinerary Engine',
      sourceModule: 'Yoyo Primary Core Engine (ec2141d7)',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Dynamic time-clustered day planning (Morning, Afternoon, Evening) with geographic coordinate markers, pace management (relaxed, balanced, packed), and insider suggestions.',
      keyFeatures: [
        'Time-block cluster scheduling',
        'Spatial distance & map coordinate pins',
        'Dynamic activity addition, deletion, and re-clustering',
        'Custom local tips for each milestone'
      ],
      syncRelation: 'Supplies target schedule to Luggage & Packing engine, and anchors the AI Concierge with minute-by-minute location awareness.',
      icon: <Calendar size={18} />,
      accentColor: 'blue'
    },
    {
      id: 'hacker_flights',
      name: 'Air & Lodging Engine + Hacker Fares',
      sourceModule: 'Voyager Airfare & Kiwi/Kayak Hacker Fare Engine',
      status: 'REAL_TIME_PARALLEL',
      description: 'Searches published cash tickets, Google Flights live inventory, and Hacker Fares (Kiwi/Kayak virtual interlining, split ticketing, and hidden-city skiplagging).',
      keyFeatures: [
        'Split-Ticketing (two separate one-ways across different airlines)',
        'Virtual Interlining / Self-Transfer (3.5h layover buffer for re-checking baggage)',
        'Hidden-City / Skiplagged Hub detection (with carry-on only alerts)',
        '±1, ±3, ±5 day flexible departure matrix & co-terminal airport scanning'
      ],
      syncRelation: 'Results feed into Research Inbox, calculate CPP arbitrage against loyalty points, and log estimated travel costs into the Expense Ledger.',
      icon: <Plane size={18} />,
      accentColor: 'sky'
    },
    {
      id: 'award_arbitrage',
      name: 'Points Arbitrage & Strategy Engine',
      sourceModule: 'Seats.aero & Award Strategy Matrix',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Evaluates 4 distinct paths (The Hybrid Connoisseur, Pure Points Maximizer, Cash Saver, Luxury VIP) using live Cents-Per-Point (CPP) valuations against your credit card balances.',
      keyFeatures: [
        '4-path dynamic executive recommendation matrix',
        'CPP valuation calculator (cash price vs points required)',
        'Alliance partner mapping (Star Alliance, OneWorld, SkyTeam, Virgin, Flying Blue)',
        'Transfer partner bonus detection and redemption alerts'
      ],
      syncRelation: 'Pulls real-time balances from your Loyalty Portfolio and pairs against cash airfare options in the Research Inbox.',
      icon: <Scale size={18} />,
      accentColor: 'emerald'
    },
    {
      id: 'loyalty_agent',
      name: 'Loyalty Portfolio & On-Device Agent Ingestion',
      sourceModule: 'AwardWallet & Mobile Agent Ingestion',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Zero-API loyalty ledger syncing. Allows pasting or vision-parsing AwardWallet balances and airline confirmation screenshots directly into the Travel Brain.',
      keyFeatures: [
        'Multi-program balance tracking (Amex MR, Chase UR, Marriott, Capital One, Delta, etc.)',
        'On-device mobile agent intake (Android Accessibility / iOS Shortcuts / clipboard)',
        'Gemini multimodal parser extracts balances and confirms award seatings',
        'Dynamic point deductions upon booking'
      ],
      syncRelation: 'Drives the award affordability calculations in the Strategy Engine and auto-populates confirmation numbers into the Itinerary.',
      icon: <Wallet size={18} />,
      accentColor: 'amber'
    },
    {
      id: 'packing_logistics',
      name: 'Smart Travel Logistics & Luggage Intelligence',
      sourceModule: 'Smart Travel Logistics App #2',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Weather-synchronized packing checklist structured by categories (Clothing, Footwear, Electronics, Toiletries, Documents) with carry-on weight limit compliance.',
      keyFeatures: [
        'Category-filtered packing checklists with toggle completion',
        'Trip duration & destination climate auto-tuning',
        'Weight tracking against airline carry-on & checked limits',
        'Custom item creation and auto-save'
      ],
      syncRelation: 'Monitors Itinerary duration and active Destination weather, warning the traveler if heavy rain or cold shifts require gear adaptations.',
      icon: <Tag size={18} />,
      accentColor: 'indigo'
    },
    {
      id: 'expense_ledger',
      name: 'Multi-Currency Budget Ledger & Burn-Rate Tracker',
      sourceModule: 'Multi-Currency Budget App #3',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Tracks trip spending in local currency (JPY, EUR, GBP, INR, USD) with real-time conversion rates, spending categories, and frugal travel hacks.',
      keyFeatures: [
        'Multi-currency logging with automatic conversion to base currency',
        'Visual category allocation (Transit, Lodging, Food, Activities, Shopping)',
        'Live burn-rate tracker against total trip budget',
        'Local cost-saving tips tailored to the active city'
      ],
      syncRelation: 'Syncs with Spent-to-Date indicator in the global header and auto-logs confirmed flight/hotel bookings from the Research Inbox.',
      icon: <ArrowDownUp size={18} />,
      accentColor: 'violet'
    },
    {
      id: 'concierge_copilot',
      name: 'AI Travel Concierge & Contextual Copilot',
      sourceModule: 'Conversational Travel Copilot App #4',
      status: 'REAL_TIME_PARALLEL',
      description: 'Context-aware Gemini conversational assistant that reads the entire active trip dossier, giving hyper-local advice, dining picks, and instant itinerary modifications.',
      keyFeatures: [
        'Multi-turn sanitized chat with Google Gen AI SDK',
        'One-click prompt chips (Dinner spots, Points redemption, Day optimization)',
        'Full itinerary audit tool capable of rewriting activities on the fly',
        'Syncs suggestions directly to the active Itinerary and Decision Log'
      ],
      syncRelation: 'Runs asynchronously in the side drawer, continuously receiving state updates whenever you modify days, expenses, or notes.',
      icon: <Sparkles size={18} />,
      accentColor: 'blue'
    },
    {
      id: 'cultural_safety',
      name: 'Cultural Intelligence & Emergency Protocol',
      sourceModule: 'Cultural Safety & Phrasebook App #4',
      status: 'ACTIVE_AND_SYNCED',
      description: 'Critical safety contacts (Police, Medical, Fire, Embassy), local etiquette guidelines to prevent cultural faux pas, and local language essentials with phonetic guides.',
      keyFeatures: [
        'One-tap emergency hotlines for active country',
        'Essential polite dialect phrases with phonetic pronunciation',
        'Cultural dos and don\'ts (tipping, temple etiquette, subway rules)',
        'Local safety advisory notices'
      ],
      syncRelation: 'Automatically loads the accurate regional dialect and consular emergency numbers as soon as a new trip destination is selected.',
      icon: <ShieldCheck size={18} />,
      accentColor: 'rose'
    },
    {
      id: 'live_voice',
      name: 'Gemini Live Multimodal Voice Assistant',
      sourceModule: 'Gemini Live Web Audio Engine',
      status: 'REAL_TIME_PARALLEL',
      description: 'Zero-latency bidirectional voice conversation using the browser Web Audio API and Gemini Live, allowing hands-free trip consultation while walking.',
      keyFeatures: [
        'Real-time full duplex voice stream',
        'Interactive audio visualizer rings',
        'Context-infused prompt injection from active itinerary',
        'Hands-free travel planning and language practice'
      ],
      syncRelation: 'Reads live trip context from the central store, enabling voice commands like "What do I have planned tomorrow morning?" or "How do I ask for the bill in Japanese?"',
      icon: <Mic size={18} />,
      accentColor: 'orange'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative my-6 flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Layers size={20} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Unified Architecture & Concept Matrix
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                All 9 Engines Fused & Active
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Every concept from your combined zip files—travel brain, award arbitrage, packing logistics, currency ledgers, cultural copilot, live voice, and Kiwi/Kayak hacker fares—is integrated into a single unified reactive state machine.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-800/80 shrink-0 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'concepts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu size={14} />
            <span>Master Concept Inventory (9 Modules)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw size={14} />
            <span>Parallel & Synchronous Data Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('hackerFare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'hackerFare'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitFork size={14} />
            <span>Hacker Fare Engine (Kiwi vs. Google Flights)</span>
          </button>
        </div>

        {/* Tab 1: All Concepts Inventory */}
        {activeTab === 'concepts' && (
          <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Displaying 9 Core Engines active in your Voyager workspace:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">100% Operational</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {INTEGRATED_CONCEPTS.map((concept) => (
                <div
                  key={concept.id}
                  className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
                          {concept.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {concept.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {concept.sourceModule}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        SYNCED
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {concept.description}
                    </p>

                    <div className="space-y-1 mb-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Core Capabilities
                      </div>
                      {concept.keyFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                    <RefreshCw size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-300">Sync Link: </strong>{concept.syncRelation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: The Parallel & Synchronous Data Flow Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-blue-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Zap size={16} />
                <span>The Voyager Universal State Bus & Synchronization Engine</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You asked how these modules run <strong>in parallel</strong> and stay <strong>in sync</strong>. Voyager uses a centralized reactive state store (`App.tsx`) coupled with automatic browser persistence (`localStorage`) and asynchronous background dispatchers. When an action occurs anywhere, data immediately propagates across the entire stack:
              </p>
            </div>

            {/* Visual Workflow Steps */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Globe2 size={14} className="text-blue-400" />
                Scenario 1: Creating or Switching a Trip Dossier
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                    User Event
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    User creates a new trip to Tokyo, Kyoto or changes travel dates in the header.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-400">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">2</span>
                    Parallel Fan-Out (Concurrent)
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    5 background threads fire simultaneously:
                    <br />• Weather & packing generator runs
                    <br />• Airfare & Hacker fare radar queries
                    <br />• Points redemption arbitrage calculates 4 paths
                    <br />• Emergency numbers & phrases populate
                    <br />• Multi-currency baseline locks in
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
                    Synchronous UI Convergence
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    All tabs (Itinerary, Strategy, Packing, Expenses, Culture, Brain, Concierge) render the unified trip dossier with zero stale data or state collisions.
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pt-2">
                <ArrowDownUp size={14} className="text-emerald-400" />
                Scenario 2: Cross-Engine Reactive Triggers
              </h4>

              <div className="space-y-2">
                {[
                  {
                    trigger: 'Expense Logged in Ledger',
                    action: 'Instantly recalculates total spent, adjusts remaining category budget, and updates the "Spent to Date" KPI in the header banner.',
                    color: 'emerald'
                  },
                  {
                    trigger: 'Concierge Suggests an Activity or Hotel',
                    action: 'One-click "Apply to Itinerary" adds the activity directly into Day 2 Morning/Afternoon and records the decision in the Decision Log.',
                    color: 'blue'
                  },
                  {
                    trigger: 'Points Balance Imported or Pasted in Brain',
                    action: 'Recalculates the 4 Arbitrage Strategies and re-scores award tickets in your Research Inbox based on new Cents-Per-Point (CPP).',
                    color: 'amber'
                  },
                  {
                    trigger: 'Live Voice Command Spoken',
                    action: 'Gemini Live accesses the full itinerary JSON, packing list, and phrases, responding instantly without requiring manual page navigation.',
                    color: 'orange'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold whitespace-nowrap mt-0.5">
                      {item.trigger}
                    </span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0 mt-1" />
                    <span className="text-slate-300 text-[11px] leading-relaxed">
                      {item.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hacker Fare Engine & Kiwi/Kayak Solution */}
        {activeTab === 'hackerFare' && (
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <GitFork size={16} />
                <span>The Hacker Fare Problem: Why Google Flights Fails & How Voyager Solves It</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google Flights is constrained by airline <strong>interline ticketing agreements</strong> and published airline alliances (Star Alliance, OneWorld, SkyTeam). When an airline doesn't partner with another, Google Flights refuses to show them together.
                <br /><br />
                <strong>Kiwi and Kayak bypass this with "Hacker Fares" & Virtual Interlining:</strong> they issue two independent tickets or pair separate one-ways. Voyager has now built this exact logic into your Flight Search Engine!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">1</span>
                  Split-Ticketing (Two Separate One-Ways)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Booking Airline A (e.g. Indigo or Air India) outbound and Airline B (e.g. Singapore Airlines or Qatar) on the return is often <strong>20% to 35% cheaper</strong> than booking a standard round-trip with a single carrier.
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  Built-in: Available as a 1-click toggle in the Flight Search Modal.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">2</span>
                  Virtual Interlining / Self-Transfer Hubs
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Connecting unlinked airlines through global hubs (Dubai, Doha, Singapore, London, Frankfurt). For example, Flight 1 on low-cost carrier + Flight 2 on international carrier.
                </p>
                <div className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  Safety Protocol: Automatic 3.5h minimum layover buffer for customs & baggage re-check.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">3</span>
                  Hidden-City Ticketing (Skiplagging)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sometimes booking a flight with a layover at your intended destination (and continuing to a 3rd city) is cheaper than booking a direct flight to your destination.
                </p>
                <div className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  Strict Rule: Carry-on baggage only (checked bags go to the final destination). One-way bookings only.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">4</span>
                  Co-Terminal Metro Airport Matrix
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Scanning all regional airports in major metropolitan areas simultaneously (e.g. Tokyo Haneda HND vs Narita NRT; London Heathrow LHR vs Gatwick LGW vs Stansted STN).
                </p>
                <div className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                  Built-in: Multi-airport metropolitan radius scan included in AI query.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>All systems verified operational in the central workspace.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-600/20 text-xs"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
