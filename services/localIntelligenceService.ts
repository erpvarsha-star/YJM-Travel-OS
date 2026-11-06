import { Flight, Hotel, Trip, WeatherData, UserProfile, PackingItem, CulturalInsight, Activity } from '../types';
import { searchFlightsMock, searchHotelsMock } from './mockTravelService';

const DEST_HINTS: Record<string, { country: string; currency: string; symbol: string; food: string[]; sights: string[]; transit: string; plug: string; police: string; ambulance: string; weather: string; phrases: CulturalInsight['phrases']; etiquette: string[]; hacks: string[] }> = {
  tokyo: {
    country: 'Japan', currency: 'JPY', symbol: '¥',
    food: ['Fuunji Tsukemen (Shinjuku)', 'Tsukiji Outer Market donburi', 'Monjayaki in Tsukishima', 'Bar High Five in Ginza'],
    sights: ['Senso-ji at sunrise', 'TeamLab Planets', 'Shibuya Sky sunset', 'Arashiyama bamboo grove'],
    transit: 'Suica/Pasmo in Apple Wallet plus JR Yamanote and Nozomi Shinkansen',
    plug: 'Type A, 100V. US two-prong plugs fit.',
    police: '110', ambulance: '119',
    weather: 'Crisp autumn days around 15-18C with maple foliage.',
    phrases: [
      { original: 'Sumimasen', phonetic: 'Soo-mee-mah-sen', english: 'Excuse me / thank you' },
      { original: 'Arigatou gozaimasu', phonetic: 'Ah-ree-gah-toh go-zah-ee-mahs', english: 'Thank you very much' },
      { original: 'Kore o kudasai', phonetic: 'Koh-reh oh koo-dah-sigh', english: 'This one please' },
      { original: 'O-kaikei o onegaishimasu', phonetic: 'Oh-kye-kay oh oh-neh-guy-she-mahs', english: 'The bill, please' }
    ],
    etiquette: ['Do not tip.', 'Silent phones on trains.', 'Remove shoes at genkan.', 'Do not walk and eat.'],
    hacks: ['7-Eleven ATMs accept foreign cards.', 'Yamato Takkyubin forwards luggage hotel-to-hotel.', 'Google Lens translates menus.']
  },
  kyoto: {
    country: 'Japan', currency: 'JPY', symbol: '¥',
    food: ['Nishiki Market snacks', 'Kaiseki near Gion', 'Matcha at Tsujiri', 'Tofu in Arashiyama'],
    sights: ['Fushimi Inari early morning', 'Kiyomizu-dera', 'Gion lantern alleys', 'Philosopher Path'],
    transit: 'Kyoto City Bus day pass plus JR from Kyoto Station',
    plug: 'Type A, 100V.',
    police: '110', ambulance: '119',
    weather: 'Cool temple mornings, 12-17C in autumn.',
    phrases: [
      { original: 'Sumimasen', phonetic: 'Soo-mee-mah-sen', english: 'Excuse me' },
      { original: 'Arigatou', phonetic: 'Ah-ree-gah-toh', english: 'Thank you' }
    ],
    etiquette: ['Keep voice low in temples.', 'Do not photograph geiko up close.'],
    hacks: ['Bus 100/101 covers the east hills.', 'Forward bags from Tokyo before the Shinkansen.']
  },
  rome: {
    country: 'Italy', currency: 'EUR', symbol: '€',
    food: ['Cacio e pepe in Trastevere', 'Giolitti gelato', 'Supplì near Campo de Fiori', 'Espresso standing at the bar'],
    sights: ['Colosseum hypogeum', 'Pantheon', 'Trastevere sunset', 'Piazza Navona'],
    transit: 'Leonardo Express to Termini, then Metro A/B',
    plug: 'Type C/F/L, 230V.',
    police: '112', ambulance: '118',
    weather: 'Late-summer 19-26C with evening breeze.',
    phrases: [
      { original: 'Grazie mille', phonetic: 'Grah-tsee-eh meel-leh', english: 'Thank you very much' },
      { original: 'Il conto, per favore', phonetic: 'Eel kohn-toh, pehr fah-voh-reh', english: 'The check, please' },
      { original: "Dov'e il bagno?", phonetic: 'Doh-veh eel bah-nyoh?', english: 'Where is the bathroom?' }
    ],
    etiquette: ['Cappuccino only in the morning.', 'Cover shoulders in churches.', 'Coperto is normal.'],
    hacks: ['Drink from nasoni fountains.', 'Book Colosseum on CoopCulture, not resellers.']
  },
  amalfi: {
    country: 'Italy', currency: 'EUR', symbol: '€',
    food: ['Limoncello spritz', 'Seafood in Positano', 'Sfogliatella in Naples'],
    sights: ['Positano harbor', 'Amalfi cathedral', 'Capri boat loop'],
    transit: 'Travelmar ferry beats the cliff bus.',
    plug: 'Type C/F/L, 230V.',
    police: '112', ambulance: '118',
    weather: 'Warm coast, 19-26C.',
    phrases: [
      { original: 'Grazie', phonetic: 'Grah-tsee-eh', english: 'Thank you' }
    ],
    etiquette: ['Dress for churches.', 'Round up rather than tip large.'],
    hacks: ['Ferry Salerno to Amalfi is scenic and calmer than SITA buses.']
  },
  swiss: {
    country: 'Switzerland', currency: 'CHF', symbol: 'CHF',
    food: ['Raclette', 'Rivermelt fondue', 'Lake fish in Lucerne'],
    sights: ['Chapel Bridge', 'Glacier Express', 'Lake Como day hop'],
    transit: 'Swiss Travel Pass 1st class beats winter driving.',
    plug: 'Type J in CH, Type L in IT.',
    police: '117', ambulance: '144',
    weather: 'Alpine winter -2C to 5C with snow.',
    phrases: [
      { original: 'Gruezi', phonetic: 'Grew-et-see', english: 'Hello' },
      { original: 'Merci vilmal', phonetic: 'Mair-see feel-mahl', english: 'Thank you very much' }
    ],
    etiquette: ['Trains leave on the second.', 'Quiet hours after 10pm.'],
    hacks: ['Village fountains are drinkable spring water.']
  },
  paris: {
    country: 'France', currency: 'EUR', symbol: '€',
    food: ['Boulangerie breakfast', 'Wine bar in the 11th', 'Marche d Aligre'],
    sights: ['Louvre early slot', 'Sainte-Chapelle', 'Canal Saint-Martin'],
    transit: 'Navigo Easy or Metro tickets; RER to CDG.',
    plug: 'Type C/E, 230V.',
    police: '17', ambulance: '15',
    weather: 'Mild 12-20C shoulder season.',
    phrases: [
      { original: 'Bonjour', phonetic: 'Bohn-zhoor', english: 'Hello' },
      { original: "L'addition, s'il vous plait", phonetic: 'Lah-dee-syon seel voo play', english: 'The bill, please' }
    ],
    etiquette: ['Always say bonjour first.', 'Do not rush cafe tables.'],
    hacks: ['Book museum slots online. Avoid restaurants facing the tower.']
  }
};

