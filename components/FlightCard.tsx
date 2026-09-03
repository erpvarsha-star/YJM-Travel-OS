import React from 'react';
import { FlightOption } from '../types';
import { Clock, Plane, CalendarDays, ExternalLink, ThumbsUp, Zap, DollarSign } from 'lucide-react';

interface FlightCardProps {
  option: FlightOption;
}

const FlightCard: React.FC<FlightCardProps> = ({ option }) => {
  const isRecommended = option.Option_Type === 'Recommended';
  const isFastest = option.Option_Type === 'Fastest';
  
  // Dynamic styling based on type
  const borderColor = isRecommended 
    ? 'border-sky-500 ring-2 ring-sky-500 ring-opacity-20 shadow-sky-100' 
    : isFastest 
      ? 'border-purple-200 shadow-purple-50' 
      : 'border-green-200 shadow-green-50';

  const badgeColor = isRecommended
    ? 'bg-sky-100 text-sky-700'
    : isFastest
      ? 'bg-purple-100 text-purple-700'
      : 'bg-green-100 text-green-700';

  const Icon = isRecommended ? ThumbsUp : isFastest ? Zap : DollarSign;

  return (
    <div className={`relative bg-white rounded-2xl border ${borderColor} shadow-lg p-6 flex flex-col h-full hover:shadow-xl transition-shadow duration-300 animate-fly-in`}>
      {/* Header Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
          <Icon className="w-3 h-3 mr-1.5" />
          {option.Option_Type}
        </span>
        <div className="text-right">
          <span className="block text-2xl font-bold text-slate-800">${option.Total_Price_USD}</span>
          <span className="text-xs text-slate-500">per person</span>
        </div>
      </div>

      {/* Airline Info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-slate-500" />
        </div>
        <div>
            <h3 className="font-bold text-slate-700 leading-tight">{option.Airline_Carrier}</h3>
            {option.Logic && (
                <p className="text-xs text-slate-500 mt-1 italic">"{option.Logic}"</p>
            )}
        </div>
      </div>

      {/* Flight Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center text-slate-400 mb-1">
                <CalendarDays className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium uppercase">Dates</span>
            </div>
            <div className="font-semibold text-slate-700">{option.Travel_Dates}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center text-slate-400 mb-1">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium uppercase">Duration</span>
            </div>
            <div className="font-semibold text-slate-700">{option.Total_Duration}</div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <a 
            href={option.Booking_Link} 
            target="_blank" 
            rel="noreferrer"
            className={`flex items-center justify-center w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                isRecommended 
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
        >
            Select Flight
            <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default FlightCard;