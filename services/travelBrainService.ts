import { GoogleGenAI } from '@google/genai';
import { 
  Trip, 
  TravelOSState, 
  Strategy, 
  ResearchEntry, 
  ItineraryDay, 
  PackingItem, 
  Expense, 
  BrainNote, 
  CulturalInsight, 
  LoyaltyAccount,
  ConflictChoiceData
} from '../types';

// Helper to get Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (typeof process !== 'undefined' && (process.env.API_KEY || process.env.GEMINI_API_KEY)) || '';
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Could not initialize GoogleGenAI client", e);
    return null;
  }
}

// Initial default rich trips so the user starts with complete, realistic data
export const INITIAL_LOYALTY: LoyaltyAccount[] = [
  { program: "Marriott Bonvoy", balance: 145000, color: "bg-amber-500", membershipId: "MB-8829103" },
  { program: "Amex Membership Rewards", balance: 420000, color: "bg-blue-500", membershipId: "AX-449102" },
  { program: "Air India Flying Returns", balance: 68000, color: "bg-red-500", membershipId: "AI-109283" },
  { program: "Accor Live Limitless", balance: 18500, color: "bg-yellow-600", membershipId: "ALL-77192" }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: "trip-tokyo-2026",
    destination: "Tokyo & Kyoto",
    country: "Japan",
    dates: "Nov 01 - Nov 08, 2026",
    startDate: "2026-11-01",
    endDate: "2026-11-08",
    durationDays: 7,
    heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80",
    travelStyle: "foodie",
    pace: "moderate",
    totalBudget: 4200,
    currency: "USD",
    currencySymbol: "$",
    status: "planning",
    travellers: "2 Adults",
    cabinPreference: "Premium Economy",
    hotelPreference: "4-Star Boutique",
    decisionLog: [
      "User prioritizes direct overnight flights to maximize day 1 exploration.",
      "Prefer high CPP redemptions (>2.2¢) for Marriott Bonvoy in Ginza and Kyoto.",
      "Strict preference for authentic omakase reservations booked 60 days in advance.",
      "Avoid Boeing 737 Max; prefer Airbus A350 or Boeing 787 Dreamliner."
    ],
    researchInbox: [
      {
        id: "res-1",
        category: "flight",
        provider: "ANA (All Nippon Airways)",
        price: 1350,
        points_price: 65000,
        cpp: 2.07,
        title: "NH111 • A350-1000 Non-Stop Premium Economy",
        metadata: { departure: "23:45", arrival: "05:15 (+1)" }
      },
      {
        id: "res-2",
        category: "hotel",
        provider: "The Tokyo Edition, Ginza",
        price: 680,
        points_price: 28000,
        cpp: 2.43,
        title: "Marriott Luxury Collection • 3 Nights in Central Ginza",
        metadata: { rating: 9.4, stars: 5 }
      },
      {
        id: "res-3",
        category: "points",
        provider: "Amex MR Transfer Bonus",
        price: 0,
        points_price: 80000,
        cpp: 2.65,
        title: "1:1.3 Transfer Bonus to Virgin Atlantic for ANA Suite",
        metadata: { expires: "End of month" }
      }
    ],
    strategies: [
      {
        type: "balanced",
        title: "The Hybrid Connoisseur (Recommended)",
        total_cash: 1850,
        total_points: 93000,
        rationale: "Redeem 65k Amex points for ANA Premium Economy (2.07¢ CPP) and 28k Marriott points in Ginza. Pay cash for Shinkansen green car and artisan food.",
        flightChoice: "ANA A350-1000 via Amex MR",
        hotelChoice: "The Tokyo Edition, Ginza"
      },
      {
        type: "points",
        title: "Maximum Points Arbitrage",
        total_cash: 420,
        total_points: 155000,
        rationale: "Burn 155k points across Amex MR and Marriott Bonvoy yielding an exceptional 2.48¢ average valuation with near-zero out-of-pocket cash.",
        flightChoice: "Virgin Atlantic Suite Award",
        hotelChoice: "The Ritz-Carlton Kyoto Points Redemption"
      },
      {
        type: "value",
        title: "Smart Cash & Rail Pass Optimization",
        total_cash: 2350,
        total_points: 0,
        rationale: "Save your point balances for peak holiday travels; book discounted cash airfares on Zipair Full-Lie-Flat and boutique Ryokans.",
        flightChoice: "Zipair Lie-Flat Business Saver",
        hotelChoice: "Hotel The Celestine Ginza"
      },
      {
        type: "premium",
        title: "Ultra-Luxury First Class & Onsen Suites",
        total_cash: 5600,
        total_points: 45000,
        rationale: "First Class cabin on Japan Airlines with private open-air hot spring Ryokan in Arashiyama, supplemented with Marriott Suite Night Awards.",
        flightChoice: "JAL A350 First Class Suite",
        hotelChoice: "Suiran, Luxury Collection Hotel Kyoto"
      }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: "Nov 01, 2026",
        theme: "Arrival & Neon Ginza Immersion",
        notes: "Pick up Suica card / pocket Wi-Fi at Haneda Terminal 3.",
        activities: [
          {
            id: "act-101",
            title: "Haneda Monorail to Ginza Check-in",
            time: "07:30 AM",
            category: "transit",
            location: "Haneda Airport → The Tokyo Edition",
            description: "Seamless 25-minute transit via Tokyo Monorail and Yamanote Line. Drop bags early.",
            cost: 8,
            durationMinutes: 45,
            insiderTip: "Add digital Suica directly to your Apple/Google Wallet before landing to tap through gates.",
            completed: true
          },
          {
            id: "act-102",
            title: "Tsukiji Outer Market Culinary Walk",
            time: "09:30 AM",
            category: "food",
            location: "Tsukiji Outer Market",
            description: "Sample fresh wagyu skewers, tamagoyaki omelet, and fresh sea urchin donburi.",
            cost: 35,
            durationMinutes: 90,
            insiderTip: "Look for Yamacho for warm rolled dashi tamagoyaki made fresh on iron pans.",
            completed: true
          },
          {
            id: "act-103",
            title: "TeamLab Planets Immersive Art Experience",
            time: "02:00 PM",
            category: "culture",
            location: "Toyosu, Tokyo",
            description: "Walk barefoot through crystal light gardens and knee-deep mirror water pools.",
            cost: 28,
            durationMinutes: 120,
            insiderTip: "Wear pants that can easily roll above your knees as you will wade through warm water.",
            completed: false
          },
          {
            id: "act-104",
            title: "Bar High Five Cocktails & Omakase",
            time: "07:30 PM",
            category: "food",
            location: "Ginza, Chuo City",
            description: "Legendary bartender Hidetsugu Ueno creates custom cocktail profiles without menus.",
            cost: 95,
            durationMinutes: 120,
            insiderTip: "No reservations; arrive at 7:15 PM sharp or ask your hotel concierge to call ahead.",
            completed: false
          }
        ]
      },
      {
        dayNumber: 2,
        date: "Nov 02, 2026",
        theme: "Historic Asakusa & Akihabara Subculture",
        notes: "Early morning to avoid temple crowds.",
        activities: [
          {
            id: "act-201",
            title: "Senso-ji Temple at Sunrise",
            time: "06:30 AM",
            category: "culture",
            location: "Asakusa, Taito City",
            description: "Tokyo's oldest Buddhist temple. Peaceful courtyards and incense burners before tour buses arrive.",
            cost: 0,
            durationMinutes: 75,
            insiderTip: "The side pagoda gardens have tranquil koi ponds with stunning morning backlighting.",
            completed: false
          },
          {
            id: "act-202",
            title: "Kappabashi Kitchenware & Knife Alley",
            time: "10:30 AM",
            category: "adventure",
            location: "Kappabashi Dougu Street",
            description: "Browse hand-forged Japanese chef knives with custom kanji engraving.",
            cost: 150,
            durationMinutes: 90,
            insiderTip: "Kama-Asa offers tax-free shopping and custom whetstone sharpening advice.",
            completed: false
          },
          {
            id: "act-203",
            title: "Retro Arcade & High-Tech Akihabara",
            time: "03:00 PM",
            category: "adventure",
            location: "Akihabara Electric Town",
            description: "Multi-floor retro game centres, retro synthesizer shops, and mechanical keyboard galleries.",
            cost: 20,
            durationMinutes: 120,
            insiderTip: "Visit Super Potato 3rd floor for playable vintage Neo Geo and Famicom classics.",
            completed: false
          }
        ]
      },
      {
        dayNumber: 3,
        date: "Nov 03, 2026",
        theme: "Bullet Train Shinkansen to Kyoto & Bamboo Groves",
        notes: "Book Mt. Fuji view seats (Right side / Seats D & E outbound).",
        activities: [
          {
            id: "act-301",
            title: "Nozomi Shinkansen to Kyoto Station",
            time: "08:00 AM",
            category: "transit",
            location: "Tokyo Station → Kyoto Station",
            description: "2 hours 15 minutes bullet train reaching 285 km/h. Enjoy an Ekiben bento box onboard.",
            cost: 110,
            durationMinutes: 140,
            insiderTip: "Window seats on the right side of the car get an unobstructed view of Mount Fuji at minute 45.",
            completed: false
          },
          {
            id: "act-302",
            title: "Arashiyama Bamboo Grove & Tenryu-ji Zen Garden",
            time: "02:00 PM",
            category: "culture",
            location: "Arashiyama, Western Kyoto",
            description: "Soaring green bamboo stalks, UNESCO World Heritage Zen rock garden, and matcha tea houses.",
            cost: 15,
            durationMinutes: 150,
            insiderTip: "Cross the Togetsukyo Bridge for chilled roasted soba noodles by the riverside.",
            completed: false
          }
        ]
      }
    ],
    packingList: [
      { id: "pack-1", name: "Comfortable Walking Slip-on Shoes", category: "Footwear", essential: true, quantity: 1, packed: true },
      { id: "pack-2", name: "Pocket Power Bank (10,000mAh)", category: "Electronics", essential: true, quantity: 1, packed: true },
      { id: "pack-3", name: "Type A / Two-Prong Plug Adapter", category: "Electronics", essential: true, quantity: 2, packed: false },
      { id: "pack-4", name: "Passport & Digital Visa / Visit Japan QR", category: "Documents", essential: true, quantity: 1, packed: true },
      { id: "pack-5", name: "Light Packable Rain Jacket", category: "Clothing", essential: true, quantity: 1, packed: false },
      { id: "pack-6", name: "Coin Pouch (for 100¥/500¥ vending coins)", category: "Accessories", essential: false, quantity: 1, packed: true },
      { id: "pack-7", name: "Small Hand Towel (many restrooms lack paper towels)", category: "Toiletries", essential: true, quantity: 2, packed: false },
      { id: "pack-8", name: "Luggage Forwarding Tags (Takkyubin)", category: "Logistics", essential: false, quantity: 1, packed: false }
    ],
    expenses: [
      { id: "exp-1", title: "ANA Premium Economy Flights (2x)", amount: 1350, category: "transit", date: "2026-11-01", notes: "Redeemed with Amex points + taxes" },
      { id: "exp-2", title: "The Tokyo Edition Ginza (Deposit)", amount: 480, category: "stay", date: "2026-11-01", notes: "Points + cash upgrade" },
      { id: "exp-3", title: "Tsukiji Market Morning Feast", amount: 62, category: "food", date: "2026-11-01", notes: "Cash only food stalls" },
      { id: "exp-4", title: "TeamLab Planets Entry Tickets", amount: 56, category: "activities", date: "2026-11-01", notes: "Pre-booked online" },
      { id: "exp-5", title: "Shinkansen Reserved Bullet Train Tickets", amount: 220, category: "transit", date: "2026-11-03", notes: "SmartEX digital ticketing" }
    ],
    brainNotes: [
      {
        id: "bn-1",
        text: "ANA flight NH111 confirmed PNR: #X7Q9P2. Baggage allowance: 2 checked bags per passenger at 23kg each.",
        type: "booking",
        tags: ["flight", "ana", "baggage"],
        createdAt: "2026-09-02"
      },
      {
        id: "bn-2",
        text: "Local foodie recommendation: Monja street in Tsukishima. Order mentaiko (spicy cod roe) monjayaki with melted mochi and cheese.",
        type: "recommendation",
        tags: ["food", "tokyo", "insider"],
        createdAt: "2026-09-02"
      }
    ],
    culturalInsights: {
      emergencyNumbers: {
        police: "110",
        ambulance: "119",
        general: "Japan Helpline: 0570-000-911"
      },
      etiquette: [
        "Never tip at restaurants or in taxis; tipping is considered awkward and inappropriate.",
        "Keep smartphones on 'Manner Mode' (silent) and avoid taking phone calls on trains.",
        "When entering traditional ryokans, homes, and temple halls, always remove shoes at the genkan step.",
        "Do not walk and eat at the same time in busy streets; consume snacks near the vendor or trash bin."
      ],
      phrases: [
        { original: "Sumimasen", phonetic: "Soo-mee-mah-sen", english: "Excuse me / I'm sorry / Thank you" },
        { original: "Arigatou gozaimasu", phonetic: "Ah-ree-gah-toh go-zah-ee-mahs", english: "Thank you very much" },
        { original: "Kore o kudasai", phonetic: "Koh-reh oh koo-dah-sigh", english: "Please give me this one" },
        { original: "O-kaikei o onegaishimasu", phonetic: "Oh-kye-kay oh oh-neh-guy-she-mahs", english: "The bill, please" }
      ],
      localHacks: [
        "Use 7-Eleven and Lawson ATM machines for zero-fee international debit card cash withdrawals.",
        "Take advantage of luggage forwarding (Yamato Transport 'Black Cat') to send heavy suitcases from Tokyo directly to your Kyoto hotel for ~$15/bag.",
        "Download Google Lens to translate Japanese restaurant menus and ingredient labels via camera in real-time."
      ],
      powerPlugInfo: "Type A / Two-pin ungrounded plugs (100V, 50/60Hz). A two-prong US-style flat plug fits directly.",
      tippingCulture: "Zero tipping culture. Hospitality (Omotenashi) is proudly included in the published price.",
      weatherSummary: "Crisp autumn weather in November. Daytime temperatures average 15°C-18°C (59°F-64°F) with low rainfall and peak crimson momiji maple foliage."
    }
  },
  {
    id: "trip-swiss-2026",
    destination: "Swiss Alps & Lake Como",
    country: "Switzerland & Italy",
    dates: "Dec 10 - Dec 16, 2026",
    startDate: "2026-12-10",
    endDate: "2026-12-16",
    durationDays: 6,
    heroImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80",
    travelStyle: "adventure",
    pace: "relaxed",
    totalBudget: 5500,
    currency: "EUR",
    currencySymbol: "€",
    status: "planning",
    travellers: "2 Adults",
    cabinPreference: "Business Class",
    hotelPreference: "Alpine Chalet & Lakeside Villa",
    decisionLog: [
      "Opted for Swiss Travel Pass 1st Class over renting a car due to winter mountain driving.",
      "Redeemed Marriott Bonvoy points at Grand Hotel Victoria Concept & Spa in Lake Como."
    ],
    researchInbox: [
      {
        id: "res-swiss-1",
        category: "flight",
        provider: "SWISS International Air Lines",
        price: 1850,
        points_price: 70000,
        cpp: 2.64,
        title: "LX18 • B777-300ER Business Class to Zurich",
        metadata: { cabin: "Business Class" }
      }
    ],
    strategies: [
      {
        type: "balanced",
        title: "Glacier Express & Villa Splurge (Recommended)",
        total_cash: 2400,
        total_points: 70000,
        rationale: "Use 70k points for Swiss Business Class, saving €1,850 in cash. Pay cash for 1st Class Panoramic Glacier Express and lake cruisers.",
        flightChoice: "SWISS B777 Business Class via Points",
        hotelChoice: "The Chedi Andermatt & Lake Como Villa"
      },
      {
        type: "points",
        title: "All-Points Luxury Escape",
        total_cash: 650,
        total_points: 180000,
        rationale: "Zero-out lodging and flights using Marriott Bonvoy and Amex transfer partners for peak festive winter season.",
        flightChoice: "Lufthansa / SWISS Business",
        hotelChoice: "St. Moritz Luxury Collection Resort"
      }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: "Dec 10, 2026",
        theme: "Zurich Arrival & Lucerne Lakeside Walk",
        activities: [
          {
            id: "act-sw-1",
            title: "Scenic Train to Lucerne & Chapel Bridge",
            time: "10:00 AM",
            category: "culture",
            location: "Lucerne, Switzerland",
            description: "Historic wooden covered bridge from the 14th century, lake promenade, and lion monument.",
            cost: 0,
            durationMinutes: 90,
            completed: false
          }
        ]
      }
    ],
    packingList: [
      { id: "pack-sw-1", name: "Thermal Merino Wool Base Layers", category: "Clothing", essential: true, quantity: 2, packed: false },
      { id: "pack-sw-2", name: "Waterproof Winter Hiking Boots", category: "Footwear", essential: true, quantity: 1, packed: false }
    ],
    expenses: [
      { id: "exp-sw-1", title: "Swiss Travel Pass 1st Class 4-Day", amount: 480, category: "transit", date: "2026-12-10" }
    ],
    brainNotes: [],
    culturalInsights: {
      emergencyNumbers: { police: "117", ambulance: "144", general: "112" },
      etiquette: ["Punctuality is sacred for train departures down to the exact second.", "Keep quiet hours in trains and chalets after 10 PM."],
      phrases: [
        { original: "Grüezi", phonetic: "Grew-et-see", english: "Hello (Swiss German)" },
        { original: "Merci vilmal", phonetic: "Mair-see feel-mahl", english: "Thank you very much" }
      ],
      localHacks: ["Swiss Tap water flowing from village fountains is fresh, filtered mountain spring water — drink directly!"],
      powerPlugInfo: "Type J (Switzerland) and Type L (Italy). Carry a universal adapter.",
      tippingCulture: "Service is included by law; rounding up to the nearest 5 or 10 francs is common.",
      weatherSummary: "Winter alpine conditions: -2°C to 5°C with fresh snowfall across mountain passes."
    }
  }
];