function destKey(text: string): string {
  const t = (text || '').toLowerCase();
  if (t.includes('tokyo') || t.includes('japan') || t.includes('kyoto') || t.includes('osaka')) return t.includes('kyoto') ? 'kyoto' : 'tokyo';
  if (t.includes('rome') || t.includes('italy') || t.includes('amalfi') || t.includes('positano')) return t.includes('amalfi') || t.includes('positano') ? 'amalfi' : 'rome';
  if (t.includes('swiss') || t.includes('zurich') || t.includes('lucerne') || t.includes('como')) return 'swiss';
  if (t.includes('paris') || t.includes('france')) return 'paris';
  return 'tokyo';
}

function hintFor(text: string) {
  return DEST_HINTS[destKey(text)] || DEST_HINTS.tokyo;
}

function extractCity(text: string, fallback = 'Tokyo'): string {
  const m = text.match(/\b(?:to|in|for|near)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)/);
  if (m) return m[1];
  const known = ['Tokyo', 'Kyoto', 'Rome', 'Paris', 'Zurich', 'Amalfi', 'Positano', 'London', 'Dubai', 'Singapore', 'Barcelona'];
  const hit = known.find(c => text.toLowerCase().includes(c.toLowerCase()));
  return hit || fallback;
}

export function getMockWeather(location: string): WeatherData {
  const h = hintFor(location);
  const today = new Date();
  const daily = [1, 2, 3].map(i => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      maxTemp: 18 + (i % 3),
      minTemp: 11 + (i % 2),
      weatherCode: i === 2 ? 61 : 1
    };
  });
  return {
    location: `${extractCity(location)}, ${h.country}`,
    currentTemp: 16,
    currentWeatherCode: 1,
    daily
  };
}

