import React, { useState } from 'react';
import { Trip, BrainNote, Activity } from '../types';
import { synthesizeBrainNoteAI } from '../../services/travelBrainService';
import { 
  Sparkles, 
  Tag, 
  AlertTriangle, 
  Check, 
  Copy, 
  Trash2, 
  PlusCircle, 
  Lightbulb, 
  Compass,
  FileText,
  Bookmark,
  Share2,
  Calendar
} from 'lucide-react';

interface BrainViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const BrainView: React.FC<BrainViewProps> = ({ trip, onUpdateTrip }) => {
  const [noteInput, setNoteInput] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'booking' | 'recommendation' | 'scratchpad' | 'link'>('all');
  const [synthesisResult, setSynthesisResult] = useState<{
    summary?: string;
    extractedTags?: string[];
    detectedType?: string;
    suggestedActivities?: Activity[];
    alerts?: string[];
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    setIsSynthesizing(true);
    setSynthesisResult(null);

    try {
      const data = await synthesizeBrainNoteAI(noteInput, {
        destination: trip.destination,
        durationDays: trip.durationDays
      });
      setSynthesisResult(data);

      // Create new Brain Note in trip
      const newNote: BrainNote = {
        id: `note-${Date.now()}`,
        content: noteInput.trim(),
        text: noteInput.trim(),
        type: (data.detectedType as any) || 'scratchpad',
        createdAt: new Date().toISOString(),
        extractedTags: data.extractedTags || ['Travel Note'],
        tags: data.extractedTags || ['Travel Note'],
      };

      onUpdateTrip({
        ...trip,
        brainNotes: [newNote, ...trip.brainNotes],
      });

      setNoteInput('');
    } catch (err) {
      console.error('Failed to synthesize note:', err);
      // Fallback simple note creation
      const fallbackNote: BrainNote = {
        id: `note-${Date.now()}`,
        content: noteInput.trim(),
        text: noteInput.trim(),
        type: 'scratchpad',
        createdAt: new Date().toISOString(),
        extractedTags: ['Travel Memo'],
        tags: ['Travel Memo']
      };
      onUpdateTrip({
        ...trip,
        brainNotes: [fallbackNote, ...trip.brainNotes],
      });
      setNoteInput('');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAddSuggestedActivity = (act: any, targetDayNumber: number) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      time: act.time || '03:00 PM',
      title: act.title,
      description: act.insiderTip || 'Added from Brain synthesis.',
      category: act.category || 'culture',
      location: trip.destination,
      estimatedCost: act.estimatedCost || 0,
      durationMinutes: act.durationMinutes || 60,
      insiderTip: act.insiderTip,
      completed: false,
    };

    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === targetDayNumber) {
        return {
          ...day,
          activities: [...day.activities, newAct],
        };
      }
      return day;
    });

    onUpdateTrip({
      ...trip,
      itinerary: updatedItinerary,
    });
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateTrip({
      ...trip,
      brainNotes: trip.brainNotes.filter((n) => n.id !== noteId),
    });
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = trip.brainNotes.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Cognitive Ingest Station */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center space-x-2 text-amber-600 mb-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-base font-semibold text-stone-900">
            Cognitive Brain Ingest & Note Synthesizer
          </h2>
        </div>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">
          Dump messy booking confirmation emails, flight numbers, Instagram/Reddit recommendations, or friend tips. Gemini will distill them, extract tags, flag alerts, and convert them into actionable itinerary stops.
        </p>

        <form onSubmit={handleSynthesize} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              id="brain-note-input"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Paste raw notes: e.g. 'Flight NH106 landing at Haneda 13:45. Friend says get the dipping ramen at Fuunji, cash only, arrive 20 min early! Also need to reserve Shibuya Sky for sunset...'"
              className="w-full px-3.5 py-3 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder:text-stone-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-[11px] text-stone-400">
              <span className="font-medium text-stone-600">Quick Samples:</span>
              <button
                type="button"
                onClick={() =>
                  setNoteInput(
                    'Flight arrives at 2:00 PM. Hotel check-in at 3:00 PM. Must try local craft sake tasting near the canal at night!'
                  )
                }
                className="hover:text-amber-700 underline"
              >
                Flight & Stay
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() =>
                  setNoteInput(
                    'Instagram spot: Hidden rooftop teahouse overlooking the ancient pagodas. Needs reservation 3 days ahead via website.'
                  )
                }
                className="hover:text-amber-700 underline"
              >
                Hidden Gem
              </button>
            </div>

            <button
              type="submit"
              id="btn-synthesize-note"
              disabled={isSynthesizing || !noteInput.trim()}
              className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Gemini Synthesizing...' : 'Synthesize Brain Note'}</span>
            </button>
          </div>
        </form>

        {/* Live Synthesis Extraction Preview */}
        {synthesisResult && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Cognitive Extraction Complete
              </span>
              <span className="text-[11px] font-medium bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full capitalize">
                Type: {synthesisResult.detectedType || 'Note'}
              </span>
            </div>

            {synthesisResult.summary && (
              <p className="text-xs text-stone-800 font-medium leading-relaxed">
                {synthesisResult.summary}
              </p>
            )}

            {/* Extracted Tags */}
            {synthesisResult.extractedTags && synthesisResult.extractedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {synthesisResult.extractedTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-[11px] bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800"
                  >
                    <Tag className="h-3 w-3 text-amber-600" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Alerts */}
            {synthesisResult.alerts && synthesisResult.alerts.length > 0 && (
              <div className="space-y-1 pt-1">
                {synthesisResult.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-1.5 text-xs text-red-800 bg-red-50 p-2 rounded-lg border border-red-200"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actionable Suggested Activities */}
            {synthesisResult.suggestedActivities && synthesisResult.suggestedActivities.length > 0 && (
              <div className="pt-2 border-t border-amber-200">
                <span className="text-xs font-semibold text-stone-900 block mb-2">
                  Actionable Stops Extracted from this Note:
                </span>
                <div className="space-y-2">
                  {synthesisResult.suggestedActivities.map((act, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-stone-900">{act.title}</div>
                        <div className="text-stone-500 text-[11px]">{act.insiderTip}</div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {trip.itinerary.slice(0, 3).map((day) => (
                          <button
                            key={day.dayNumber}
                            onClick={() => handleAddSuggestedActivity(act, day.dayNumber)}
                            className="bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                            title={`Add directly to Day ${day.dayNumber}`}
                          >
                            + Day {day.dayNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Filter Pills & Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Brain Vault ({trip.brainNotes.length})
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            {(['all', 'booking', 'recommendation', 'scratchpad'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  activeFilter === filter
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Note Cards Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
            No notes found under this category. Paste your first note above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize">
                        {note.type}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.extractedTags?.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleCopyNote(note.id, note.content)}
                        className="text-stone-400 hover:text-stone-700 p-1 rounded"
                        title="Copy note"
                      >
                        {copiedId === note.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
