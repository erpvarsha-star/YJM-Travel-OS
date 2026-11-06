import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { localConciergeReply, generateCulturalInsights, generatePackingItems } from './services/localIntelligenceService';
import { generateFullTripWithAI, auditTripExpensesAI, INITIAL_TRIPS } from './services/travelBrainService';
import { searchLiveInventory } from './services/liveInventoryService';
import { generateWithAnyLlm, getGeminiKey, llmProviderLabel } from './services/llmRouter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/intelligence', async (req, res) => {
    try {
      const { currentState, input } = req.body;
      const apiKey = getGeminiKey();
      
      if (!apiKey) {
        const state = currentState || { profile: { loyalty: [] }, trips: INITIAL_TRIPS };
        const dest = String(input || '').match(/to ([A-Za-z ]+)/i)?.[1]?.trim();
        if (dest && Array.isArray(state.trips)) {
          const generated = await generateFullTripWithAI({ destination: dest, days: 5 });
          state.trips = [generated, ...state.trips.filter((t: any) => t.id !== generated.id)];
        }
        return res.json(state);
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the TravelOS Core Intelligence Engine. You operate on a JSON state representing Yash Munot's travel world.
Your Constraints:
Data Model: You strictly follow the provided JSON schema. Do not change keys.
Loyalty Math: You must calculate CPP (Cents Per Point). If CPP > 2.0, you MUST prioritize this in the 'H3 Best Points' and 'H4 Balanced' strategies.
Memory Bias: Before generating strategies, read the decisionLog. If Yash has flagged a preference (e.g., 'Avoid Boeing 737 Max' or 'Prefer Marriott over Hilton'), you MUST penalize the score of strategies that violate this.
Rationale Rule: Every strategy rationale must be 2 sentences max: Sentence 1 is the 'What', Sentence 2 is the 'Why' based on Yash's specific status or balance.
Output: Return ONLY raw JSON. No markdown, no 'Here is your update'. Just the JSON object.

# State Mutation Rules:
- If asked to research a new trip or generate options, hallucinate realistic flight and hotel data with realistic cash/points prices, add them to 'researchInbox', and then generate the 4 strategies (value, premium, points, balanced).
- If research was added, add it to 'researchInbox' and regenerate/generate 'strategies' for the active trip (use 'value', 'premium', 'points', 'balanced' as strategy types).
- Update the 'decisionLog' if the user confirms/decides on a choice or shares a preference.
- Users can create new trips via prompt. If they ask to create a trip to X, add a new trip to the trips array.
- Users can update their loyalty balances.
- If the user asks to save preferences to memory, add them to the 'decisionLog' on all trips, or the active trip.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `CURRENT_STATE:\n${JSON.stringify(currentState)}\n\nUSER_INPUT:\n"${input}"\n\nReturn the updated state JSON ONLY:` }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || "{}";
      const updatedState = JSON.parse(responseText);

      return res.json(updatedState);
    } catch (error: any) {
      console.error('Error generating strategy:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/llm/status', (_req, res) => {
    res.json({ provider: llmProviderLabel() });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, history, userProfile } = req.body || {};
      const { sendMessageToGemini } = await import('./services/geminiService');
      const result = await sendMessageToGemini(prompt || '', history || [], userProfile);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Chat failed' });
    }
  });

  app.post('/api/inventory/search', async (req, res) => {
    try {
      const result = await searchLiveInventory(req.body || {});
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Inventory search failed' });
    }
  });

  app.post('/api/packing/generate', async (req, res) => {
    const items = generatePackingItems(req.body || {});
    return res.json({ items });
  });

  app.post('/api/itinerary/generate', async (req, res) => {
    try {
      const trip = await generateFullTripWithAI(req.body || { destination: 'Tokyo', days: 5 });
      return res.json(trip);
    } catch (e: any) {
      const trip = await generateFullTripWithAI(req.body || { destination: 'Tokyo', days: 5 });
      res.json(trip);
    }
  });

  app.post('/api/cultural/generate', async (req, res) => {
    try {
      const dest = req.body?.destination || 'Tokyo';
      const llm = await generateWithAnyLlm({
        system: 'Return only valid JSON for cultural travel intel.',
        user: `Generate cultural emergency numbers, etiquette, phrases with phonetics, and local hacks for: ${JSON.stringify(req.body)}. Return JSON.`,
        json: true,
      });
      if (llm?.text) {
        const parsed = JSON.parse(llm.text);
        if (parsed.emergencyNumbers) return res.json(parsed);
      }
      return res.json(generateCulturalInsights(dest, req.body?.country));
    } catch (e: any) {
      res.json(generateCulturalInsights(req.body?.destination || 'Tokyo', req.body?.country));
    }
  });

  app.post('/api/budget/audit', async (req, res) => {
    try {
      const result = await auditTripExpensesAI(req.body);
      return res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/concierge/chat', async (req, res) => {
    try {
      const { message, tripContext, chatHistory } = req.body;
      const suggestions = [
        `Best local dinner spots near ${tripContext?.destination || 'destination'}`,
        `How to get around cheaply on public transit?`,
        `Key cultural rules and etiquette tips`
      ];
      const llm = await generateWithAnyLlm({
        system: `You are the Voyager Travel Concierge. Practical advice for: ${JSON.stringify(tripContext || {})}. Markdown only.`,
        user: message || 'Hello',
        temperature: 0.4,
      });
      if (llm?.text) return res.json({ reply: llm.text, suggestions });

      const apiKey = getGeminiKey();
      if (!apiKey) {
        const local = localConciergeReply(message || 'Hello', tripContext);
        return res.json({ reply: local.text, suggestions });
      }
      const ai = new GoogleGenAI({ apiKey });

      // Sanitize chat history so it starts with a user turn and strictly alternates
      const validHistory: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];
      if (Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          if (!msg || !msg.content) continue;
          const role: 'user' | 'model' = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
          validHistory.push({ role, parts: [{ text: String(msg.content) }] });
        }
      }

      const firstUserIdx = validHistory.findIndex(h => h.role === 'user');
      const sanitizedHistory: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];
      if (firstUserIdx !== -1) {
        for (const item of validHistory.slice(firstUserIdx)) {
          if (sanitizedHistory.length === 0) {
            sanitizedHistory.push(item);
          } else {
            const prev = sanitizedHistory[sanitizedHistory.length - 1];
            if (prev.role !== item.role) {
              sanitizedHistory.push(item);
            }
          }
        }
        while (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role !== 'model') {
          sanitizedHistory.pop();
        }
      }

      const systemInstruction = `You are the Voyager Travel Concierge. You give practical, high-value travel recommendations, secrets, food spots, navigation hacks, and etiquette advice based on: ${JSON.stringify(tripContext || {})}. Format your response nicely with markdown. Provide helpful travel guidance.`;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: sanitizedHistory.length > 0 ? sanitizedHistory : undefined
      });

      const response = await chat.sendMessage({ message: message || "Hello" });
      const reply = response.text || "I am ready to help with your trip!";

      res.json({
        reply,
        suggestions: [
          `Best local dinner spots near ${tripContext?.destination || 'destination'}`,
          `How to get around cheaply on public transit?`,
          `Key cultural rules and etiquette tips`
        ]
      });
    } catch (e: any) {
      console.error("Concierge API error:", e);
      const local = localConciergeReply(req.body?.message || 'Hello', req.body?.tripContext);
      res.json({
        reply: local.text,
        suggestions: [
          `Best local dinner spots near ${req.body?.tripContext?.destination || 'destination'}`,
          `How to get around cheaply on public transit?`,
          `Key cultural rules and etiquette tips`
        ]
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
