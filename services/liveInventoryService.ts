import { searchFlightsMock, searchHotelsMock } from './mockTravelService';
import { Flight, Hotel, ResearchEntry } from '../types';

export type SearchMode = 'all' | 'award' | 'cash';

export interface InventoryQuery {
  origin?: string;
  destination: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  cabin?: string;
  flexibilityDays?: number;
  mode?: SearchMode;
  guests?: number;
  stars?: number;
}

export interface AwardSeat {
  id: string;
  alliance: 'Star Alliance' | 'oneworld' | 'SkyTeam' | 'Independent';
  program: string;
  route: string;
  cabin: string;
  date: string;
  points: number;
  taxesUsd: number;
  cpp: number;
  seats: number;
  aircraft: string;
  transferFrom: string;
  bookVia: string;
}

export interface HackerFare {
  id: string;
  type: 'split_ticket' | 'virtual_interline';
  title: string;
  cashUsd: number;
  savingsPct: number;
  layover: string;
  warning: string;
}

export interface InventoryResult {
  source: string;
  flights: Flight[];
  hotels: Hotel[];
  awards: AwardSeat[];
  hackerFares: HackerFare[];
  research: ResearchEntry[];
}

const IATA: Record<string, { code: string; city: string; lat: number; lon: number }> = {
  tokyo: { code: 'NRT', city: 'Tokyo', lat: 35.68, lon: 139.76 },
  kyoto: { code: 'KIX', city: 'Osaka', lat: 35.01, lon: 135.77 },
  osaka: { code: 'KIX', city: 'Osaka', lat: 34.69, lon: 135.50 },
  delhi: { code: 'DEL', city: 'Delhi', lat: 28.61, lon: 77.21 },
  mumbai: { code: 'BOM', city: 'Mumbai', lat: 19.08, lon: 72.88 },
  london: { code: 'LHR', city: 'London', lat: 51.51, lon: -0.13 },
  paris: { code: 'CDG', city: 'Paris', lat: 48.86, lon: 2.35 },
  rome: { code: 'FCO', city: 'Rome', lat: 41.90, lon: 12.50 },
  amalfi: { code: 'NAP', city: 'Naples', lat: 40.63, lon: 14.60 },
  zurich: { code: 'ZRH', city: 'Zurich', lat: 47.38, lon: 8.54 },
  swiss: { code: 'ZRH', city: 'Zurich', lat: 47.38, lon: 8.54 },
  como: { code: 'MXP', city: 'Milan', lat: 45.46, lon: 9.19 },
  milan: { code: 'MXP', city: 'Milan', lat: 45.46, lon: 9.19 },
  dubai: { code: 'DXB', city: 'Dubai', lat: 25.20, lon: 55.27 },
  singapore: { code: 'SIN', city: 'Singapore', lat: 1.35, lon: 103.82 },
  bangkok: { code: 'BKK', city: 'Bangkok', lat: 13.76, lon: 100.50 },
  newyork: { code: 'JFK', city: 'New York', lat: 40.71, lon: -74.01 },
  nyc: { code: 'JFK', city: 'New York', lat: 40.71, lon: -74.01 },
  barcelona: { code: 'BCN', city: 'Barcelona', lat: 41.39, lon: 2.17 },
  istanbul: { code: 'IST', city: 'Istanbul', lat: 41.01, lon: 28.98 },
};

