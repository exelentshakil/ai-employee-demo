const DEFAULT_MODELS = "gemini-2.0-flash,gemini-1.5-flash,gemini-1.5-flash-8b";

function models(): string[] {
  return (process.env.GEMINI_MODELS || DEFAULT_MODELS).split(",").map((m) => m.trim());
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateWithFallback(prompt: string): Promise<{ text: string; model: string } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  for (const model of models()) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.trim()) return { text: text.trim(), model };
    } catch {
      continue;
    }
  }
  return null;
}
