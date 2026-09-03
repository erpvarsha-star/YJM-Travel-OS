import React from 'react';
import { Plane, Compass, BedDouble, Map as MapIcon, Mic, Bookmark, UserCircle, Scale } from 'lucide-react';

interface HeaderProps {
  onCategorySelect?: (category: string) => void;
  onVoiceModeToggle?: () => void;
  onShowSavedTrips?: () => void;
  onShowProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onCategorySelect, 
  onVoiceModeToggle, 
  onShowSavedTrips,
  onShowProfile
}) => {
  const handleNavClick = (category: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onCategorySelect?.(category);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-md">
            <Plane size={20} className="transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Voyager AI</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Travel Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={handleNavClick('destinations')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <MapIcon size={16} />
                Destinations
            </button>
            <button onClick={handleNavClick('hotels')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <BedDouble size={16} />
                Hotels
            </button>
            <button onClick={handleNavClick('flights')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <Plane size={16} />
                Flights
            </button>
            <div className="w-px h-4 bg-slate-300"></div>
            <button onClick={handleNavClick('explore')} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
                <Compass size={16} />
                <span>Explore</span>
            </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                  onClick={onShowProfile}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100/80 transition-colors shadow-xs"
                  title="Conflict Resolution Active: Asking your preference on trip trade-offs & ideas"
              >
                  <Scale size={13} className="text-amber-600" />
                  <span>Conflict Check: On</span>
              </button>

              <button 
                  onClick={onShowSavedTrips}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  title="Saved Trips"
              >
                  <Bookmark size={20} />
              </button>
              
              <button 
                  onClick={onShowProfile}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  title="User Profile"
              >
                  <UserCircle size={20} />
              </button>

              <button 
                  onClick={onVoiceModeToggle}
                  className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                  title="Start Voice Assistant"
              >
                  <Mic size={20} />
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};