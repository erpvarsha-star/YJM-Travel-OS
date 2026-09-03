import React, { useState } from 'react';
import { X, BedDouble, Calendar, MapPin, IndianRupee, Star, Coffee, Wifi, Car, Dumbbell, PawPrint, Users, Accessibility, ThumbsUp } from 'lucide-react';

interface HotelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (prompt: string) => void;
}

const AMENITIES = [
  { id: 'breakfast', label: 'Breakfast Included', icon: <Coffee size={14} /> },
  { id: 'pool', label: 'Swimming Pool', icon: null },
  { id: 'gym', label: 'Gym / Fitness', icon: <Dumbbell size={14} /> },
  { id: 'wifi', label: 'Free Wi-Fi', icon: <Wifi size={14} /> },
  { id: 'parking', label: 'Parking', icon: <Car size={14} /> },
  { id: 'spa', label: 'Spa', icon: null },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: <PawPrint size={14} /> },
  { id: 'family_rooms', label: 'Family Rooms', icon: <Users size={14} /> },
  { id: 'accessible', label: 'Accessibility', icon: <Accessibility size={14} /> },
];

export const HotelSearchModal: React.FC<HotelSearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stars, setStars] = useState<string[]>([]);
  const [guestRating, setGuestRating] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleStar = (star: string) => {
    setStars(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let prompt = `Find hotels in ${location}`;
    if (checkIn && checkOut) prompt += ` from ${checkIn} to ${checkOut}`;
    prompt += ` for ${guests} guests.`;
    
    prompt += `\n\n**Filters:**\n`;
    
    if (minPrice || maxPrice) {
      prompt += `- Price Range: ${minPrice ? '₹' + minPrice : '0'} to ${maxPrice ? '₹' + maxPrice : 'Any'} per night\n`;
    }

    if (stars.length > 0) {
      prompt += `- Official Star Rating: ${stars.sort().join(', ')} Stars\n`;
    }

    if (guestRating !== 'any') {
      prompt += `- Minimum Guest Rating: ${guestRating} / 5\n`;
    }

    if (selectedAmenities.length > 0) {
      prompt += `- Must have amenities/features: ${selectedAmenities.map(id => AMENITIES.find(a => a.id === id)?.label).join(', ')}\n`;
    }
    
    prompt += `\nPlease list options with star ratings, guest review scores, prices in INR, key amenities, and current availability if possible.`;

    onSearch(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-lg md:rounded-2xl shadow-2xl overflow-hidden m-4 flex flex-col max-h-[95vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-100 p-2 rounded-lg">
                <BedDouble size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Find Hotels</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination</label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                required
                placeholder="City, Region, or Hotel Name"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>
          
          {/* Dates & Guests */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Check-in</label>
              <input 
                type="date" 
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Check-out</label>
              <input 
                type="date" 
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Guests</label>
            <select
                value={guests}
                onChange={e => setGuests(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600 appearance-none cursor-pointer"
            >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                <option value="7+">7+ Guests</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price / Night (INR)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <IndianRupee className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="number" 
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <div className="relative group">
                <IndianRupee className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="number" 
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ratings Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Official Stars</label>
              <div className="flex gap-2">
                {['3', '4', '5'].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => toggleStar(star)}
                    className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-1 text-sm font-medium transition-all ${
                      stars.includes(star) 
                        ? 'bg-amber-50 border-amber-400 text-amber-700 ring-1 ring-amber-400' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {star} <Star size={14} className={stars.includes(star) ? "fill-amber-700 text-amber-700" : "text-slate-400"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                 Guest Rating <ThumbsUp size={12} />
              </label>
              <div className="relative">
                <select
                  value={guestRating}
                  onChange={e => setGuestRating(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600 appearance-none cursor-pointer"
                >
                  <option value="any">Any Score</option>
                  <option value="3.5">3.5+ (Good)</option>
                  <option value="4.0">4.0+ (Very Good)</option>
                  <option value="4.5">4.5+ (Excellent)</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <Star size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities & Features */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amenities & Features</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`py-2 px-3 rounded-lg border text-left text-[11px] sm:text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedAmenities.includes(amenity.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {amenity.icon && amenity.icon}
                  </span>
                  <span className="truncate">{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <BedDouble size={20} />
              Find Hotels
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};