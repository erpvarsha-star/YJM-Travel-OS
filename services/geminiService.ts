import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { Source, WeatherData, UserProfile } from "../types";
import { getWeatherForLocation } from "./weatherService";

const MODEL_NAME = "gemini-2.5-flash";

export interface GeminiResponse {
  text: string;
  sources: Source[];
  weather?: WeatherData;
}

// Define the tool
const weatherTool: FunctionDeclaration = {
  name: "get_weather",
  description: "Get current weather and 3-day forecast for a specific city or location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The city name, e.g. London, Tokyo, Paris"
      }
    },
    required: ["location"]
  }
};

const buildSystemInstruction = (profile?: UserProfile | null) => {
  let instruction = `You are Voyager AI, an expert travel planner specializing in multi-day itineraries, flight finding, and hotel recommendations.

**General Guidelines:**
*   **Currency:** ALWAYS display prices in **INR (Indian Rupees)** using the ₹ symbol. Convert from other currencies if necessary.
*   **Real-time Data:** ALWAYS use the googleSearch tool to fetch real-time data for prices, availability, and schedules.
*   **Maps & Locations:** Use the googleMaps tool to find airports, nearby cities, driving distances, and road trip routes.
*   **Weather:** If the user asks about a destination's weather or plans a trip, use the 'get_weather' tool to show the forecast.
*   **Formatting:** Use clear Markdown (bold headers, bullet points) for readability.

**IMPORTANT: STRUCTURED DATA FOR UI**
For Flights and Hotels, you MUST output the data in a specific **JSON block** format so the app can render beautiful cards.
Do not output plain text lists for flights or hotels.

**1. Flights (Listings):**
*   **Trigger:** When asked to FIND/SEARCH flights or when checking flight prices.
*   **Search:** Use Google Search to find real flights matching filters (Price, Stops, Airline).
*   **Presentation:**
    1. Start with a brief summary text.
    2. Then, output strictly a **JSON array** wrapped in \`\`\`json\`\`\` code fences.
    3. Follow up with the Google Flights link.
*   **JSON Schema:**
    \`\`\`json
    [
      {
        "type": "flight",
        "airline": "Airline Name",
        "flightNumber": "Flight #",
        "departure": "HH:MM",
        "arrival": "HH:MM",
        "duration": "e.g. 2h 30m",
        "price": 5000,
        "stops": "Non-stop" or "1 Stop",
        "tags": ["Refundable", "Meal Included"]
      }
    ]
    \`\`\`
*   **Link:** After the JSON block, provide: [✈️ Compare all flight prices on Google Flights](https://www.google.com/travel/flights...)

**2. Hotels (Listings):**
*   **Trigger:** When asked to FIND/SEARCH hotels.
*   **Search:** Use Google Search to find matching hotels (Price, Stars, Amenities).
*   **Presentation:**
    1. Brief summary.
    2. **JSON array** wrapped in \`\`\`json\`\`\` code fences.
*   **JSON Schema:**
    \`\`\`json
    [
      {
        "type": "hotel",
        "name": "Hotel Name",
        "stars": 4,
        "rating": 4.5,
        "price": 8500,
        "address": "Location/Area",
        "amenities": ["Pool", "Wifi", "Breakfast"],
        "description": "Short 1-sentence highlight"
      }
    ]
    \`\`\`

**3. Itineraries & Road Trips:**
*   Structure by Day (Day 1, Day 2...).
*   Break down into Morning, Afternoon, Evening.
*   Include logistics (transport), driving times (using Maps), and practical tips.
*   **Do NOT use JSON for itineraries.** Use standard Markdown.

**4. Deals & Coupons:**
*   **Proactive Search:** Search for promo codes and bank offers.
*   **Display:** Add a section titled "**💰 Available Offers**" after results.
*   **Format:** Present offers in a **Markdown Table** (NOT JSON) with columns: **Provider/Bank**, **Code**, **Discount**, **Validity**.

**5. Smart Packing List:**
*   Include a "**🧳 Smart Packing List**" section before Booking Details for itineraries.

**6. Booking Documentation:**
*   Append a "**📋 Booking Details**" section at the end of complete itineraries.

**7. Conflict of Ideas & Trade-Off Resolution (CRITICAL RULE):**
*   **Trigger:** Whenever there is an inherent conflict of ideas, a dilemma, diverging travel philosophies, or trade-offs in a trip plan (for example: Fast-Paced vs. Relaxed Pacing, Budget Savings vs. Luxury Splurge, Central Downtown Bustle vs. Peaceful Nature Retreat, Direct Pricey Transit vs. Layover Savings, Famous Tourist Icons vs. Hidden Local Gems, Adventurous vs. Restful).
*   **Behavior:** NEVER silently choose or guess for the user! Proactively surface the conflict of ideas, explain the difference, and ask the user what they prefer.
*   **Presentation:**
    1. Highlight the trade-off in the markdown with a "**⚖️ Decision Point: Conflict of Ideas**" heading.
    2. Then, output an interactive **JSON block** with \`"type": "conflict_choice"\` so the user can easily click their preferred option in the UI.
    3. Schema:
    \`\`\`json
    [
      {
        "type": "conflict_choice",
        "conflictTitle": "Pace Conflict: Sights Marathon vs. Relaxed Exploration",
        "conflictDescription": "Covering 8 major landmarks in 3 days gives high coverage but tight schedules, while 3-4 key areas allows leisurely strolls and café culture.",
        "question": "Which travel style do you prefer for this trip?",
        "options": [
          {
            "id": "opt_fast",
            "label": "⚡ Fast-Paced (See Everything)",
            "badge": "High Energy",
            "detail": "Pack the days with top landmarks and early starts.",
            "prompt": "I prefer the Fast-Paced (See Everything) option. Plan an action-packed itinerary visiting maximum highlights."
          },
          {
            "id": "opt_relaxed",
            "label": "🌿 Relaxed & Immersive",
            "badge": "Leisurely",
            "detail": "Fewer stops, unhurried meals, soaking in local culture.",
            "prompt": "I prefer the Relaxed & Immersive option. Keep the pacing leisurely with 2-3 deep experiences per day."
          }
        ]
      }
    ]
    \`\`\`
`;

  // Inject User Profile Context
  if (profile) {
    instruction += `\n\n**USER PROFILE & PREFERENCES CONTEXT**\n`;
    instruction += `User: ${profile.name || 'Traveler'}\n`;
    
    if (profile.preferences) {
      if (profile.preferences.dietary) instruction += `* Diet: ${profile.preferences.dietary}\n`;
      if (profile.preferences.seatPreference) instruction += `* Seat: ${profile.preferences.seatPreference}\n`;
      if (profile.preferences.cabinClass) instruction += `* Cabin: ${profile.preferences.cabinClass}\n`;
      if (profile.preferences.preferredAirlines) instruction += `* Airlines: ${profile.preferences.preferredAirlines}\n`;
      if (profile.preferences.preferredHotelChains) instruction += `* Hotels: ${profile.preferences.preferredHotelChains}\n`;
      if (profile.preferences.travelPace) instruction += `* Preferred Pace: ${profile.preferences.travelPace}\n`;
      if (profile.preferences.budgetPriority) instruction += `* Budget Style: ${profile.preferences.budgetPriority}\n`;
      if (profile.preferences.travelVibe) instruction += `* Travel Vibe: ${profile.preferences.travelVibe}\n`;
    }
    instruction += `* Idea Conflicts Policy: The user explicitly requested: whenever there is any conflict of ideas, trade-offs, or competing paths, ALWAYS ask what they prefer using the conflict_choice format.\n`;

    if (profile.loyaltyPrograms && profile.loyaltyPrograms.length > 0) {
      instruction += `* Loyalty: ${profile.loyaltyPrograms.map(p => `${p.provider} (${p.membershipId})`).join(', ')}\n`;
    }
  } else {
    instruction += `\n\n* Idea Conflicts Policy: Whenever there is a conflict of ideas or trade-off in the travel plan, ALWAYS present the trade-off and ask the user what they prefer using the conflict_choice format.\n`;
  }

  return instruction;
};

