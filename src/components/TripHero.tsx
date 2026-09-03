import React from 'react';
import { Trip } from '../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  Activity, 
  CheckCircle2, 
  Zap,
  Sparkles
} from 'lucide-react';

interface TripHeroProps {
  trip: Trip;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export const TripHero: React.FC<TripHeroProps> = ({ trip, onOptimize, isOptimizing }) => {
  // Compute key stats
  const totalActivities = trip.itinerary.reduce((acc, day) => acc + day.activities.length, 0);
  const completedActivities = trip.itinerary.reduce(
    (acc, day) => acc + day.activities.filter((a) => a.completed).length,
    0
  );
  const totalSpent = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const budgetRatio = Math.min(100, Math.round((totalSpent / (trip.totalBudget || 1)) * 100));

  const totalPacked = trip.packingList.filter((item) => item.packed).length;
  const totalPackingItems = trip.packingList.length;
  const packingRatio = totalPackingItems ? Math.round((totalPacked / totalPackingItems) * 100) : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white shadow-sm border border-stone-800 mb-6">
      {/* Background Image with subtle gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-100"
        style={{ backgroundImage: `url(${trip.heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />

      {/* Content */}
      <div className="relative p-6 sm:p-8 z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <MapPin className="h-3.5 w-3.5" />
                <span>{trip.destination}, {trip.country}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700">
                <Calendar className="h-3.5 w-3.5" />
                <span>{trip.startDate} → {trip.endDate} ({trip.durationDays} Days)</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700 capitalize">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>{trip.travelStyle} • {trip.pace} pace</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800/80 text-stone-300 border border-stone-700">
                <Users className="h-3.5 w-3.5" />
                <span>{trip.companions}</span>
              </span>
            </div>

            {/* Trip Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-stone-100">
              {trip.title}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed line-clamp-2">
              Cognitive travel brain initialized. All smart schedules, booking vouchers, gear checklists, and live Gemini concierge grounded in this destination.
            </p>
          </div>

          {/* Quick Metrics & Optimization Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              id="btn-optimize-hero"
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Gemini Optimizing Flow...' : 'AI Geo-Optimize Flow'}</span>
            </button>
            <div className="text-xs text-stone-400">
              Minimizes transit criss-cross & syncs schedules
            </div>
          </div>
        </div>

        {/* Live Vitals Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800/80">
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>Itinerary Progress</span>
              <Activity className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-semibold text-stone-100">
              {completedActivities} / {totalActivities}
              <span className="text-xs font-normal text-stone-400 ml-1.5">activities</span>
            </div>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>Budget Burn Rate</span>
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-semibold text-stone-100">
              {trip.currencySymbol}{totalSpent.toLocaleString()}
              <span className="text-xs font-normal text-stone-400 ml-1.5">
                of {trip.currencySymbol}{trip.totalBudget.toLocaleString()} ({budgetRatio}%)
              </span>
            </div>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>Packing Readiness</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-semibold text-stone-100">
              {totalPacked} / {totalPackingItems}
              <span className="text-xs font-normal text-stone-400 ml-1.5">({packingRatio}%)</span>
            </div>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>Brain Notes Ingested</span>
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-semibold text-stone-100">
              {trip.brainNotes.length}
              <span className="text-xs font-normal text-stone-400 ml-1.5">synthesized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
