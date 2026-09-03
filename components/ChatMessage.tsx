import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertCircle } from 'lucide-react';
import FlightCard from './FlightCard';
import HotelCard from './HotelCard';

interface Props {
  message: Message;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const isBot = message.role === 'model';
  
  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot 
              ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
             {message.isError ? (
                <div className="flex items-center gap-2 text-red-200">
                  <AlertCircle size={16} />
                  <span>{message.text}</span>
                </div>
             ) : (
               <div className={`markdown-body ${isBot ? '' : 'text-white'}`}>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
               </div>
             )}
          </div>
          
          {/* Rich Media Attachments (Cards) */}
          {message.data && (
            <div className="mt-3 w-full overflow-x-auto pb-4 custom-scrollbar">
              
              {/* Flights Section */}
              {message.data.flights && message.data.flights.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider ml-1">Flight Options</p>
                  <div className="flex gap-4">
                    {message.data.flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels Section */}
              {message.data.hotels && message.data.hotels.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider ml-1">Hotel Options</p>
                  <div className="flex gap-4">
                    {message.data.hotels.map((hotel) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;