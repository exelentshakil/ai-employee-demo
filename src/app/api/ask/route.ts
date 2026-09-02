import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { retrieveTopChunks, toCitations } from "@/lib/retrieve";
import { generateWithFallback } from "@/lib/gemini";

const AskSchema = z.object({ question: z.string().min(1).max(1000) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = AskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { question } = parsed.data;

  const chunks = retrieveTopChunks(question, 3);
  if (chunks.length === 0) {
    return NextResponse.json({
      answer:
        "I couldn't find anything in the knowledge base about that. I only answer from ingested " +
        "documents — add one via /api/knowledge and ask again.",
      citations: [],
      grounded: false,
      model: "no-match",
    });
  }

  const citations = toCitations(chunks);
  const context = chunks.map((c, i) => `[${i + 1}] (${c.document_title}) ${c.chunk_text}`).join("\n");

  const prompt =
    `You are an internal assistant for a small business. Answer the question ONLY using the ` +
    `numbered context below. If the context doesn't fully answer it, say what's missing. Cite ` +
    `sources inline like [1]. Keep it under 120 words.\n\nContext:\n${context}\n\nQuestion: ${question}`;

  const generated = await generateWithFallback(prompt);

  const answer =
    generated?.text ??
    `Based on "${citations[0].title}": ${chunks[0].chunk_text} ` +
      (chunks[1] ? `Also relevant from "${chunks[1].document_title}": ${chunks[1].chunk_text}` : "");

  return NextResponse.json({
    answer,
    citations,
    grounded: true,
    model: generated?.model ?? "extractive-fallback",
  });
}
