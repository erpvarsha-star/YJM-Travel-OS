import React, { useState } from 'react';
import { 
  X, 
  Plane, 
  Calendar, 
  MapPin, 
  Filter, 
  IndianRupee, 
  Clock, 
  Wifi, 
  Zap, 
  Utensils, 
  Monitor, 
  Sparkles,
  GitFork,
  ArrowLeftRight,
  ShieldAlert,
  Ticket
} from 'lucide-react';

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (prompt: string) => void;
}

const FLIGHT_AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={14} /> },
  { id: 'power', label: 'Power/USB', icon: <Zap size={14} /> },
  { id: 'meal', label: 'Meal', icon: <Utensils size={14} /> },
  { id: 'entertainment', label: 'Entertainment', icon: <Monitor size={14} /> },
];

export const FlightSearchModal: React.FC<FlightSearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [flexibility, setFlexibility] = useState<'0' | '1' | '3' | '5'>('3');
  const [searchMode, setSearchMode] = useState<'all' | 'award' | 'cash'>('all');
  const [enableHackerFares, setEnableHackerFares] = useState(true);
  const [hackerFareTypes, setHackerFareTypes] = useState<string[]>([
    'split_ticket',
    'virtual_interline',
    'hidden_city',
    'co_terminals'
  ]);
  const [stops, setStops] = useState('any');
  const [airline, setAirline] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cabinClass, setCabinClass] = useState('business');
  const [departureTimes, setDepartureTimes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleDepartureTime = (time: string) => {
    setDepartureTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const toggleHackerType = (type: string) => {
    setHackerFareTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let prompt = `Find ${cabinClass} flights from ${origin} to ${destination}`;
    if (date) {
      prompt += ` on ${date}`;
      if (flexibility !== '0') {
        prompt += ` (with flexibility of ±${flexibility} days to find the best fare/award seat)`;
      }
    }
    
    prompt += `. \n\n**Search Specifications & Filters:**\n`;
    if (searchMode === 'award') {
      prompt += `- Search Mode: Award Travel & Points Redemptions only (simulate Seats.aero / Star Alliance / OneWorld / SkyTeam availability, calculate CPP > 2.0¢, transfer partners)\n`;
    } else if (searchMode === 'cash') {
      prompt += `- Search Mode: Cash Airfares only\n`;
    } else {
      prompt += `- Search Mode: Compare Cash Fares vs. Award Points Redemptions (show Seats.aero style award inventory and cash prices with CPP)\n`;
    }

    if (flexibility !== '0') {
      prompt += `- Date Flexibility: Check ±${flexibility} days around ${date || 'target date'} for pricing dips or award space availability.\n`;
    }

    // Hacker Fare Logic (Kiwi & Kayak style)
    if (enableHackerFares) {
      prompt += `- **Hacker Fare & Virtual Interlining Engine (Kiwi / Kayak Algorithm)**: ENABLED.\n`;
      prompt += `  * Apply Split-Ticketing: Check if booking separate one-way tickets on different airlines for outbound and return yields significant savings.\n`;
      prompt += `  * Apply Virtual Interlining / Self-Transfer: Search combinations of non-partner airlines connecting through major global transit hubs (e.g. DXB, DOH, SIN, LHR, FRA, IST). Ensure self-transfer layover is at least 3.5+ hours to allow for terminal transfer, customs, and baggage re-check.\n`;
      if (hackerFareTypes.includes('hidden_city')) {
        prompt += `  * Scan for Hidden-City / Skiplagged Opportunities: Check whether booking a flight with a layover at ${destination} and continuing elsewhere is cheaper than booking directly, and provide strict warnings (carry-on only, no checked bags, one-way ticket only).\n`;
      }
      if (hackerFareTypes.includes('co_terminals')) {
        prompt += `  * Scan Co-Terminal Metropolitan Airports: Check nearby secondary and international airports around origin and destination for lower fares.\n`;
      }
      prompt += `  * Present at least 1 Hacker Fare / Split-Ticket alternative next to traditional single-ticket itineraries, detailing the exact cost delta and self-transfer requirements.\n`;
    }

    if (stops === 'direct') prompt += `- Non-stop only\n`;
    else if (stops === '1') prompt += `- Maximum 1 stop\n`;
    
    if (airline.trim()) prompt += `- Preferred airline: ${airline}\n`;
    
    if (minPrice || maxPrice) {
      prompt += `- Price Range: ${minPrice ? '₹' + minPrice : '0'} to ${maxPrice ? '₹' + maxPrice : 'Any'}\n`;
    }

    if (departureTimes.length > 0) {
      prompt += `- Departure Time Preference: ${departureTimes.join(', ')}\n`;
    }

    if (selectedAmenities.length > 0) {
      prompt += `- Must have amenities: ${selectedAmenities.map(id => FLIGHT_AMENITIES.find(a => a.id === id)?.label).join(', ')}\n`;
    }
    
    prompt += `\nPlease list 3-5 best options with dates, cash prices in INR/USD, points required + taxes, CPP valuation, flight duration, stops, aircraft type, Hacker Fare breakdown (if applicable), and booking advice.`;

    onSearch(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-lg md:rounded-2xl shadow-2xl overflow-hidden m-4 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-100 p-2 rounded-lg">
                <Plane size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Find Flights</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Route */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">From</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Origin City/Airport"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">To</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Destination City/Airport"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Date & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cabin Class</label>
              <div className="relative group">
                <select 
                  value={cabinClass}
                  onChange={e => setCabinClass(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-600 appearance-none transition-all cursor-pointer"
                >
                  <option value="economy">Economy</option>
                  <option value="premium economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date Flexibility (+-1, +-3, +-5 Days) */}
          <div className="space-y-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600" /> Date Flexibility
              </label>
              <span className="text-[11px] font-semibold text-blue-600">
                {flexibility === '0' ? 'Exact date only' : `Window: ±${flexibility} days`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '0', label: 'Exact Date' },
                { id: '1', label: '±1 Day' },
                { id: '3', label: '±3 Days' },
                { id: '5', label: '±5 Days' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlexibility(f.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    flexibility === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Mode: Cash vs Award (Seats.aero style) */}
          <div className="space-y-1.5 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600" /> Redemption & Search Type
              </label>
              <span className="text-[10px] text-indigo-600 font-medium">Seats.aero / Award Arbitrage</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Cash & Points' },
                { id: 'award', label: 'Award Only' },
                { id: 'cash', label: 'Cash Only' },
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSearchMode(mode.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    searchMode === mode.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hacker Fares Engine (Kiwi & Kayak Algorithm) */}
          <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork size={14} className="text-emerald-700" />
                <label className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Hacker Fares & Virtual Interlining
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableHackerFares} 
                  onChange={e => setEnableHackerFares(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Google Flights only returns single-ticket, interlined airline flights. Kiwi & Kayak discover <strong>20–50% cheaper fares</strong> by splitting one-ways across different airlines and self-transferring at transit hubs.
            </p>

            {enableHackerFares && (
              <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => toggleHackerType('split_ticket')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    hackerFareTypes.includes('split_ticket')
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <ArrowLeftRight size={11} className="text-emerald-700" /> Split-Ticketing
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Airlines A & B as two separate 1-ways</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleHackerType('virtual_interline')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    hackerFareTypes.includes('virtual_interline')
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <GitFork size={11} className="text-emerald-700" /> Virtual Interline
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Self-transfer hub with 3.5h layover buffer</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleHackerType('hidden_city')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    hackerFareTypes.includes('hidden_city')
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <ShieldAlert size={11} className="text-emerald-700" /> Hidden-City
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Skiplagged hub (carry-on only warning)</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleHackerType('co_terminals')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    hackerFareTypes.includes('co_terminals')
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <Ticket size={11} className="text-emerald-700" /> Co-Terminal Metro
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Scan all regional/secondary airports</div>
                </button>
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price Range (INR)</label>
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stops</label>
              <div className="relative group">
                <Filter className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select 
                  value={stops}
                  onChange={e => setStops(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-600 appearance-none transition-all cursor-pointer"
                >
                  <option value="any">Any stops</option>
                  <option value="direct">Non-stop only</option>
                  <option value="1">1 Stop max</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Airline</label>
              <input 
                type="text" 
                placeholder="Optional"
                value={airline}
                onChange={e => setAirline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
               <Clock size={12} /> Departure Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Morning', label: 'Morning' },
                { id: 'Afternoon', label: 'Afternoon' },
                { id: 'Evening', label: 'Evening' },
              ].map((time) => (
                <button
                  key={time.id}
                  type="button"
                  onClick={() => toggleDepartureTime(time.id)}
                  className={`py-2 px-1 rounded-lg border text-center text-xs font-medium transition-all ${
                    departureTimes.includes(time.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flight Amenities */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {FLIGHT_AMENITIES.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`py-2 px-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedAmenities.includes(amenity.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {amenity.icon}
                  </span>
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <Plane size={20} />
              Find Flights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};