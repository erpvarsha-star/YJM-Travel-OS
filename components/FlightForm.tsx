import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { SearchFormData } from '../types';

interface FlightFormProps {
  onSubmit: (data: SearchFormData) => void;
  isLoading: boolean;
}

const FlightForm: React.FC<FlightFormProps> = ({ onSubmit, isLoading }) => {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (departure && destination && date) {
      onSubmit({ departure, destination, date, travelers });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 -mt-16 relative z-10 border border-slate-100">
      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-4 items-end">
        
        {/* Departure Input */}
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">From</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PlaneTakeoff className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
            <input
              type="text"
              required
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 sm:text-sm"
              placeholder="Origin City or Airport"
            />
          </div>
        </div>

        {/* Destination Input */}
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">To</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PlaneLanding className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 sm:text-sm"
              placeholder="Destination City or Airport"
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Preferred Date</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 sm:text-sm"
            />
          </div>
        </div>

        {/* Travelers Input */}
        <div className="w-full xl:w-32 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Travelers</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 sm:text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full xl:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Find Flights
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FlightForm;