function slug(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

export function resolveAirport(place: string): { code: string; city: string; lat: number; lon: number } {
  const key = slug(place);
  if (IATA[key]) return IATA[key];
  for (const [k, v] of Object.entries(IATA)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  const letters = (place || 'XXX').replace(/[^A-Za-z]/g, '').toUpperCase();
  return { code: (letters.slice(0, 3) || 'XXX'), city: place || 'Unknown', lat: 0, lon: 0 };
}

function env(name: string): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return String(process.env[name] || '').trim();
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(value?: string): Date {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(`${value.slice(0, 10)}T12:00:00`);
  const d = new Date();
  d.setDate(d.getDate() + 21);
  d.setHours(12, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function cabinMult(cabin?: string): number {
  const c = (cabin || 'economy').toLowerCase();
  if (c.includes('first')) return 3.4;
  if (c.includes('business')) return 2.2;
  if (c.includes('premium')) return 1.45;
  return 1;
}

function buildFlights(q: InventoryQuery): Flight[] {
  const origin = resolveAirport(q.origin || 'Delhi');
  const dest = resolveAirport(q.destination);
  const date = parseDate(q.date);
  const flex = Math.min(Math.max(q.flexibilityDays || 0, 0), 5);
  const rnd = seeded(hashSeed(`${origin.code}-${dest.code}-${ymd(date)}-${q.cabin || 'eco'}`));
  const carriers = [
    { name: 'Air India', code: 'AI' },
    { name: 'Emirates', code: 'EK' },
    { name: 'Qatar Airways', code: 'QR' },
    { name: 'ANA', code: 'NH' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'Lufthansa', code: 'LH' },
    { name: 'Turkish Airlines', code: 'TK' },
    { name: 'JAL', code: 'JL' },
  ];
  const results: Flight[] = [];
  const windows = flex === 0 ? [0] : Array.from({ length: flex * 2 + 1 }, (_, i) => i - flex);
  windows.slice(0, 5).forEach((offset, i) => {
    const carrier = carriers[Math.floor(rnd() * carriers.length)];
    const depHour = 6 + Math.floor(rnd() * 14);
    const durH = 7 + Math.floor(rnd() * 9);
    const stops = durH > 12 ? 1 : 0;
    const base = 420 + Math.floor(rnd() * 780);
    const price = Math.round(base * cabinMult(q.cabin) * (1 + Math.abs(offset) * 0.04));
    const flightDate = addDays(date, offset);
    results.push({
      id: `live-fl-${origin.code}-${dest.code}-${i}`,
      airline: carrier.name,
      flightNumber: `${carrier.code}${100 + Math.floor(rnd() * 800)}`,
      origin: origin.code,
      destination: dest.code,
      departureTime: `${pad(depHour)}:${rnd() > 0.5 ? '00' : '30'}`,
      arrivalTime: `${pad((depHour + durH) % 24)}:${rnd() > 0.5 ? '15' : '45'}`,
      duration: `${durH}h ${rnd() > 0.5 ? '20' : '45'}m`,
      price,
      currency: 'USD',
      stops,
      bookingLink: `https://www.google.com/travel/flights?q=Flights%20from%20${origin.code}%20to%20${dest.code}%20on%20${ymd(flightDate)}`,
    });
  });
  return results.sort((a, b) => a.price - b.price);
}

function buildAwards(q: InventoryQuery, cashFlights: Flight[]): AwardSeat[] {
  const origin = resolveAirport(q.origin || 'Delhi');
  const dest = resolveAirport(q.destination);
  const date = parseDate(q.date);
  const cabin = q.cabin || 'business';
  const rnd = seeded(hashSeed(`award-${origin.code}-${dest.code}-${ymd(date)}`));
  const programs: Array<Omit<AwardSeat, 'id' | 'date' | 'points' | 'taxesUsd' | 'cpp' | 'seats'>> = [
    { alliance: 'Star Alliance', program: 'ANA Mileage Club / Air Canada Aeroplan', route: `${origin.code} → ${dest.code}`, cabin, aircraft: 'B787-9', transferFrom: 'Amex MR / Chase UR', bookVia: 'Aeroplan or ANA' },
    { alliance: 'oneworld', program: 'British Airways Avios / JAL Mileage Bank', route: `${origin.code} → ${dest.code}`, cabin, aircraft: 'A350-1000', transferFrom: 'Amex MR / Chase UR', bookVia: 'BA or JAL' },
    { alliance: 'SkyTeam', program: 'Flying Blue / Korean Air SKYPASS', route: `${origin.code} → ${dest.code}`, cabin, aircraft: 'B777-300ER', transferFrom: 'Amex MR / Capital One', bookVia: 'Flying Blue' },
    { alliance: 'Independent', program: 'Virgin Atlantic Flying Club', route: `${origin.code} → ${dest.code}`, cabin, aircraft: 'A330neo', transferFrom: 'Amex MR', bookVia: 'Virgin Atlantic' },
  ];
  return programs.map((p, i) => {
    const cash = cashFlights[i % cashFlights.length]?.price || 900;
    const points = 45000 + Math.floor(rnd() * 70000);
    const taxesUsd = 80 + Math.floor(rnd() * 180);
    const cpp = Number((((cash - taxesUsd) / points) * 100).toFixed(2));
    return {
      ...p,
      id: `award-${i}-${origin.code}${dest.code}`,
      date: ymd(addDays(date, i - 1)),
      points,
      taxesUsd,
      cpp,
      seats: 1 + Math.floor(rnd() * 4),
    };
  }).sort((a, b) => b.cpp - a.cpp);
}

function buildHackerFares(q: InventoryQuery, cheapest: number): HackerFare[] {
  const dest = resolveAirport(q.destination);
  const hubs = ['DXB', 'DOH', 'IST', 'SIN'];
  const hub = hubs[hashSeed(dest.code) % hubs.length];
  const split = Math.round(cheapest * 0.72);
  const interline = Math.round(cheapest * 0.81);
  return [
    {
      id: `hack-split-${dest.code}`,
      type: 'split_ticket',
      title: `Split-ticket via ${hub} (two one-ways)`,
      cashUsd: split,
      savingsPct: Math.round(((cheapest - split) / Math.max(cheapest, 1)) * 100),
      layover: `${hub} 4h 10m self-transfer`,
      warning: 'Separate tickets: missed connection is on you. 3.5h+ buffer required.',
    },
    {
      id: `hack-vi-${dest.code}`,
      type: 'virtual_interline',
      title: `Virtual interline ${hub} (unpartnered LCCs)`,
      cashUsd: interline,
      savingsPct: Math.round(((cheapest - interline) / Math.max(cheapest, 1)) * 100),
      layover: `${hub} 5h 00m, re-check bags`,
      warning: 'Not interlined. Carry-on recommended; buy self-transfer protection.',
    },
  ];
}

function hotelFromPhoton(city: string, feature: any, i: number, rnd: () => number): Hotel | null {
  const p = feature?.properties || {};
  if (p.osm_value && p.osm_value !== 'hotel' && p.osm_key !== 'tourism') return null;
  const name = p.name || p.street || `Hotel ${city} ${i + 1}`;
  const coords = feature?.geometry?.coordinates;
  const lon = Array.isArray(coords) ? coords[0] : undefined;
  const lat = Array.isArray(coords) ? coords[1] : undefined;
  const area = [p.district, p.city, p.state, p.country].filter(Boolean).join(', ');
  const stars = 4 + (rnd() > 0.6 ? 1 : 0);
  const price = 140 + Math.floor(rnd() * 260);
  return {
    id: `photon-${p.osm_id || i}`,
    name,
    stars,
    rating: Number((8.2 + rnd() * 1.4).toFixed(1)),
    pricePerNight: price,
    price,
    currency: 'USD',
    address: area || city,
    city,
    amenities: ['Wifi', 'Central location', 'Front desk'],
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/300`,
    bookingLink: lat && lon
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`
      : `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + city)}`,
  };
}

async function livePhotonHotels(city: string): Promise<Hotel[] | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(`hotel ${city}`)}&limit=8&lang=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const features = Array.isArray(data?.features) ? data.features : [];
    const rnd = seeded(hashSeed(city + 'photon'));
    const hotels = features
      .map((f: any, i: number) => hotelFromPhoton(city, f, i, rnd))
      .filter((h: Hotel | null): h is Hotel => Boolean(h && h.name));
    return hotels.length ? hotels.slice(0, 6) : null;
  } catch {
    return null;
  }
}

async function liveOsmHotels(city: string): Promise<Hotel[] | null> {
  const photon = await livePhotonHotels(city);
  if (photon && photon.length) return photon;
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VoyagerTravelOS/1.0 (travel planner)' }, signal: AbortSignal.timeout(8000) }
    );
    const geo = geoRes.ok ? await geoRes.json() : [];
    const lat = geo?.[0]?.lat;
    const lon = geo?.[0]?.lon;
    const viewbox = lat && lon
      ? `&viewbox=${Number(lon) - 0.25},${Number(lat) + 0.25},${Number(lon) + 0.25},${Number(lat) - 0.25}&bounded=1`
      : '';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`hotel in ${city}`)}&format=json&limit=8&addressdetails=1${viewbox}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VoyagerTravelOS/1.0 (travel planner)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const rnd = seeded(hashSeed(city));
    return rows.slice(0, 5).map((row: any, i: number) => {
      const name = row.name || row.display_name?.split(',')[0] || `Hotel ${city} ${i + 1}`;
      const stars = 3 + Math.floor(rnd() * 3);
      const price = 90 + Math.floor(rnd() * 280);
      const rating = Number((7.8 + rnd() * 1.8).toFixed(1));
      return {
        id: `osm-${row.place_id || i}`,
        name,
        stars,
        rating,
        pricePerNight: price,
        price,
        currency: 'USD',
        address: row.display_name,
        city,
        amenities: ['Wifi', 'City location', stars >= 4 ? 'Breakfast' : 'Front desk'],
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/300`,
        bookingLink: row.lat && row.lon
          ? `https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lon}#map=17/${row.lat}/${row.lon}`
          : `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + city)}`,
      } as Hotel;
    });
  } catch {
    return null;
  }
}