export const tools = [
  { googleSearch: {} },
  { googleMaps: {} },
  { functionDeclarations: [weatherTool] }
];

export const systemInstruction = buildSystemInstruction();

/**
 * Sanitizes chat history to strictly comply with Gemini API requirements:
 * 1. History MUST start with a 'user' turn (remove any leading model greetings).
 * 2. Turns MUST strictly alternate between 'user' and 'model'.
 * 3. History MUST end with a 'model' turn so the subsequent sendMessage call (which is 'user') creates a valid sequence.
 */
export function sanitizeChatHistory(
  rawHistory: { role: string; parts: { text?: string; [key: string]: any }[] }[]
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  if (!rawHistory || !Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  // Normalize roles: map 'assistant' to 'model', ensure valid parts
  const normalized: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  
  for (const item of rawHistory) {
    const role: 'user' | 'model' = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
    const textParts = (item.parts || [])
      .map(p => typeof p?.text === 'string' ? p.text.trim() : '')
      .filter(t => t.length > 0)
      .map(text => ({ text }));

    if (textParts.length > 0) {
      normalized.push({ role, parts: textParts });
    }
  }

  // 1. History must start with a 'user' turn. Drop any initial model/greeting messages.
  const firstUserIdx = normalized.findIndex(item => item.role === 'user');
  if (firstUserIdx === -1) {
    return [];
  }

  const fromFirstUser = normalized.slice(firstUserIdx);

  // 2. Ensure strictly alternating turns (user -> model -> user -> model...)
  const alternating: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const turn of fromFirstUser) {
    if (alternating.length === 0) {
      alternating.push(turn);
    } else {
      const prev = alternating[alternating.length - 1];
      if (prev.role === turn.role) {
        // Merge adjacent turns of the same role
        prev.parts = [...prev.parts, ...turn.parts];
      } else {
        alternating.push(turn);
      }
    }
  }

  // 3. Since chat.sendMessage(prompt) will append a new 'user' turn,
  // history MUST end with a 'model' turn!
  while (alternating.length > 0 && alternating[alternating.length - 1].role !== 'model') {
    alternating.pop();
  }

  return alternating;
}

