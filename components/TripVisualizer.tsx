import React, { useState } from 'react';
import { TripPlan } from '../types';
import { Plane, Hotel, Calendar, MapPin, IndianRupee, Briefcase, Palmtree, Ticket, CheckCircle2, Share2, Mail, Clock } from 'lucide-react';

interface TripVisualizerProps {
  plan: TripPlan | null;
}

const TripVisualizer: React.FC<TripVisualizerProps> = ({ plan }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const handleBookFlight = (airline: string, flightNumber: string) => {
     const destination = plan?.destination ? ` to ${plan.destination}` : '';
     // Display a confirmation message
     setNotification(`Booking Confirmed! Flight ${flightNumber} with ${airline}${destination} has been reserved.`);
     setTimeout(() => setNotification(null), 4000);
  };

  const handleShare = async () => {
    if (!plan) return;
    
    const shareText = `Trip Plan: ${plan.destination}\nFrom: ${plan.origin}\nDates: ${plan.dates}\nEst. Cost: ₹${plan.totalCostEstimate.toLocaleString('en-IN')}\n\n${plan.summary}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trip to ${plan.destination}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setNotification("Trip details copied to clipboard!");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEmailShare = () => {
    if (!plan) return;
    const subject = encodeURIComponent(`Trip Plan: ${plan.destination}`);
    const body = encodeURIComponent(
      `Here is the trip plan for ${plan.destination}:\n\n` +
      `Dates: ${plan.dates}\n` +
      `Origin: ${plan.origin}\n` +
      `Est. Cost: ₹${plan.totalCostEstimate.toLocaleString('en-IN')}\n\n` +
      `Summary: ${plan.summary}\n\n` +
      `View more at: ${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <MapPin size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-slate-600">No Trip Planned Yet</h3>
        <p className="text-sm mt-2 max-w-xs">Start chatting to generate a personalized itinerary for your next adventure.</p>
      </div>
    );
  }

  const isHoliday = plan.type === 'holiday';

  return (
    <div className="h-full overflow-y-auto pr-2 pb-10 relative">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            {isHoliday ? <Palmtree size={12} /> : <Briefcase size={12} />}
            {plan.type.toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mb-1">{plan.destination}</h2>
          <p className="text-indigo-100 text-sm flex items-center gap-2">
            <Calendar size={14} />
            {plan.dates} • {plan.origin}
          </p>
        </div>
        <div className="p-4 flex justify-between items-center bg-indigo-50/50">
           <div>
             <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Estimated Cost</p>
             <p className="text-xl font-bold text-slate-800 flex items-center">
               <IndianRupee size={18} className="mr-1" />
               {plan.totalCostEstimate.toLocaleString('en-IN')}
             </p>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={handleShare}
               className="flex items-center gap-1.5 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-100/50"
               title="Share via Link or System Share"
             >
               <Share2 size={16} />
               Share Trip
             </button>
             <button 
               onClick={handleEmailShare}
               className="flex items-center gap-1.5 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-100/50"
               title="Share via Email"
             >
               <Mail size={16} />
             </button>
             <div className="h-4 w-px bg-slate-300 mx-1"></div>
             <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100/50">View Breakdown</button>
           </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <p className="text-slate-600 text-sm italic">"{plan.summary}"</p>
        </div>
      </div>

      {/* Flights Section */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Plane size={16} /> Recommended Flights
      </h3>
      <div className="space-y-3 mb-8">
        {plan.flights.map((flight) => (
          <div key={flight.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="font-semibold text-slate-800">{flight.airline}</span>
              <span className="text-emerald-600 font-bold text-sm">₹{flight.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mb-5">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-lg mb-1">{flight.departureTime}</span>
                <span className="text-slate-400 uppercase text-[10px] tracking-wide">Departure</span>
              </div>
              
              {/* Duration and Stops Display */}
              <div className="flex flex-col items-center flex-1 px-4">
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-600 font-semibold">{flight.duration}</span>
                </div>
                <div className="w-full flex items-center gap-2">
                   <div className="h-[1px] bg-slate-300 flex-1"></div>
                   <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                     {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                   </div>
                   <div className="h-[1px] bg-slate-300 flex-1"></div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-700 text-lg mb-1">{flight.arrivalTime}</span>
                <span className="text-slate-400 uppercase text-[10px] tracking-wide">Arrival</span>
              </div>
            </div>
            
            <button 
              onClick={() => handleBookFlight(flight.airline, flight.flightNumber)}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Ticket size={16} />
              Book Flight
            </button>
          </div>
        ))}
      </div>

      {/* Hotels Section */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Hotel size={16} /> Suggested Stays
      </h3>
      <div className="space-y-3 mb-8">
        {plan.hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-slate-200 relative">
               <img src={hotel.imageUrl || "https://picsum.photos/400/200"} alt={hotel.name} className="w-full h-full object-cover" />
               <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                 ⭐ {hotel.rating}/10
               </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                 <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{hotel.name}</h4>
                 <span className="text-slate-600 font-medium text-xs whitespace-nowrap">₹{hotel.pricePerNight.toLocaleString()}/night</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.amenities.slice(0, 3).map((am, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{am}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Itinerary Section (Only for Holiday) */}
      {isHoliday && plan.dailyItinerary && plan.dailyItinerary.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin size={16} /> Day-by-Day Itinerary
          </h3>
          <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6 pb-4">
            {plan.dailyItinerary.map((day) => (
              <div key={day.day} className="pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm"></div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Day {day.day}: {day.title}</h4>
                <ul className="space-y-2 mt-2">
                  {day.activities.map((act, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 md:absolute md:bottom-4 md:right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <div className="bg-white/20 p-1 rounded-full">
               <CheckCircle2 size={18} />
             </div>
             <p className="text-sm font-medium">{notification}</p>
           </div>
        </div>
      )}

    </div>
  );
};

export default TripVisualizer;