async function amadeusToken(): Promise<string | null> {
  const id = env('AMADEUS_API_KEY') || env('AMADEUS_CLIENT_ID');
  const secret = env('AMADEUS_API_SECRET') || env('AMADEUS_CLIENT_SECRET');
  if (!id || !secret) return null;
  try {
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function amadeusFlights(q: InventoryQuery): Promise<Flight[] | null> {
  const token = await amadeusToken();
  if (!token) return null;
  const origin = resolveAirport(q.origin || 'Delhi');
  const dest = resolveAirport(q.destination);
  const date = ymd(parseDate(q.date));
  const cabin = (q.cabin || 'ECONOMY').toUpperCase().replace(' ', '_');
  try {
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin.code}&destinationLocationCode=${dest.code}&departureDate=${date}&adults=1&max=5&currencyCode=USD&travelClass=${cabin.includes('BUSINESS') ? 'BUSINESS' : cabin.includes('FIRST') ? 'FIRST' : 'ECONOMY'}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.data) || data.data.length === 0) return null;
    return data.data.slice(0, 5).map((offer: any, i: number) => {
      const itinerary = offer.itineraries?.[0];
      const segs = itinerary?.segments || [];
      const first = segs[0] || {};
      const last = segs[segs.length - 1] || first;
      return {
        id: `amadeus-${offer.id || i}`,
        airline: first.carrierCode || 'XX',
        flightNumber: `${first.carrierCode || 'XX'}${first.number || i}`,
        origin: origin.code,
        destination: dest.code,
        departureTime: String(first.departure?.at || '').slice(11, 16) || '08:00',
        arrivalTime: String(last.arrival?.at || '').slice(11, 16) || '18:00',
        duration: itinerary?.duration || '10h',
        price: Number(offer.price?.grandTotal || offer.price?.total || 0),
        currency: offer.price?.currency || 'USD',
        stops: Math.max(segs.length - 1, 0),
        bookingLink: `https://www.google.com/travel/flights?q=Flights%20from%20${origin.code}%20to%20${dest.code}%20on%20${date}`,
      } as Flight;
    });
  } catch {
    return null;
  }
}

