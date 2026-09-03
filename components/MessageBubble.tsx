import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { SourceList } from './SourceList';
import { WeatherWidget } from './WeatherWidget';
import { FlightCard, HotelCard, ConflictChoiceCard } from './ResultCards';
import { Bot, User, Loader2, ExternalLink, BookmarkPlus, Check, Share2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onSave?: (message: Message) => void;
  onSelectOption?: (prompt: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSave, onSelectOption }) => {
  const isUser = message.role === 'user';
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(message);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleShare = async () => {
    const textToShare = message.content;
    const shareData = {
      title: 'Voyager AI Itinerary',
      text: `${textToShare}\n\nShared via Voyager AI`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          <div className={`relative px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed w-full ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
          }`}>
            {message.isLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span>Creating your itinerary...</span>
              </div>
            ) : (
              <div className={`markdown-content ${isUser ? 'text-white' : ''}`}>
                 {/* Weather Widget */}
                 {!isUser && message.weather && (
                   <div className="mb-4">
                     <WeatherWidget data={message.weather} />
                   </div>
                 )}

                 {/* Markdown Rendering */}
                 <ReactMarkdown
                   remarkPlugins={[remarkGfm]}
                   components={{
                     ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3 space-y-1.5" {...props} />,
                     ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3 space-y-1.5" {...props} />,
                     li: ({node, ...props}) => <li className="mb-1" {...props} />,
                     p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                     h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 border-b pb-1" {...props} />,
                     h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-slate-800" {...props} />,
                     h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-blue-600" {...props} />,
                     h4: ({node, ...props}) => <h4 className="text-sm font-bold mb-1 mt-2 uppercase tracking-wide text-slate-500" {...props} />,
                     table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-sm" {...props} /></div>,
                     thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                     th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b" {...props} />,
                     td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-slate-700 border-b" {...props} />,
                     a: ({node, ...props}) => {
                       const href = props.href || '';
                       const isFlightLink = href.includes('google.com/travel/flights');
                       
                       if (isFlightLink) {
                         return (
                           <a 
                             className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 hover:shadow-sm transition-all border border-blue-100 font-medium text-sm no-underline w-fit"
                             target="_blank"
                             rel="noopener noreferrer"
                             {...props}
                           >
                             {props.children}
                             <ExternalLink size={14} />
                           </a>
                         );
                       }
                       return <a className="underline hover:opacity-80 text-blue-600" target="_blank" rel="noopener noreferrer" {...props} />;
                     },
                     // Custom Code Block Renderer for JSON Cards
                     code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isJson = match && match[1] === 'json';
                        
                        if (!inline && isJson) {
                          try {
                            const content = String(children).replace(/\n$/, '');
                            const data = JSON.parse(content);
                            
                            // Check for Flight, Hotel, or Conflict Choice Arrays
                            const items = Array.isArray(data) ? data : [data];
                            if (items.length > 0 && items[0]) {
                              if (items[0].type === 'flight') {
                                return (
                                  <div className="not-prose grid gap-2 my-4">
                                    {items.map((flight: any, i: number) => <FlightCard key={i} data={flight} />)}
                                  </div>
                                );
                              }
                              if (items[0].type === 'hotel') {
                                return (
                                  <div className="not-prose grid gap-2 my-4">
                                    {items.map((hotel: any, i: number) => <HotelCard key={i} data={hotel} />)}
                                  </div>
                                );
                              }
                              if (items[0].type === 'conflict_choice') {
                                return (
                                  <div className="not-prose my-4">
                                    {items.map((choice: any, i: number) => (
                                      <ConflictChoiceCard 
                                        key={i} 
                                        data={choice} 
                                        onSelectOption={onSelectOption} 
                                      />
                                    ))}
                                  </div>
                                );
                              }
                            }
                          } catch (e) {
                            // Fallback to normal code block if parsing fails
                          }
                        }
                        
                        return !inline && match ? (
                          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-4 text-xs">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </div>
                        ) : (
                          <code className="bg-slate-100 text-slate-800 rounded px-1 py-0.5 text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                     },
                     strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                     blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-200 pl-4 py-1 italic text-slate-600 my-2" {...props} />,
                   }}
                 >
                   {message.content}
                 </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {!isUser && !message.isLoading && (
            <div className="flex items-center justify-between w-full mt-2 pl-1">
              {message.sources && message.sources.length > 0 ? (
                <div className="flex-1">
                   <SourceList sources={message.sources} />
                </div>
              ) : <div />}
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] text-slate-400">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <button 
                  onClick={handleShare}
                  className={`p-1.5 rounded-full transition-all duration-200 flex items-center gap-1 ${
                    isShared
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                  title="Share"
                >
                  {isShared ? <Check size={14} /> : <Share2 size={14} />}
                </button>

                {onSave && (
                  <button 
                    onClick={handleSave}
                    className={`p-1.5 rounded-full transition-all duration-200 flex items-center gap-1 ${
                      isSaved 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                    title="Save Trip"
                  >
                    {isSaved ? <Check size={14} /> : <BookmarkPlus size={14} />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};