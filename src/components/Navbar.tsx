import React from 'react';
import { Trip } from '../types';
import { 
  Compass, 
  Plus, 
  Sparkles, 
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';

interface NavbarProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (trip: Trip) => void;
  onOpenNewTripModal: () => void;
  onOpenCombinerModal: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenCombinerModal,
  hasGeminiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              <Compass className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-stone-900">
                  Yoyo Travel Brain
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  OS v2.5
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Unified AI Cognitive Travel Intelligence
              </p>
            </div>
          </div>

          {/* Trip Selector & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Trip Dropdown */}
            <div className="relative inline-block text-left">
              <select
                id="trip-selector-dropdown"
                value={activeTrip.id}
                onChange={(e) => {
                  const selected = trips.find((t) => t.id === e.target.value);
                  if (selected) onSelectTrip(selected);
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-medium py-2 px-3 pr-8 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-amber-500 transition-colors max-w-[140px] sm:max-w-[200px] truncate"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.destination} ({trip.durationDays}d)
                  </option>
                ))}
              </select>
            </div>

            {/* AI Studio Apps Combiner Button */}
            <button
              id="btn-open-combiner"
              onClick={onOpenCombinerModal}
              className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-stone-200"
              title="Combine features from your AI Studio apps"
            >
              <FolderGit2 className="h-4 w-4 text-stone-600" />
              <span className="hidden md:inline">Apps Combiner</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                4-in-1
              </span>
            </button>

            {/* Plan New Trip */}
            <button
              id="btn-new-trip"
              onClick={onOpenNewTripModal}
              className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Trip</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
