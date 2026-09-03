import React from 'react';
import { Hotel } from '../types';
import { Star, MapPin } from 'lucide-react';

interface Props {
  hotel: Hotel;
}

const HotelCard: React.FC<Props> = ({ hotel }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full sm:w-[300px] flex-shrink-0 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="h-32 bg-slate-200 relative">
        <img 
          src={hotel.image} 
          alt={hotel.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-slate-800">{hotel.rating}</span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-1" title={hotel.name}>{hotel.name}</h3>
        </div>
        
        <div className="flex items-center gap-1 text-slate-500 mb-3">
          <MapPin size={12} />
          <span className="text-xs truncate">{hotel.city}</span>
        </div>

        <div className="flex items-center gap-1 mb-4">
           {Array.from({ length: 5 }).map((_, i) => (
             <Star 
               key={i} 
               size={12} 
               className={`${i < hotel.stars ? 'text-indigo-400 fill-indigo-400' : 'text-slate-200 fill-slate-200'}`} 
             />
           ))}
        </div>

        <div className="mt-auto flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-400">Per night</p>
            <p className="text-lg font-bold text-slate-900">${hotel.pricePerNight}</p>
          </div>
          <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;