// High-performance intelligent Trip Generator
export async function generateFullTripWithAI(formData: {
  destination: string;
  days: string | number;
  startDate?: string;
  travelStyle?: string;
  pace?: string;
  budget?: string | number;
  currency?: string;
  currencySymbol?: string;
  companions?: string;
  cabin?: string;
  hotel?: string;
  loyaltyAccounts?: LoyaltyAccount[];
}): Promise<Trip> {
  const duration = parseInt(String(formData.days), 10) || 5;
  const destination = formData.destination.trim();
  const travelStyle = (formData.travelStyle || 'foodie') as any;
  const pace = (formData.pace || 'moderate') as any;
  const budgetNum = parseInt(String(formData.budget), 10) || 2500;
  const currency = formData.currency || 'USD';
  const currencySymbol = formData.currencySymbol || '$';
  const startDate = formData.startDate || new Date().toISOString().slice(0, 10);
  
  // Calculate end date
  const sDate = new Date(startDate);
  sDate.setDate(sDate.getDate() + duration);
  const endDate = sDate.toISOString().slice(0, 10);
  const dates = `${startDate} - ${endDate}`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are the master travel planner and loyalty strategist for Voyager TravelOS.
Create a comprehensive, deeply realistic travel plan for:
Destination: ${destination}
Duration: ${duration} days
Start Date: ${startDate}
Pace: ${pace}
Style: ${travelStyle}
Budget: ${currencySymbol}${budgetNum} ${currency}
Travelers: ${formData.companions || '2 Adults'}
Flight Cabin: ${formData.cabin || 'Economy'}
Hotel Tier: ${formData.hotel || '4-Star Boutique'}

Return ONLY a valid JSON object matching this schema:
{
  "country": "Country Name",
  "heroImage": "Valid Unsplash photo URL matching destination",
  "decisionLog": ["Key strategic trade-off 1", "Loyalty preference 2", "Booking timing recommendation 3"],
  "researchInbox": [
    {
      "id": "res-ai-1",
      "category": "flight",
      "provider": "Airline name",
      "price": 850,
      "points_price": 45000,
      "cpp": 1.89,
      "title": "Flight route and aircraft type",
      "metadata": { "departure": "10:00", "arrival": "14:00" }
    },
    {
      "id": "res-ai-2",
      "category": "hotel",
      "provider": "Hotel Chain",
      "price": 350,
      "points_price": 18000,
      "cpp": 1.94,
      "title": "Hotel name and location"
    }
  ],
  "strategies": [
    {
      "type": "balanced",
      "title": "Balanced Recommended Strategy",
      "total_cash": 1200,
      "total_points": 45000,
      "rationale": "Sentence 1 is what. Sentence 2 is why."
    },
    {
      "type": "points",
      "title": "Best Points Maximizer",
      "total_cash": 300,
      "total_points": 95000,
      "rationale": "Sentence 1 is what. Sentence 2 is why."
    },
    {
      "type": "value",
      "title": "Cash Saver Optimization",
      "total_cash": 1800,
      "total_points": 0,
      "rationale": "Sentence 1 is what. Sentence 2 is why."
    },
    {
      "type": "premium",
      "title": "Luxury VIP Experience",
      "total_cash": 3500,
      "total_points": 30000,
      "rationale": "Sentence 1 is what. Sentence 2 is why."
    }
  ],
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "theme": "Theme of day 1",
      "notes": "Practical day note",
      "activities": [
        {
          "id": "act-ai-101",
          "title": "Specific activity name",
          "time": "09:00 AM",
          "category": "culture",
          "location": "Exact landmark / district",
          "description": "Engaging 1-2 sentence description",
          "cost": 25,
          "durationMinutes": 90,
          "insiderTip": "Specific insider local tip",
          "completed": false
        }
      ]
    }
  ],
  "packingList": [
    { "id": "pack-ai-1", "name": "Specific item", "category": "Clothing", "essential": true, "quantity": 1, "packed": false }
  ],
  "culturalInsights": {
    "emergencyNumbers": { "police": "112", "ambulance": "112", "general": "112" },
    "etiquette": ["Important custom 1", "Custom 2", "Custom 3"],
    "phrases": [
      { "original": "Hello", "phonetic": "Pronunciation", "english": "Hello" }
    ],
    "localHacks": ["Lifehack 1", "Lifehack 2"],
    "powerPlugInfo": "Plug type and voltage",
    "tippingCulture": "Local tipping rule",
    "weatherSummary": "Typical seasonal forecast"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.itinerary && parsed.itinerary.length > 0) {
        return {
          id: `trip-${Date.now()}`,
          destination,
          country: parsed.country || "Global",
          dates,
          startDate,
          endDate,
          durationDays: duration,
          heroImage: parsed.heroImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
          travelStyle,
          pace,
          totalBudget: budgetNum,
          currency,
          currencySymbol,
          status: 'planning',
          travellers: formData.companions || "2 Adults",
          cabinPreference: formData.cabin || "Economy",
          hotelPreference: formData.hotel || "4-Star Boutique",
          decisionLog: parsed.decisionLog || [
            `Planned for ${duration} days with ${pace} pace.`,
            `Prioritize high CPP value on points redemptions.`
          ],
          researchInbox: parsed.researchInbox || [],
          strategies: parsed.strategies || [],
          itinerary: parsed.itinerary || [],
          packingList: parsed.packingList || [],
          expenses: [
            {
              id: `exp-init-1`,
              title: "Estimated Initial Flights / Booking",
              amount: Math.round(budgetNum * 0.35),
              category: "transit",
              date: startDate,
              notes: "Initial flight reservation"
            }
          ],
          brainNotes: [],
          culturalInsights: parsed.culturalInsights
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed, generating deterministic smart plan", err);
    }
  }

  // Fallback high-quality structured generator
  const generatedDays: ItineraryDay[] = [];
  for (let i = 1; i <= duration; i++) {
    const curDate = new Date(sDate);
    curDate.setDate(curDate.getDate() + (i - 1));
    const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    generatedDays.push({
      dayNumber: i,
      date: dateStr,
      theme: i === 1 ? `Arrival & Landmark Immersion` : i === duration ? `Farewell Highlights & Souvenirs` : `Day ${i} Discovery & Local Flavors`,
      notes: `Keep digital tickets and offline maps ready.`,
      activities: [
        {
          id: `act-gen-${i}-1`,
          title: i === 1 ? `Scenic Check-in & Neighborhood Stroll` : `Historic Heart & Cultural Walk`,
          time: "09:30 AM",
          category: "culture",
          location: `${destination} Central`,
          description: `Experience the iconic architectural and historic landmarks of ${destination}.`,
          cost: 15,
          durationMinutes: 90,
          insiderTip: "Early mornings have half the crowds and optimal sunlight for photography.",
          completed: false
        },
        {
          id: `act-gen-${i}-2`,
          title: `Artisanal Lunch & Specialty Food Market`,
          time: "01:00 PM",
          category: "food",
          location: `Old Town District, ${destination}`,
          description: `Taste celebrated local culinary delicacies and seasonal specialties.`,
          cost: 30,
          durationMinutes: 75,
          insiderTip: "Look for stalls with lines of local office workers.",
          completed: false
        },
        {
          id: `act-gen-${i}-3`,
          title: `Panoramic Sunset & Evening Atmosphere`,
          time: "05:30 PM",
          category: "chill",
          location: `Riverside / Skyline Lookout`,
          description: `Watch the sunset over ${destination} before enjoying dinner.`,
          cost: 20,
          durationMinutes: 120,
          insiderTip: "Reserve a table by the window or terrace 2 days in advance.",
          completed: false
        }
      ]
    });
  }

  return {
    id: `trip-${Date.now()}`,
    destination,
    country: "International",
    dates,
    startDate,
    endDate,
    durationDays: duration,
    heroImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
    travelStyle,
    pace,
    totalBudget: budgetNum,
    currency,
    currencySymbol,
    status: 'planning',
    travellers: formData.companions || "2 Adults",
    cabinPreference: formData.cabin || "Economy",
    hotelPreference: formData.hotel || "4-Star Boutique",
    decisionLog: [
      `Itinerary mapped for ${duration} days in ${destination}.`,
      `Pace calibrated to ${pace}; style set to ${travelStyle}.`
    ],
    researchInbox: [
      {
        id: `res-gen-1`,
        category: "flight",
        provider: "Flagship Carrier",
        price: Math.round(budgetNum * 0.4),
        points_price: 50000,
        cpp: 2.1,
        title: `Direct to ${destination}`,
        metadata: { departure: "08:30", arrival: "14:15" }
      },
      {
        id: `res-gen-2`,
        category: "hotel",
        provider: "Boutique Heritage Hotel",
        price: Math.round(budgetNum * 0.25),
        points_price: 25000,
        cpp: 2.35,
        title: `Central stay in ${destination}`
      }
    ],
    strategies: [
      {
        type: "balanced",
        title: "Optimized Points & Cash Hybrid (Recommended)",
        total_cash: Math.round(budgetNum * 0.55),
        total_points: 50000,
        rationale: `Redeem 50k points for flights yielding >2.1¢ CPP. Preserve liquid cash for gourmet dining and local guides.`,
        flightChoice: "Award flight redemption",
        hotelChoice: "Boutique central stay"
      },
      {
        type: "points",
        title: "Full Loyalty Arbitrage",
        total_cash: Math.round(budgetNum * 0.15),
        total_points: 95000,
        rationale: `Maximize points coverage across hotels and airline transfers with near zero cash out-of-pocket.`
      },
      {
        type: "value",
        title: "Cash Saver Saver Rate",
        total_cash: Math.round(budgetNum * 0.8),
        total_points: 0,
        rationale: `Bank your points for peak holiday season; pay cash for discounted shoulder-season fares.`
      }
    ],
    itinerary: generatedDays,
    packingList: [
      { id: "pack-g-1", name: "Passport & Entry Documents", category: "Documents", essential: true, quantity: 1, packed: true },
      { id: "pack-g-2", name: "Universal Power Adapter", category: "Electronics", essential: true, quantity: 1, packed: false },
      { id: "pack-g-3", name: "High-Capacity Portable Charger", category: "Electronics", essential: true, quantity: 1, packed: true },
      { id: "pack-g-4", name: "Walking Shoes / Sneakers", category: "Footwear", essential: true, quantity: 1, packed: false },
      { id: "pack-g-5", name: "Weather Layer / Packable Jacket", category: "Clothing", essential: true, quantity: 1, packed: false },
      { id: "pack-g-6", name: "Basic First-Aid & Personal Medication", category: "Toiletries", essential: true, quantity: 1, packed: false }
    ],
    expenses: [
      {
        id: `exp-g-1`,
        title: "Flights / Main Transport",
        amount: Math.round(budgetNum * 0.35),
        category: "transit",
        date: startDate,
        notes: "Round trip reservation"
      },
      {
        id: `exp-g-2`,
        title: "Hotel / Lodging Deposit",
        amount: Math.round(budgetNum * 0.28),
        category: "stay",
        date: startDate,
        notes: "Central boutique hotel"
      }
    ],
    brainNotes: [],
    culturalInsights: {
      emergencyNumbers: { police: "112 / 911", ambulance: "112 / 911", general: "112" },
      etiquette: [
        "Learn basic pleasantries in the local language.",
        "Dress respectfully when visiting sacred monuments or religious sites.",
        "Always keep a digital backup of travel documents."
      ],
      phrases: [
        { original: "Hello", phonetic: "Hello", english: "Hello" },
        { original: "Thank you", phonetic: "Thank you", english: "Thank you" },
        { original: "Please", phonetic: "Please", english: "Please" },
        { original: "Check please", phonetic: "Check please", english: "Check please" }
      ],
      localHacks: [
        "Download offline maps on Google Maps before heading out.",
        "Ask hotel concierges where they personally eat on their days off."
      ],
      powerPlugInfo: "Universal adapter recommended.",
      tippingCulture: "Check local guidelines; typically 5-10% or modest rounding up.",
      weatherSummary: "Mild seasonal climate with pleasant touring weather."
    }
  };
}