export const sendMessageToGemini = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  userProfile?: UserProfile | null
): Promise<GeminiResponse> => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    let capturedWeatherData: WeatherData | undefined;

    const sanitizedHistory = sanitizeChatHistory(history);

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        tools: [
          { googleSearch: {} },
          { googleMaps: {} },
          { functionDeclarations: [weatherTool] }
        ],
        systemInstruction: buildSystemInstruction(userProfile),
      },
      history: sanitizedHistory.length > 0 ? sanitizedHistory : undefined
    });

    let response = await chat.sendMessage({ message: prompt });
    
    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      const functionResponseParts = await Promise.all(
        functionCalls.map(async (call) => {
          if (call.name === "get_weather") {
            const location = (call.args as any).location;
            const weatherData = await getWeatherForLocation(location);
            
            if (weatherData) {
              capturedWeatherData = weatherData;
              return {
                functionResponse: {
                  id: call.id,
                  name: call.name,
                  response: { result: weatherData }
                }
              };
            } else {
               return {
                functionResponse: {
                  id: call.id,
                  name: call.name,
                  response: { error: "Location not found" }
                }
              };
            }
          }
          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { error: "Unknown function" }
            }
          };
        })
      );

      response = await chat.sendMessage({ message: functionResponseParts });
    }

    const text = response.text || "I couldn't generate a response.";
    
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri,
          });
        }
        if (chunk.maps?.uri) {
           sources.push({
             title: chunk.maps.title || "Google Maps Location",
             uri: chunk.maps.uri
           });
        }
      });
    }

    return {
      text,
      sources,
      weather: capturedWeatherData,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      text: "Sorry, I encountered an error. Please try again.",
      sources: [],
    };
  }
};