import React, { useState } from 'react';
import { Plane, BedDouble, Star, MapPin, Award, Check, X, Loader2, Scale, ArrowRight, Sparkles } from 'lucide-react';
import { ConflictChoiceData } from '../types';

export interface FlightData {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departure: string;
  arrival?: string;
  duration: string;
  price: number;
  stops: string;
  tags?: string[];
}

export interface HotelData {
  type: 'hotel';
  name: string;
  stars: number;
  rating?: number;
  price: number;
  address?: string;
  amenities?: string[];
  description?: string;
}

const formatPrice = (price: number) => {
  try {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
  } catch (e) {
      return `₹${price}`;
  }
};

export const FlightCard: React.FC<{ data: FlightData }> = ({ data }) => {
  const [bookingState, setBookingState] = useState<'idle' | 'confirming' | 'processing' | 'booked'>('idle');
  const [refId, setRefId] = useState('');

  const handleBookClick = () => setBookingState('confirming');
  
  const handleConfirm = () => {
    setBookingState('processing');
    setTimeout(() => {
        setRefId('FL' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
        setBookingState('booked');
    }, 2000);
  };

  const handleCancel = () => setBookingState('idle');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 mb-3 not-prose">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Plane size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base m-0">{data.airline}</h4>
            <p className="text-xs text-slate-500 m-0">{data.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-600 block leading-tight">
            {formatPrice(data.price)}
          </span>
          <span className="text-[10px] text-slate-400">per person</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 m-0">{data.departure}</p>
          <p className="text-[10px] text-slate-400 m-0 uppercase tracking-wide">Dep</p>
        </div>
        <div className="flex flex-col items-center flex-1 px-4">
          <p className="text-[10px] text-slate-400 mb-1 m-0">{data.duration}</p>
          <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
            <Plane size={12} className="text-slate-400 absolute bg-slate-50 px-1" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm m-0">
            {data.stops}
          </p>
        </div>
        {data.arrival && (
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 m-0">{data.arrival}</p>
            <p className="text-[10px] text-slate-400 m-0 uppercase tracking-wide">Arr</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {data.tags && data.tags.length > 0 && data.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium border border-slate-200">
                {tag}
                </span>
            ))}
          </div>

          <div className="flex justify-end ml-auto pl-2">
            {bookingState === 'idle' && (
                <button 
                    onClick={handleBookClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    Book Now
                </button>
            )}
            {bookingState === 'confirming' && (
                <div className="flex items-center gap-2 animate-fadeIn">
                    <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Confirm?</span>
                    <button 
                        onClick={handleConfirm}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-md transition-colors shadow-sm"
                        title="Confirm Booking"
                    >
                        <Check size={16} />
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-md transition-colors"
                        title="Cancel"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            {bookingState === 'processing' && (
                <div className="flex items-center gap-2 text-blue-600 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-fadeIn">
                    <Loader2 size={14} className="animate-spin" />
                    Processing...
                </div>
            )}
            {bookingState === 'booked' && (
                 <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-fadeIn shadow-sm">
                    <Check size={14} />
                    <span>Booked! Ref: {refId}</span>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export const HotelCard: React.FC<{ data: HotelData }> = ({ data }) => {
    const [bookingState, setBookingState] = useState<'idle' | 'confirming' | 'processing' | 'booked'>('idle');
    const [refId, setRefId] = useState('');
  
    const handleBookClick = () => setBookingState('confirming');
    
    const handleConfirm = () => {
      setBookingState('processing');
      setTimeout(() => {
          setRefId('HT' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
          setBookingState('booked');
      }, 2000);
    };
  
    const handleCancel = () => setBookingState('idle');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-3 flex flex-col sm:flex-row not-prose">
      {/* Visual Placeholder */}
      <div className="bg-slate-100 sm:w-32 h-32 sm:h-auto flex items-center justify-center text-slate-300 flex-shrink-0">
        <BedDouble size={32} />
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="pr-2">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-800 text-base m-0 leading-tight">{data.name}</h4>
            </div>
            <div className="flex items-center gap-1 mb-1">
                {[...Array(Math.min(5, Math.floor(data.stars || 0)))].map((_, i) => (
                  <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mb-2 m-0">
              <MapPin size={10} /> {data.address || "Location available"}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-bold text-slate-900 block leading-tight">
              {formatPrice(data.price)}
            </span>
            <span className="text-[10px] text-slate-400">/ night</span>
          </div>
        </div>

        {data.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 m-0 leading-relaxed">
            {data.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-wrap gap-1.5">
            {data.rating && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                <Award size={10} /> {data.rating}/5
                </span>
            )}
            {data.amenities?.slice(0, 2).map((amenity, i) => (
                <span key={i} className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded-md bg-slate-50">
                {amenity}
                </span>
            ))}
            </div>

            <div className="flex justify-end ml-2">
                {bookingState === 'idle' && (
                    <button 
                        onClick={handleBookClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        Book Now
                    </button>
                )}
                {bookingState === 'confirming' && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Confirm?</span>
                        <button 
                            onClick={handleConfirm}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-md transition-colors shadow-sm"
                            title="Confirm Booking"
                        >
                            <Check size={16} />
                        </button>
                        <button 
                            onClick={handleCancel}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-md transition-colors"
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                {bookingState === 'processing' && (
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100 animate-fadeIn">
                        <Loader2 size={14} className="animate-spin" />
                    </div>
                )}
                {bookingState === 'booked' && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-fadeIn shadow-sm">
                        <Check size={14} />
                        <span>Ref: {refId}</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export const ConflictChoiceCard: React.FC<{ 
  data: ConflictChoiceData; 
  onSelectOption?: (prompt: string) => void;
}> = ({ data, onSelectOption }) => {
  const [chosenId, setChosenId] = useState<string | null>(null);

  const handleSelect = (id: string, prompt: string) => {
    setChosenId(id);
    if (onSelectOption) {
      onSelectOption(prompt);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/70 border-2 border-amber-200/80 rounded-2xl p-5 my-4 shadow-sm not-prose">
      {/* Badge & Title */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold tracking-wide">
          <Scale size={13} className="text-amber-700" />
          Conflict of Ideas / Trade-Off
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Your input needed</span>
      </div>

      <h4 className="text-base font-bold text-slate-800 mb-1.5 leading-snug">
        {data.conflictTitle}
      </h4>

      {data.conflictDescription && (
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          {data.conflictDescription}
        </p>
      )}

      <p className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
        <Sparkles size={13} className="text-amber-600" />
        {data.question || "Which do you prefer?"}
      </p>

      {/* Choice Options Grid */}
      <div className={`grid gap-3 ${data.options.length > 2 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {data.options.map((opt, idx) => {
          const optId = opt.id || `opt_${idx}`;
          const isSelected = chosenId === optId;

          return (
            <div
              key={optId}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 text-left relative ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-bold text-sm text-slate-900 leading-snug">
                    {opt.label}
                  </h5>
                  {opt.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {opt.detail && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {opt.detail}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSelect(optId, opt.prompt)}
                className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check size={14} />
                    <span>Selected Preference</span>
                  </>
                ) : (
                  <>
                    <span>I prefer this option</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