export function generatePackingItems(input: { destination: string; durationDays?: number; travelStyle?: string; month?: string }): PackingItem[] {
  const days = input.durationDays || 5;
  const style = (input.travelStyle || '').toLowerCase();
  const month = (input.month || '').toLowerCase();
  const cold = /dec|jan|feb|nov|winter/.test(month) || /swiss|alps|iceland|oslo/.test((input.destination || '').toLowerCase());
  const items: PackingItem[] = [
    { id: `pack-local-1`, name: 'Passport & entry QR / visa printout', category: 'Documents', essential: true, quantity: 1, packed: false },
    { id: `pack-local-2`, name: 'Universal power adapter', category: 'Electronics', essential: true, quantity: 1, packed: false },
    { id: `pack-local-3`, name: '10,000mAh power bank', category: 'Electronics', essential: true, quantity: 1, packed: false },
    { id: `pack-local-4`, name: 'Walking shoes', category: 'Footwear', essential: true, quantity: 1, packed: false },
    { id: `pack-local-5`, name: 'Packable rain layer', category: 'Clothing', essential: true, quantity: 1, packed: false },
    { id: `pack-local-6`, name: 'Daily outfits', category: 'Clothing', essential: true, quantity: Math.min(days, 7), packed: false },
    { id: `pack-local-7`, name: 'Personal medication & mini first-aid', category: 'Toiletries', essential: true, quantity: 1, packed: false },
    { id: `pack-local-8`, name: 'Small daypack', category: 'Accessories', essential: false, quantity: 1, packed: false }
  ];
  if (cold) {
    items.push({ id: `pack-local-9`, name: 'Merino base layers', category: 'Clothing', essential: true, quantity: 2, packed: false });
    items.push({ id: `pack-local-10`, name: 'Waterproof winter boots', category: 'Footwear', essential: true, quantity: 1, packed: false });
  }
  if (style.includes('food')) {
    items.push({ id: `pack-local-11`, name: 'Compact coin pouch for markets', category: 'Accessories', essential: false, quantity: 1, packed: false });
  }
  if (/japan|tokyo|kyoto/.test((input.destination || '').toLowerCase())) {
    items.push({ id: `pack-local-12`, name: 'Hand towel (many restrooms lack dryers)', category: 'Toiletries', essential: true, quantity: 2, packed: false });
  }
  return items;
}

export function generateCulturalInsights(destination: string, country?: string): CulturalInsight {
  const h = hintFor(`${destination} ${country || ''}`);
  return {
    emergencyNumbers: { police: h.police, ambulance: h.ambulance, general: '112' },
    etiquette: h.etiquette,
    phrases: h.phrases,
    localHacks: h.hacks,
    powerPlugInfo: h.plug,
    tippingCulture: /japan|tokyo|kyoto/.test((destination || '').toLowerCase()) ? 'Zero tipping. Service is included.' : 'Service often included; modest rounding up is enough.',
    weatherSummary: h.weather
  };
}

