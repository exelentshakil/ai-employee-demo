import { NextResponse } from "next/server";
import { geminiConfigured } from "@/lib/gemini";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    layers: {
      gemini: geminiConfigured() ? "live" : "fallback (extractive answers)",
      store: "in-memory (zero-setup demo store)",
    },
    stats: {
      documents: store.documents.length,
      chunks: store.chunks.length,
      actions: store.actions.length,
    },
  });
}
