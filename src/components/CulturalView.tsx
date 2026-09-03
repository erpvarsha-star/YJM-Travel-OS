import React, { useState } from 'react';
import { Trip, CulturalInsight } from '../types';
import { 
  ShieldAlert, 
  Languages, 
  Sparkles, 
  Phone, 
  Zap, 
  Coins, 
  Check, 
  Volume2, 
  Lightbulb,
  HeartHandshake
} from 'lucide-react';

interface CulturalViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const CulturalView: React.FC<CulturalViewProps> = ({ trip, onUpdateTrip }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);

  const insights: CulturalInsight = trip.culturalInsights || {
    emergencyNumbers: {
      police: '112 / 911',
      ambulance: '112 / 911',
      general: 'International Emergency: 112',
    },
    etiquette: [
      'Be mindful of local dress codes when visiting sacred or historic sites.',
      'Greet locals politely before asking for directions or making requests.',
      'Keep your voice at a considerate volume on public transport.',
      'Always carry a photocopy or digital backup of your passport and visas.',
    ],
    phrases: [
      { original: 'Hello / Greetings', phonetic: 'Hello', english: 'Hello' },
      { original: 'Thank you', phonetic: 'Thank you', english: 'Thank you' },
      { original: 'Please', phonetic: 'Please', english: 'Please' },
      { original: 'The bill, please', phonetic: 'The bill, please', english: 'The bill, please' },
    ],
    localHacks: [
      'Download offline maps on Google Maps or Maps.me before leaving your hotel WiFi.',
      'Carry a small power bank for long walking days.',
    ],
    powerPlugInfo: 'Standard international adapters recommended.',
    tippingCulture: 'Check local norms: often included in bill or modest rounding up.',
    weatherSummary: 'Moderate seasonal weather.',
  };

  const handleRefreshCulture = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/cultural/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          country: trip.country,
        }),
      });

      const data = await res.json();
      if (data.emergencyNumbers) {
        onUpdateTrip({
          ...trip,
          culturalInsights: data,
        });
      }
    } catch (err) {
      console.error('Failed to generate cultural insights:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      setSpeakingPhrase(text);
      utterance.onend = () => setSpeakingPhrase(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <HeartHandshake className="h-5 w-5" />
            <h2 className="text-base font-semibold text-stone-900">
              Cultural Protocol, Etiquette & Local Survival Guide
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Crucial nuances, faux pas prevention, emergency contact lines, and native survival phrases for {trip.destination}.
          </p>
        </div>

        <button
          onClick={handleRefreshCulture}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`h-3.5 w-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Gemini Researching...' : 'Gemini Refresh Guide'}</span>
        </button>
      </div>

      {/* Emergency & Practical Specs Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <Phone className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Emergency Hotlines
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Police Dispatch:</span>
              <span className="font-bold text-red-600 font-mono">
                {insights.emergencyNumbers.police}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Medical / Ambulance:</span>
              <span className="font-bold text-red-600 font-mono">
                {insights.emergencyNumbers.ambulance}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">General Helpline:</span>
              <span className="font-medium text-stone-800">
                {insights.emergencyNumbers.general}
              </span>
            </div>
          </div>
        </div>

        {/* Electrical Plugs */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-amber-600">
            <Zap className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Power & Adapters
            </h3>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            {insights.powerPlugInfo}
          </p>
          <div className="text-[11px] text-stone-400">
            Make sure to carry dual-voltage cords or universal adapters.
          </div>
        </div>

        {/* Tipping & Gratuity */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Coins className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Tipping Customs
            </h3>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            {insights.tippingCulture}
          </p>
          <div className="text-[11px] text-stone-400">
            Avoid awkward over-tipping or under-tipping situations.
          </div>
        </div>
      </div>

      {/* Cultural Etiquette Rules */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-stone-900 flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>Local Etiquette & Social Rules to Respect</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.etiquette.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start space-x-2.5 text-xs text-stone-800 leading-relaxed"
            >
              <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                {idx + 1}
              </div>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Survival Phrasebook with Audio */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center space-x-2">
            <Languages className="h-4 w-4 text-indigo-600" />
            <span>Essential Native Survival Phrases</span>
          </h3>
          <span className="text-[11px] text-stone-400">Tap speaker icon to listen</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.phrases.map((phrase, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-colors flex flex-col justify-between space-y-2 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">{phrase.english}</span>
                  <button
                    onClick={() => handleSpeak(phrase.phonetic || phrase.original)}
                    className="text-stone-400 hover:text-amber-600 p-1 rounded transition-colors"
                    title="Speak pronunciation"
                  >
                    <Volume2 className={`h-4 w-4 ${speakingPhrase === phrase.phonetic ? 'text-amber-600 animate-pulse' : ''}`} />
                  </button>
                </div>
                <div className="text-base font-bold text-amber-800 mt-1 font-sans">
                  {phrase.original}
                </div>
              </div>

              <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2 py-1 rounded">
                Pronounced: "{phrase.phonetic}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insider Local Hacks */}
      <div className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200 space-y-3">
        <h3 className="text-sm font-semibold text-amber-950 flex items-center space-x-2">
          <Lightbulb className="h-4 w-4 text-amber-700" />
          <span>Local Hacks & Secret Shortcuts</span>
        </h3>

        <div className="space-y-2">
          {insights.localHacks.map((hack, idx) => (
            <div
              key={idx}
              className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs text-stone-800 flex items-start space-x-2.5 leading-relaxed"
            >
              <span className="text-amber-600 font-bold text-sm leading-none">•</span>
              <span>{hack}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
