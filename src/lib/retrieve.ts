import type { ChunkRecord, Citation } from "./types";
import { store } from "./store";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "on", "for",
  "and", "or", "what", "how", "do", "does", "can", "i", "we", "you", "my",
  "our", "please", "with", "about", "that", "this", "it", "be",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function retrieveTopChunks(query: string, k = 3): ChunkRecord[] {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored = store.chunks.map((chunk) => {
    const chunkTokens = tokenize(chunk.chunk_text);
    let score = 0;
    for (const t of chunkTokens) if (queryTokens.has(t)) score += 1;
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.chunk);
}

export function toCitations(chunks: ChunkRecord[]): Citation[] {
  const byDoc = new Map<string, Citation>();
  for (const c of chunks) {
    if (!byDoc.has(c.document_id)) {
      byDoc.set(c.document_id, {
        document_id: c.document_id,
        title: c.document_title,
        snippet: c.chunk_text.slice(0, 160),
      });
    }
  }
  return [...byDoc.values()];
}