function flightsToJson(flights: Flight[]): string {
  return JSON.stringify(flights.map(f => ({
    type: 'flight',
    airline: f.airline,
    flightNumber: f.flightNumber,
    departure: f.departureTime,
    arrival: f.arrivalTime,
    duration: f.duration,
    price: f.price,
    stops: f.stops === 0 ? 'Non-stop' : `${f.stops} Stop`,
    tags: f.stops === 0 ? ['Direct', 'Meal Included'] : ['1 Stop', 'Self-transfer buffer']
  })), null, 2);
}

function hotelsToJson(hotels: Hotel[]): string {
  return JSON.stringify(hotels.map(h => ({
    type: 'hotel',
    name: h.name,
    stars: h.stars,
    rating: h.rating,
    price: h.pricePerNight || h.price || 0,
    address: h.address || h.city,
    amenities: h.amenities || ['Wifi', 'Breakfast'],
    description: `Well-reviewed stay in ${h.city || 'the city center'}.`
  })), null, 2);
}

function conflictBlock(title: string, description: string, question: string, aLabel: string, aPrompt: string, bLabel: string, bPrompt: string): string {
  return '```json\n' + JSON.stringify([{
    type: 'conflict_choice',
    conflictTitle: title,
    conflictDescription: description,
    question,
    options: [
      { id: 'opt_a', label: aLabel, badge: 'Path A', detail: aLabel, prompt: aPrompt },
      { id: 'opt_b', label: bLabel, badge: 'Path B', detail: bLabel, prompt: bPrompt }
    ]
  }], null, 2) + '\n```';
}

