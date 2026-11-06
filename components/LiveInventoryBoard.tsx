import React, { useEffect, useState } from 'react';
import { AwardSeat, Flight, HackerFare, Hotel, InventoryResult } from '../services/liveInventoryService';
import { Trip } from '../types';
import { BedDouble, ExternalLink, Plane, RefreshCw, Sparkles, Wallet } from 'lucide-react';

interface Props {
  trip: Trip;
  origin?: string;
  onSaveResearch: (result: InventoryResult) => void;
}

export const LiveInventoryBoard: React.FC<Props> = ({ trip, origin = 'Delhi', onSaveResearch }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<InventoryResult | null>(null);
  const [mode, setMode] = useState<'all' | 'award' | 'cash'>('all');

  const runSearch = async (nextMode = mode) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inventory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination: trip.destination,
          date: trip.startDate,
          checkIn: trip.startDate,
          checkOut: trip.endDate,
          cabin: trip.cabinPreference || 'business',
          flexibilityDays: 3,
          mode: nextMode,
          stars: 4,
        }),
      });
      if (!res.ok) throw new Error('Inventory search failed');
      const data: InventoryResult = await res.json();
      setResult(data);
      onSaveResearch(data);
    } catch (e: any) {
      setError(e.message || 'Could not load live inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id, trip.destination, trip.startDate]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'cash', 'award'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); runSearch(m); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                mode === m
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {m === 'all' ? 'Cash + Awards' : m === 'cash' ? 'Cash fares' : 'Award seats'}
            </button>
          ))}
        </div>
        <button
          onClick={() => runSearch(mode)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh live board
        </button>
      </div>

      {error && <div className="text-xs text-rose-400">{error}</div>}
      {loading && !result && <div className="text-xs text-slate-400">Scanning live inventory...</div>}

      {result && (
        <>
          <p className="text-[11px] text-slate-500">Source: {result.source} · {origin} → {trip.destination}</p>

          {result.flights.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Plane size={14} /> Live cash fares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.flights.map((f: Flight) => (
                  <article key={f.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{f.airline} {f.flightNumber}</span>
                      <span>{f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}</span>
                    </div>
                    <div className="text-white font-semibold">{f.departureTime} → {f.arrivalTime}</div>
                    <div className="text-xs text-slate-400 mt-1">{f.origin} → {f.destination} · {f.duration}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-emerald-400 font-bold">${f.price}</span>
                      {f.bookingLink && (
                        <a href={f.bookingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 flex items-center gap-1">
                          Book <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {result.awards.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Sparkles size={14} className="text-amber-400" /> Reward seats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.awards.map((a: AwardSeat) => (
                  <article key={a.id} className="p-4 rounded-xl bg-slate-900 border border-amber-500/20">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-amber-300 mb-1">
                      <span>{a.alliance}</span>
                      <span>{a.cpp}¢ CPP</span>
                    </div>
                    <div className="text-white font-semibold">{a.route} · {a.cabin}</div>
                    <div className="text-xs text-slate-400 mt-1">{a.program} · {a.aircraft} · {a.seats} seats · {a.date}</div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-amber-400 font-mono">{a.points.toLocaleString()} pts + ${a.taxesUsd}</span>
                      <span className="text-[11px] text-slate-400">via {a.bookVia}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {result.hackerFares.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Wallet size={14} className="text-emerald-400" /> Hacker fares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.hackerFares.map((h: HackerFare) => (
                  <article key={h.id} className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20">
                    <div className="text-white font-semibold">{h.title}</div>
                    <div className="text-emerald-400 font-bold mt-1">${h.cashUsd} <span className="text-xs font-normal text-emerald-300">-{h.savingsPct}%</span></div>
                    <p className="text-[11px] text-slate-400 mt-2">{h.layover}. {h.warning}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {result.hotels.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><BedDouble size={14} /> Live hotels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.hotels.map((h: Hotel) => (
                  <article key={h.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between gap-2">
                      <h4 className="text-white font-semibold text-sm">{h.name}</h4>
                      <span className="text-xs text-amber-300">{h.stars}★ {h.rating}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{h.address}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-emerald-400 font-bold">${h.pricePerNight || h.price}/night</span>
                      {h.bookingLink && (
                        <a href={h.bookingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 flex items-center gap-1">
                          Map <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
