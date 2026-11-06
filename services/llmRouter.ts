export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function env(name: string): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return String(process.env[name] || '').trim();
}

export function getUserLlmConfig(): { apiKey: string; baseUrl: string; model: string } | null {
  const apiKey = env('USER_LLM_API_KEY');
  const baseUrl = env('USER_LLM_BASE_URL').replace(/\/$/, '');
  const model = env('USER_LLM_MODEL') || 'llama-3.3-70b-versatile';
  if (!apiKey || !baseUrl) return null;
  return { apiKey, baseUrl, model };
}

export function getGeminiKey(): string {
  const key = env('GEMINI_API_KEY') || env('API_KEY');
  if (!key || key === 'undefined' || key === 'MY_GEMINI_API_KEY') return '';
  return key;
}

export function llmProviderLabel(): string {
  if (getUserLlmConfig()) return 'open-source LLM';
  if (getGeminiKey()) return 'Gemini 2.5 Flash';
  return 'on-device';
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  const a0 = text.indexOf('[');
  const a1 = text.lastIndexOf(']');
  if (a0 >= 0 && a1 > a0) return text.slice(a0, a1 + 1);
  return text.trim();
}

export async function chatWithOpenSourceLlm(
  messages: LlmMessage[],
  opts?: { json?: boolean; temperature?: number }
): Promise<string | null> {
  const cfg = getUserLlmConfig();
  if (!cfg) return null;
  try {
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages,
      temperature: opts?.temperature ?? 0.3,
    };
    if (opts?.json) body.response_format = { type: 'json_object' };
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      if (opts?.json) {
        delete body.response_format;
        const retry = await fetch(`${cfg.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfg.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(25000),
        });
        if (!retry.ok) return null;
        const data = await retry.json();
        return data?.choices?.[0]?.message?.content || null;
      }
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

export async function generateWithAnyLlm(opts: {
  system: string;
  user: string;
  json?: boolean;
  temperature?: number;
}): Promise<{ text: string; provider: string } | null> {
  const oss = await chatWithOpenSourceLlm(
    [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
    { json: opts.json, temperature: opts.temperature }
  );
  if (oss) {
    return { text: opts.json ? extractJson(oss) : oss, provider: 'oss' };
  }

  const geminiKey = getGeminiKey();
  if (geminiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${opts.system}\n\n${opts.user}`,
        config: opts.json
          ? { responseMimeType: 'application/json', temperature: opts.temperature ?? 0.3 }
          : { temperature: opts.temperature ?? 0.4 },
      });
      const text = response.text || '';
      if (text) return { text: opts.json ? extractJson(text) : text, provider: 'gemini' };
    } catch {
      return null;
    }
  }
  return null;
}