export function localConciergeReply(message: string, trip?: Partial<Trip> | null, profile?: UserProfile | null): { text: string; weather?: WeatherData } {
  const text = (message || '').trim();
  const lower = text.toLowerCase();
  const dest = trip?.destination || extractCity(text);
  const h = hintFor(`${dest} ${trip?.country || ''}`);
  const dates = trip?.dates || 'your travel window';
  const cabin = trip?.cabinPreference || profile?.preferences?.cabinClass || 'business';

  if (/weather|forecast|rain|temperature/.test(lower)) {
    const weather = getMockWeather(dest);
    return {
      weather,
      text: `**Weather snapshot for ${weather.location}**\n\nNow about **${weather.currentTemp}C**. ${h.weather}\n\nPack a light layer and a compact umbrella. Next 3 days stay touring-friendly.`
    };
  }

  if (/flight|airline|award|seats\.aero|hacker fare|split-ticket|kiwi|kayak/.test(lower)) {
    const origin = (text.match(/\bfrom\s+([A-Za-z ]{3,20})/i)?.[1] || 'Delhi').trim();
    const flights = searchFlightsMock(origin, dest, trip?.startDate || '2026-11-01');
    const extra = /hacker|split|virtual|hidden/.test(lower)
      ? `\n\n**Hacker fare note:** A self-transfer via a hub (DXB/DOH/IST) with a 3.5h+ buffer often undercuts the round-trip by 20-35%. Carry-on only if you try hidden-city.`
      : '';
    return {
      text: `Here are **${cabin}** options toward **${dest}** around ${dates}. Prices are simulated locally so search still works without live airline APIs.\n\n\`\`\`json\n${flightsToJson(flights)}\n\`\`\`${extra}\n\n[Compare on Google Flights](https://www.google.com/travel/flights)\n\n**Points path:** 50-70k partner points plus taxes often beats cash if CPP > 2.0¢.`
    };
  }

  if (/hotel|stay|ryokan|marriott|hilton|accor/.test(lower)) {
    const hotels = searchHotelsMock(dest, 4, 8.0, 'price_asc');
    return {
      text: `Hotel shortlist for **${dest}** (${trip?.hotelPreference || '4-star boutique'}):\n\n\`\`\`json\n${hotelsToJson(hotels)}\n\`\`\`\n\nRedeem Marriott/Accor if CPP is above 2.0¢; otherwise keep points and pay cash on a flexible rate.`
    };
  }

  if (/pack|luggage|what to bring|climate/.test(lower)) {
    const items = generatePackingItems({ destination: dest, durationDays: trip?.durationDays, travelStyle: trip?.travelStyle, month: trip?.startDate });
    const list = items.map(i => `- ${i.essential ? '**Essential**' : 'Optional'}: ${i.name} (x${i.quantity})`).join('\n');
    return { text: `**Packing list for ${dest}** (${trip?.durationDays || 5} days)\n\n${list}\n\n${h.plug}` };
  }

  if (/dinner|food|eat|restaurant|cafe|ramen|omakase/.test(lower)) {
    return {
      text: `**Local food plan for ${dest}**\n\n${h.food.map((f, i) => `${i + 1}. **${f}**`).join('\n')}\n\nTransit: ${h.transit}\n\nAsk the hotel where staff eat on their day off — that usually beats tourist rows.`
    };
  }

  if (/etiquette|culture|phrase|emergency|tipping|plug/.test(lower)) {
    const c = generateCulturalInsights(dest, trip?.country);
    return {
      text: `**Culture & safety — ${dest}**\n\n- Police: **${c.emergencyNumbers.police}** · Ambulance: **${c.emergencyNumbers.ambulance}**\n- Plug: ${c.powerPlugInfo}\n- Tipping: ${c.tippingCulture}\n\n**Etiquette**\n${c.etiquette.map(e => `- ${e}`).join('\n')}\n\n**Phrases**\n${c.phrases.map(p => `- **${p.original}** (${p.phonetic}) — ${p.english}`).join('\n')}`
    };
  }

  if (/point|amex|marriott|cpp|redeem|loyalty|awardwallet/.test(lower)) {
    return {
      text: `**Points playbook**\n\n1. Transfer Amex MR only when CPP **> 2.0¢**.\n2. Long-haul ${cabin} awards beat cash more often than hotel nights.\n3. Keep a cash backup fare in case award space disappears.\n\nPaste an AwardWallet screenshot or confirmation into Travel Brain — the on-device parser tags PNR, hotel, and balances without a third-party API.`
    };
  }

  if (/day 2|optimize|itinerary|audit|schedule/.test(lower)) {
    const day = trip?.itinerary?.[1] || trip?.itinerary?.[0];
    return {
      text: `**Itinerary tune-up for ${dest}**\n\n${day ? `Focus of Day ${day.dayNumber}: **${day.theme || day.title}**.` : 'Cluster sights by neighborhood so you are not crossing the city twice.'}\n\n- Start the farthest landmark first.\n- Book one sit-down meal, keep the other flexible.\n- Leave a 90-minute buffer before any timed entry.\n\n` + conflictBlock(
        'Pace conflict',
        'A packed highlight reel vs a slower neighborhood day.',
        'How should we pace this day?',
        'Fast-paced coverage',
        'I prefer the Fast-Paced option. Pack more highlights.',
        'Relaxed immersive',
        'I prefer the Relaxed option. Keep 2-3 deep stops.'
      )
    };
  }

  if (/conflict|trade-off|pace|budget vs|luxury vs/.test(lower) || /prefer the/.test(lower)) {
    if (/fast-paced|see everything/.test(lower)) {
      return { text: `Locked **fast-paced** for ${dest}. Early starts, 4-5 stops, pre-booked tickets, and a late dinner reservation so you are not hunting food after close.` };
    }
    if (/relax|immersive|leisure/.test(lower)) {
      return { text: `Locked **relaxed** for ${dest}. Two hero sights, a long lunch, and an unhurried evening walk. Quality over coverage.` };
    }
    return {
      text: `There is a real trade-off on this trip.\n\n` + conflictBlock(
        'Budget vs comfort',
        'Cash saver fares vs points-funded premium cabins.',
        'Which path should we optimize?',
        'Preserve points, pay cash',
        'I prefer paying cash and saving points for peak holidays.',
        'Burn points for comfort',
        'I prefer redeeming points for premium cabins if CPP is above 2.0.'
      )
    };
  }

  if (/import|paste|sync|how should i paste/.test(lower)) {
    return {
      text: `**No API needed.** Copy from AwardWallet, an airline email, or Seats.aero and paste into **Travel Brain**.\n\nInclude:\n- Program + balance\n- PNR / hotel confirmation\n- Cabin and dates\n\nThe local parser tags bookings, flags deadlines, and can drop a stop onto a day.`
    };
  }

  return {
    text: `I am running in **on-device mode** (no live Gemini key required).\n\n**${dest}** · ${dates} · ${trip?.travellers || '2 adults'} · ${cabin}\n\nTry:\n- Flight or hotel search\n- Dinner spots and transit\n- Packing / culture / weather\n- Points CPP and itinerary audit\n\nLocal highlights: ${h.sights.slice(0, 3).join(' · ')}\n\n${h.weather}`
  };
}