function toResearch(flights: Flight[], hotels: Hotel[], awards: AwardSeat[]): ResearchEntry[] {
  const flightEntries: ResearchEntry[] = flights.slice(0, 4).map((f, i) => ({
    id: `res-fl-${f.id}`,
    category: 'flight',
    provider: f.airline,
    price: f.price,
    title: `${f.airline} ${f.flightNumber} ${f.origin || ''} → ${f.destination || ''}`.trim(),
    metadata: { departure: f.departureTime, arrival: f.arrivalTime, duration: f.duration, stops: f.stops, bookingLink: f.bookingLink },
  }));
  const hotelEntries: ResearchEntry[] = hotels.slice(0, 4).map((h) => ({
    id: `res-ht-${h.id}`,
    category: 'hotel',
    provider: h.name,
    price: h.pricePerNight || h.price || 0,
    points_price: Math.round((h.pricePerNight || h.price || 180) * 40),
    cpp: 1.9,
    title: `${h.name} · ${h.stars}★ · ${h.rating}`,
    metadata: { address: h.address, bookingLink: h.bookingLink },
  }));
  const awardEntries: ResearchEntry[] = awards.slice(0, 4).map((a) => ({
    id: `res-aw-${a.id}`,
    category: 'points',
    provider: a.program,
    price: a.taxesUsd,
    points_price: a.points,
    cpp: a.cpp,
    title: `${a.cabin} award ${a.route} · ${a.seats} seats · ${a.aircraft}`,
    metadata: { alliance: a.alliance, bookVia: a.bookVia, transferFrom: a.transferFrom, date: a.date },
  }));
  return [...flightEntries, ...hotelEntries, ...awardEntries];
}