// Synthesizer for unstructured Brain Notes
export async function synthesizeBrainNoteAI(noteText: string, tripContext: { destination: string; durationDays: number }): Promise<{
  summary: string;
  extractedTags: string[];
  detectedType: 'booking' | 'recommendation' | 'scratchpad' | 'link';
  alerts?: string[];
}> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this travel note for a trip to ${tripContext.destination}:
"${noteText}"

Return JSON:
{
  "summary": "1 sentence crisp executive summary",
  "extractedTags": ["tag1", "tag2"],
  "detectedType": "booking" | "recommendation" | "scratchpad" | "link",
  "alerts": ["Any key deadline, confirmation number, or passport requirement detected"]
}`,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.warn("AI synthesis failed", e);
    }
  }

  // Fallback
  const lower = noteText.toLowerCase();
  const isBooking = lower.includes('flight') || lower.includes('hotel') || lower.includes('pnr') || lower.includes('conf') || lower.includes('booking');
  const isLink = noteText.includes('http://') || noteText.includes('https://');

  return {
    summary: noteText.length > 80 ? noteText.substring(0, 80) + '...' : noteText,
    extractedTags: [isBooking ? 'booking' : 'note', tripContext.destination.toLowerCase().replace(/\s+/g, '-')],
    detectedType: isBooking ? 'booking' : isLink ? 'link' : 'recommendation',
    alerts: isBooking ? ["Booking reference detected — saved to trip dossier."] : []
  };
}

// Financial expense audit & savings hacks
export async function auditTripExpensesAI(trip: Trip): Promise<{
  auditScore: string;
  summaryText: string;
  savingHacks: string[];
}> {
  const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const budget = trip.totalBudget || 1;
  const ratio = Math.round((totalSpent / budget) * 100);

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Audit travel spending for ${trip.destination}.
Budget: ${trip.currencySymbol}${budget}
Total Spent: ${trip.currencySymbol}${totalSpent} (${ratio}% burn rate)
Expenses: ${JSON.stringify(trip.expenses)}

Return JSON:
{
  "auditScore": "A+" | "B" | "C" | "Warning",
  "summaryText": "2 sentence financial assessment",
  "savingHacks": ["Specific hack 1 for ${trip.destination}", "Specific hack 2", "Specific hack 3"]
}`,
        config: { responseMimeType: 'application/json', temperature: 0.3 }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.warn("AI expense audit fallback", e);
    }
  }

  return {
    auditScore: ratio < 60 ? "A (Healthy)" : ratio < 90 ? "B (On Track)" : "Caution (Near Budget Limit)",
    summaryText: `You have utilized ${ratio}% of your allocated ${trip.currencySymbol}${budget.toLocaleString()} budget across ${trip.expenses.length} tracked expenditures.`,
    savingHacks: [
      `Use public transit passes rather than point-to-point taxis.`,
      `Book Michelin lunch menus instead of dinner for up to 50% savings.`,
      `Withdraw local currency from zero-fee bank ATMs rather than airport kiosks.`
    ]
  };
}
