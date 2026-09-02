/**
 * Model ids move fast and old ones start returning 404 with no warning, so the
 * chain is read from env and tried in order. If every entry fails the caller
 * falls back to a deterministic extractive answer — the demo never hard-fails
 * on a provider deprecation.
 */
const DEFAULT_MODELS = "gemini-3.6-flash,gemini-3.5-flash,gemini-flash-latest,gemini-2.5-flash";

function models(): string[] {
  return (process.env.GEMINI_MODELS || DEFAULT_MODELS)
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateWithFallback(
  prompt: string
): Promise<{ text: string; model: string } | null> {
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
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              // These are thinking models: reasoning tokens draw from the same
              // budget, so a tight cap truncates the answer mid-sentence.
              maxOutputTokens: 4000,
            },
          }),
        }
      );
      if (!res.ok) continue;

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) continue;

      const text = parts
        .filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
        .map((p: { text: string }) => p.text)
        .join("")
        .trim();

      if (text) return { text, model };
    } catch {
      continue;
    }
  }
  return null;
}