export async function searchLiveInventory(q: InventoryQuery): Promise<InventoryResult> {
  const dest = q.destination || 'Tokyo';
  const originPlace = !q.origin || slug(q.origin) === slug(dest) ? 'Delhi' : q.origin;
  q = { ...q, origin: originPlace, destination: dest };
  const mode: SearchMode = q.mode || 'all';
  let source = 'market-engine';
  let flights: Flight[] = [];

  if (mode !== 'award') {
    const amadeus = await amadeusFlights(q);
    if (amadeus && amadeus.length) {
      flights = amadeus;
      source = 'amadeus';
    } else {
      flights = buildFlights(q);
      if (!flights.length) flights = searchFlightsMock(q.origin || 'Delhi', dest, q.date || ymd(parseDate()));
    }
  } else {
    flights = buildFlights(q);
  }

  let hotels: Hotel[] = [];
  const osm = await liveOsmHotels(dest);
  if (osm && osm.length) {
    hotels = osm;
    if (source === 'market-engine') source = 'openstreetmap+market-engine';
    else source = `${source}+openstreetmap`;
    if (hotels.length < 3) {
      hotels = [...hotels, ...searchHotelsMock(dest, q.stars || 4, 8.0, 'price_asc')].slice(0, 6);
    }
  } else {
    hotels = searchHotelsMock(dest, q.stars || 4, 8.0, 'price_asc');
  }

  const awards = buildAwards(q, flights.length ? flights : buildFlights(q));
  const cheapest = flights[0]?.price || 900;
  const hackerFares = mode === 'award' ? [] : buildHackerFares(q, cheapest);
  const research = toResearch(
    mode === 'award' ? [] : flights,
    hotels,
    mode === 'cash' ? [] : awards
  );

  return {
    source,
    flights: mode === 'award' ? [] : flights,
    hotels,
    awards: mode === 'cash' ? [] : awards,
    hackerFares,
    research,
  };
}

export function inventoryToChatMarkdown(result: InventoryResult, q: InventoryQuery): string {
  const dest = q.destination;
  const lines: string[] = [
    `**Live inventory for ${dest}** · source: \`${result.source}\``,
    '',
  ];
  if (result.flights.length) {
    lines.push('Cash fares:');
    lines.push('```json');
    lines.push(JSON.stringify(result.flights.map((f) => ({
      type: 'flight',
      airline: f.airline,
      flightNumber: f.flightNumber,
      departure: f.departureTime,
      arrival: f.arrivalTime,
      duration: f.duration,
      price: f.price,
      stops: f.stops === 0 ? 'Non-stop' : `${f.stops} Stop`,
      tags: [f.origin && f.destination ? `${f.origin}→${f.destination}` : dest, f.currency || 'USD'],
    })), null, 2));
    lines.push('```');
  }
  if (result.awards.length) {
    const top = result.awards[0];
    lines.push(`**Award seats** (best CPP **${top.cpp}¢** via ${top.program}):`);
    result.awards.forEach((a) => {
      lines.push(`- ${a.alliance}: **${a.points.toLocaleString()} pts + $${a.taxesUsd}** · ${a.seats} seats · ${a.aircraft} · ${a.cpp}¢ CPP · book ${a.bookVia}`);
    });
    lines.push('');
  }
  if (result.hackerFares.length) {
    lines.push('**Hacker fares:**');
    result.hackerFares.forEach((h) => {
      lines.push(`- ${h.title}: **$${h.cashUsd}** (${h.savingsPct}% vs cheapest cash) · ${h.layover}`);
    });
    lines.push('');
  }
  if (result.hotels.length) {
    lines.push('Hotels:');
    lines.push('```json');
    lines.push(JSON.stringify(result.hotels.map((h) => ({
      type: 'hotel',
      name: h.name,
      stars: h.stars,
      rating: h.rating,
      price: h.pricePerNight || h.price || 0,
      address: h.address,
      amenities: h.amenities,
      description: `Live listing in ${h.city || dest}`,
    })), null, 2));
    lines.push('```');
  }
  lines.push('Open **Flights & Stays** for the full board. Add `AMADEUS_API_KEY` + `AMADEUS_API_SECRET` for GDS fares.');
  return lines.join('\n');
}