export function localChatResponse(prompt: string, profile?: UserProfile | null): { text: string; weather?: WeatherData; sources: { title: string; uri: string }[] } {
  const tripMatch = prompt.match(/Active trip is "([^"]+)"/);
  const dest = tripMatch?.[1];
  const reply = localConciergeReply(prompt.replace(/\[Context:.*?\]\s*/s, ''), dest ? { destination: dest } : null, profile);
  return {
    text: reply.text,
    weather: reply.weather,
    sources: [
      { title: 'On-device travel intelligence', uri: 'https://www.google.com/travel' }
    ]
  };
}

export function suggestedActivitiesFromNote(note: string, destination: string): Activity[] {
  const lower = note.toLowerCase();
  const acts: Activity[] = [];
  if (/flight|arrive|haneda|narita|airport/.test(lower)) {
    acts.push({
      id: `act-note-${Date.now()}`,
      title: 'Airport arrival & hotel check-in',
      time: '02:30 PM',
      category: 'transit',
      location: destination,
      description: 'Transfer from airport, grab local transit card, drop bags.',
      cost: 15,
      estimatedCost: 15,
      durationMinutes: 90,
      insiderTip: 'Load a transit card before landing when possible.',
      completed: false
    });
  }
  if (/ramen|dinner|food|restaurant|sake|omakase/.test(lower)) {
    acts.push({
      id: `act-note-food-${Date.now()}`,
      title: 'Local food stop from your note',
      time: '07:00 PM',
      category: 'food',
      location: destination,
      description: note.slice(0, 140),
      cost: 40,
      estimatedCost: 40,
      durationMinutes: 90,
      insiderTip: 'Arrive 15 minutes early for no-reservation counters.',
      completed: false
    });
  }
  if (/temple|museum|sky|view|shrine|colosseum/.test(lower)) {
    acts.push({
      id: `act-note-sight-${Date.now()}`,
      title: 'Timed sightseeing from your note',
      time: '04:00 PM',
      category: 'culture',
      location: destination,
      description: note.slice(0, 140),
      cost: 25,
      estimatedCost: 25,
      durationMinutes: 90,
      insiderTip: 'Book timed entry in advance when it is a sunset slot.',
      completed: false
    });
  }
  return acts;
}

export function hasGeminiKey(): boolean {
  const key = (typeof process !== 'undefined' && (process.env.API_KEY || process.env.GEMINI_API_KEY)) || '';
  return Boolean(key && key !== 'undefined' && key !== 'MY_GEMINI_API_KEY');
}
