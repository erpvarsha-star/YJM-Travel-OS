import React, { useState } from 'react';
import { Trip } from '../types';
import { generateFullTripWithAI } from '../../services/travelBrainService';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Zap, 
  Users,
  Compass
} from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('5');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [travelStyle, setTravelStyle] = useState<'cultural' | 'foodie' | 'balanced' | 'luxury' | 'adventure' | 'backpacker'>('foodie');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'fast-paced'>('moderate');
  const [budget, setBudget] = useState('2000');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [companions, setCompanions] = useState('Solo / Duo');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    if (val === 'USD') setCurrencySymbol('$');
    else if (val === 'EUR') setCurrencySymbol('€');
    else if (val === 'JPY') setCurrencySymbol('¥');
    else if (val === 'GBP') setCurrencySymbol('£');
    else if (val === 'CAD' || val === 'AUD') setCurrencySymbol('$');
    else if (val === 'INR') setCurrencySymbol('₹');
    else setCurrencySymbol(val);
  };

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsGenerating(true);

    try {
      const generatedTrip = await generateFullTripWithAI({
        destination: destination.trim(),
        days: parseInt(days, 10) || 5,
        startDate,
        travelStyle,
        pace,
        budget: parseFloat(budget) || 2000,
        currency,
        currencySymbol,
        companions
      });

      if (notes.trim()) {
        generatedTrip.brainNotes.push({
          id: `note-${Date.now()}`,
          text: notes.trim(),
          type: 'scratchpad',
          tags: ['initial-notes'],
          createdAt: new Date().toISOString().slice(0, 10)
        });
      }

      onCreateTrip(generatedTrip);
      onClose();
    } catch (err) {
      console.error('Failed to generate full trip:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8 animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Architect New Travel Brain
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Gemini will generate geographically clustered itineraries, weather luggage checklists, and cultural protocols in seconds.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerateTrip} className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Destination City or Region *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                required
                placeholder="e.g., Barcelona, Spain or Reykjavik, Iceland"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Travel Archetype
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 capitalize"
              >
                <option value="foodie">Foodie & Culinary</option>
                <option value="cultural">Cultural & Historic</option>
                <option value="balanced">Balanced Highlights</option>
                <option value="adventure">Active & Adventure</option>
                <option value="luxury">Relaxed Luxury</option>
                <option value="backpacker">Frugal Backpacker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pace</label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 capitalize"
              >
                <option value="relaxed">Relaxed & Leisurely</option>
                <option value="moderate">Moderate & Balanced</option>
                <option value="fast-paced">Fast-Paced Explorer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Estimated Budget
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Companions
            </label>
            <input
              type="text"
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              placeholder="Solo, Couple, Family with kids, Friends group"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Must-Do Wishes or Existing Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Must eat authentic paella, want to see Gaudi architecture, prefer walkable neighborhoods"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !destination.trim()}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Gemini Building Brain...' : 'Generate Full Travel Brain'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
