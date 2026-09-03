import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronLeft, Map, Edit2, Save, Share2, Check, Download, FileSpreadsheet, FileJson } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SavedTrip } from '../types';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: SavedTrip[];
  onDelete: (id: string) => void;
  onUpdate: (trip: SavedTrip) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({ 
  isOpen, 
  onClose, 
  savedTrips, 
  onDelete,
  onUpdate
}) => {
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isShared, setIsShared] = useState(false);

  // Reset editing state when opening a new trip
  useEffect(() => {
    if (selectedTrip) {
      setIsEditing(false);
      setEditContent(selectedTrip.content);
      setIsShared(false);
    }
  }, [selectedTrip]);

  if (!isOpen) return null;

  const handleSaveEdit = () => {
    if (selectedTrip) {
      const updatedTrip = { ...selectedTrip, content: editContent };
      onUpdate(updatedTrip);
      setSelectedTrip(updatedTrip);
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    if (!selectedTrip) return;

    const shareData = {
      title: selectedTrip.title,
      text: `${selectedTrip.title}\n\n${selectedTrip.content}\n\nShared via Voyager AI`,
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

  const handleExportCSV = () => {
    if (savedTrips.length === 0) return;
    const header = ['ID', 'Title', 'Saved Date', 'Content Summary'];
    const rows = savedTrips.map(trip => [
      `"${trip.id}"`,
      `"${(trip.title || '').replace(/"/g, '""')}"`,
      `"${new Date(trip.timestamp).toISOString()}"`,
      `"${(trip.content || '').slice(0, 300).replace(/\n/g, ' ').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voyager_travel_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (savedTrips.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedTrips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voyager_saved_trips_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-2xl h-[80vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden m-4">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            {selectedTrip ? (
              <button 
                onClick={() => setSelectedTrip(null)}
                className="p-1 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Map size={20} />
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {selectedTrip ? 'Trip Details' : 'Trip History & Saved Plans'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!selectedTrip && savedTrips.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                  title="Download History as CSV Spreadsheet"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  title="Download History as JSON Backup"
                >
                  <FileJson size={14} />
                  <span>Export JSON</span>
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {selectedTrip ? (
            // Detail View
            <div className="animate-[slideIn_0.2s_ease-out] flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                   <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{selectedTrip.title}</h3>
                   <p className="text-xs text-slate-500 flex items-center gap-1">
                     <Calendar size={12} />
                     Saved on {new Date(selectedTrip.timestamp).toLocaleDateString()}
                   </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isShared 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Share via Link/Email"
                  >
                     {isShared ? <Check size={18} /> : <Share2 size={18} />}
                     {isShared && <span className="text-xs font-medium">Copied</span>}
                  </button>

                  <div className="w-px h-6 bg-slate-200 mx-1"></div>

                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                      title="Save Changes"
                    >
                      <Save size={18} />
                      <span className="text-sm font-medium">Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Trip Details"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(selectedTrip.id);
                      setSelectedTrip(null);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {isEditing ? (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg mb-4 text-xs font-medium">
                      ℹ️ Tip: Scroll down to "Booking Details" to fill in your PNRs and confirmation numbers.
                    </div>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                      placeholder="Add your booking details here..."
                    />
                  </div>
                ) : (
                  <div className="overflow-y-auto markdown-content h-full">
                    <ReactMarkdown
                      components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3 space-y-1.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3 space-y-1.5" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-700" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 border-b pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-slate-800" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-blue-600" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                        th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 border-b" {...props} />,
                      }}
                    >
                      {selectedTrip.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {savedTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Map size={32} />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">No saved trips yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Save itineraries and travel plans from your chat to access them here later.
                  </p>
                </div>
              ) : (
                savedTrips.map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-start justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-slate-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                        <Calendar size={12} />
                        {new Date(trip.timestamp).toLocaleDateString()} at {new Date(trip.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2">
                         {trip.content.replace(/[#*`]/g, '')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(trip.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};