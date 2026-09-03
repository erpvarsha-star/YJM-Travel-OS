import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Trip, ItineraryDay, Activity } from '../types';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  Lightbulb, 
  Plus, 
  CheckCircle2, 
  Circle, 
  DollarSign, 
  Utensils, 
  Landmark, 
  Compass, 
  Coffee, 
  Train, 
  Hotel,
  Trash2,
  Download,
  FileText,
  Loader2,
  Printer
} from 'lucide-react';

interface ItineraryViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onAskConcierge: (prompt: string) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdateTrip,
  onAskConcierge,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newCategory, setNewCategory] = useState<'food' | 'culture' | 'adventure' | 'chill' | 'transit' | 'stay'>('culture');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState('0');
  const [newDuration, setNewDuration] = useState('60');
  const [newTip, setNewTip] = useState('');

  const currentDay = trip.itinerary[selectedDayIndex] || trip.itinerary[0];

  const generatePrintableHtml = (tripData: Trip) => {
    const totalActivities = tripData.itinerary.reduce((acc, day) => acc + day.activities.length, 0);
    const totalCost = tripData.itinerary.reduce(
      (acc, day) => acc + day.activities.reduce((dAcc, a) => dAcc + (a.estimatedCost || 0), 0),
      0
    );

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; padding: 28px; max-width: 800px; margin: 0 auto; line-height: 1.5;">
        <!-- Document Header -->
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
              Voyager Travel OS &bull; Complete Master Itinerary
            </div>
            <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
              ${tripData.destination}
            </h1>
            <div style="font-size: 13px; color: #64748b; font-weight: 500;">
              ${tripData.dates} &bull; ${tripData.itinerary.length} Days &bull; ${totalActivities} Stops Scheduled
            </div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">
            <div style="font-weight: 700; color: #0f172a;">Est. Activity Total</div>
            <div style="font-size: 18px; font-weight: 800; color: #059669; margin-top: 2px;">
              ${tripData.currencySymbol}${totalCost.toLocaleString()}
            </div>
            <div style="font-size: 11px; color: #94a3b8;">Currency: ${tripData.currency}</div>
          </div>
        </div>

        <!-- Trip Overview Badge Bar -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; margin-bottom: 24px; display: flex; gap: 20px; font-size: 12px; color: #334155;">
          <div><strong>Status:</strong> Confirmed Itinerary</div>
          <div><strong>Pace:</strong> ${tripData.pace || 'Balanced'}</div>
          <div><strong>Timezone:</strong> Local to ${tripData.destination}</div>
        </div>

        <!-- Day by Day Content -->
        ${tripData.itinerary.map(day => `
          <div class="pdf-day-card" style="margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
            <!-- Day Header -->
            <div style="background: #0f172a; color: #ffffff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 700; font-size: 13.5px;">
                Day ${day.dayNumber}: ${day.title}
              </div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                ${day.date ? day.date + ' &bull; ' : ''}${day.theme ? 'Theme: ' + day.theme : ''}
              </div>
            </div>

            <!-- Activities -->
            <div style="padding: 12px 16px;">
              ${day.activities.length === 0 ? `
                <div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 6px 0;">No activities scheduled for this day.</div>
              ` : day.activities.map((act, actIdx) => `
                <div class="pdf-activity-item" style="padding: 10px 0; border-bottom: ${actIdx === day.activities.length - 1 ? 'none' : '1px solid #f1f5f9'}; page-break-inside: avoid; break-inside: avoid;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="display: inline-block; background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">
                        ${act.time}
                      </span>
                      <span style="font-size: 13px; font-weight: 700; color: #0f172a;">
                        ${act.title}
                      </span>
                      <span style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; text-transform: capitalize;">
                        ${act.category}
                      </span>
                    </div>
                    <div style="text-align: right; font-size: 11px; color: #64748b; font-weight: 600;">
                      ${act.estimatedCost > 0 ? `${tripData.currencySymbol}${act.estimatedCost.toLocaleString()}` : 'Free'}
                      <span style="font-size: 10px; font-weight: 400; color: #94a3b8; margin-left: 4px;">(${act.durationMinutes}m)</span>
                    </div>
                  </div>

                  <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                    <strong>Location:</strong> ${act.location}
                  </div>

                  <div style="font-size: 11.5px; color: #334155; line-height: 1.45; margin-bottom: 4px;">
                    ${act.description}
                  </div>

                  ${act.insiderTip ? `
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #78350f; margin-top: 6px;">
                      <strong>Travel Brain Tip:</strong> ${act.insiderTip}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8;">
          Generated with Voyager Travel OS on ${new Date().toLocaleDateString()} &bull; Safe travels to ${tripData.destination}!
        </div>
      </div>
    `;
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setDownloadFeedback('Building printable PDF...');

    try {
      const container = document.createElement('div');
      container.innerHTML = generatePrintableHtml(trip);
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      document.body.appendChild(container);

      const filename = `${trip.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.pdf`;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(container).save();

      document.body.removeChild(container);
      setDownloadFeedback('PDF downloaded successfully!');
      setTimeout(() => setDownloadFeedback(null), 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to text file download if html2pdf fails
      handleDownloadText();
      setDownloadFeedback('Downloaded as text file backup.');
      setTimeout(() => setDownloadFeedback(null), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadText = () => {
    let content = `VOYAGER TRAVEL DOSSIER & ITINERARY\n`;
    content += `=====================================\n`;
    content += `Destination: ${trip.destination}\n`;
    content += `Dates: ${trip.dates}\n`;
    content += `Currency: ${trip.currency} (${trip.currencySymbol})\n`;
    content += `Pace: ${trip.pace || 'Balanced'}\n\n`;

    trip.itinerary.forEach((day) => {
      content += `-------------------------------------\n`;
      content += `DAY ${day.dayNumber}: ${day.title.toUpperCase()}\n`;
      if (day.date) content += `Date: ${day.date}\n`;
      if (day.theme) content += `Theme: ${day.theme}\n`;
      content += `-------------------------------------\n\n`;

      if (day.activities.length === 0) {
        content += `No activities planned for this day.\n\n`;
      } else {
        day.activities.forEach((act) => {
          content += `* [${act.time}] ${act.title} (${act.category.toUpperCase()})\n`;
          content += `  Location: ${act.location}\n`;
          content += `  Duration: ${act.durationMinutes} mins | Cost: ${act.estimatedCost > 0 ? `${trip.currencySymbol}${act.estimatedCost}` : 'Free'}\n`;
          content += `  Details: ${act.description}\n`;
          if (act.insiderTip) {
            content += `  Insider Tip: ${act.insiderTip}\n`;
          }
          content += `\n`;
        });
      }
    });

    content += `=====================================\n`;
    content += `Generated with Voyager Travel OS on ${new Date().toLocaleDateString()}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleActivityCompletion = (dayNumber: number, activityId: string) => {
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === activityId ? { ...act, completed: !act.completed } : act
          ),
        };
      }
      return day;
    });

    onUpdateTrip({ ...trip, itinerary: updatedItinerary });
  };

  const deleteActivity = (dayNumber: number, activityId: string) => {
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        };
      }
      return day;
    });

    onUpdateTrip({ ...trip, itinerary: updatedItinerary });
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      time: newTime || '10:00 AM',
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom itinerary event.',
      category: newCategory,
      location: newLocation.trim() || trip.destination,
      estimatedCost: parseFloat(newCost) || 0,
      durationMinutes: parseInt(newDuration, 10) || 60,
      insiderTip: newTip.trim() || undefined,
      completed: false,
    };

    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === currentDay.dayNumber) {
        return {
          ...day,
          activities: [...day.activities, newAct],
        };
      }
      return day;
    });

    onUpdateTrip({ ...trip, itinerary: updatedItinerary });
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setNewTip('');
    setNewCost('0');
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="h-4 w-4 text-orange-600" />;
      case 'culture':
        return <Landmark className="h-4 w-4 text-purple-600" />;
      case 'adventure':
        return <Compass className="h-4 w-4 text-emerald-600" />;
      case 'chill':
        return <Coffee className="h-4 w-4 text-cyan-600" />;
      case 'transit':
        return <Train className="h-4 w-4 text-blue-600" />;
      case 'stay':
        return <Hotel className="h-4 w-4 text-amber-600" />;
      default:
        return <Landmark className="h-4 w-4 text-stone-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'culture':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'adventure':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'chill':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'stay':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-stone-200 gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          {trip.itinerary.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={day.dayNumber}
                id={`btn-day-${day.dayNumber}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col text-left px-4 py-2 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Day {day.dayNumber}
                  </span>
                  {day.date && (
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-amber-100' : 'text-stone-400'
                      }`}
                    >
                      • {day.date.slice(5)}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium truncate max-w-[140px] ${
                    isSelected ? 'text-amber-50' : 'text-stone-500'
                  }`}
                >
                  {day.theme || day.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-download-itinerary-pdf"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-300 px-3.5 py-2 rounded-lg transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            title="Download clean, printable PDF of full itinerary"
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
            ) : (
              <Download className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Itinerary (PDF)'}</span>
          </button>

          <button
            id="btn-download-itinerary-txt"
            onClick={handleDownloadText}
            className="hidden sm:inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-2 rounded-lg transition-colors border border-stone-200 cursor-pointer"
            title="Download as clean text file (.txt)"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>TXT</span>
          </button>

          <button
            id="btn-add-activity-open"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Stop</span>
          </button>
        </div>
      </div>

      {/* Download Status Toast / Feedback */}
      {downloadFeedback && (
        <div className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium shadow-xs">
          {isGeneratingPdf ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          )}
          <span>{downloadFeedback}</span>
        </div>
      )}

      {/* Active Day Header */}
      {currentDay && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
              Day {currentDay.dayNumber} Plan {currentDay.date ? `• ${currentDay.date}` : ''}
            </div>
            <h2 className="text-xl font-semibold text-stone-900">{currentDay.title}</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Theme: <span className="font-medium text-stone-700">{currentDay.theme}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                onAskConcierge(
                  `Give me 3 secret local food or café spots close to Day ${currentDay.dayNumber} in ${trip.destination} (${currentDay.title}).`
                )
              }
              className="inline-flex items-center space-x-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Ask Gemini for Gems Near Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-stone-200 before:hidden sm:before:block">
        {currentDay?.activities.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <p className="text-sm text-stone-500">No activities planned for this day yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 inline-flex items-center space-x-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add your first activity</span>
            </button>
          </div>
        ) : (
          currentDay?.activities.map((act, index) => {
            return (
              <div
                key={act.id}
                id={`activity-card-${act.id}`}
                className={`relative sm:pl-12 group transition-all`}
              >
                {/* Timeline Dot (Desktop) */}
                <div className="absolute left-3.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-amber-600 hidden sm:flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                </div>

                {/* Card */}
                <div
                  className={`bg-white rounded-2xl p-5 border transition-shadow ${
                    act.completed
                      ? 'border-stone-200 bg-stone-50/70 opacity-80'
                      : 'border-stone-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox and Title */}
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleActivityCompletion(currentDay.dayNumber, act.id)}
                        className="mt-0.5 text-stone-400 hover:text-amber-600 transition-colors shrink-0"
                        title={act.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {act.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-stone-500" />
                            <span>{act.time}</span>
                          </span>

                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center space-x-1 capitalize ${getCategoryBadgeClass(
                              act.category
                            )}`}
                          >
                            {getCategoryIcon(act.category)}
                            <span>{act.category}</span>
                          </span>

                          <span className="text-xs text-stone-500 flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-stone-400" />
                            <span>{act.location}</span>
                          </span>
                        </div>

                        <h3
                          className={`text-base font-semibold text-stone-900 ${
                            act.completed ? 'line-through text-stone-400' : ''
                          }`}
                        >
                          {act.title}
                        </h3>

                        <p className="text-xs text-stone-600 leading-relaxed">{act.description}</p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex flex-col items-end space-y-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-stone-900">
                          {act.estimatedCost > 0
                            ? `${trip.currencySymbol}${act.estimatedCost.toLocaleString()}`
                            : 'Free'}
                        </div>
                        <div className="text-[10px] text-stone-400">{act.durationMinutes} mins</div>
                      </div>

                      <button
                        onClick={() => deleteActivity(currentDay.dayNumber, act.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 p-1 transition-opacity"
                        title="Delete stop"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Brain Insider Tip */}
                  {act.insiderTip && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-start space-x-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-stone-700">
                        <span className="font-semibold text-amber-900">Travel Brain Tip: </span>
                        {act.insiderTip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">
              Add Activity to Day {currentDay?.dayNumber}
            </h3>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Traditional Machiya Tea Ceremony"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g., 02:30 PM"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="culture">Culture</option>
                    <option value="food">Food</option>
                    <option value="adventure">Adventure</option>
                    <option value="chill">Chill</option>
                    <option value="transit">Transit</option>
                    <option value="stay">Stay</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Location / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., Gion District"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Estimated Cost ({trip.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What makes this activity special..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Insider Tip (Optional)
                </label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="e.g., Book 2 weeks ahead, bring cash"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
