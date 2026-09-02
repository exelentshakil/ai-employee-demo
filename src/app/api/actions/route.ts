import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { retrieveTopChunks, toCitations } from "@/lib/retrieve";
import { generateWithFallback } from "@/lib/gemini";
import { store } from "@/lib/store";

const ActTypes = ["email_reply", "crm_update", "calendar_note"] as const;

const RequestSchema = z.object({
  request_text: z.string().min(1).max(1000),
  action_type: z.enum(ActTypes),
});

const DecisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
});

const ACTION_LABEL: Record<(typeof ActTypes)[number], string> = {
  email_reply: "Draft email reply",
  crm_update: "Draft CRM record update",
  calendar_note: "Draft calendar note",
};

/** Models still emit bold/heading syntax sometimes; the queue renders plain text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

export async function GET() {
  return NextResponse.json({ actions: store.actions });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { request_text, action_type } = parsed.data;

  const chunks = retrieveTopChunks(request_text, 3);
  const citations = toCitations(chunks);
  const context = chunks.map((c, i) => `[${i + 1}] (${c.document_title}) ${c.chunk_text}`).join("\n");

  const prompt =
    `You are drafting a "${ACTION_LABEL[action_type]}" for internal review — it will NOT be sent ` +
    `automatically. Ground it only in the context below; note any gap in [brackets] instead of ` +
    `inventing details. Keep it under 100 words. Reply with plain text only — no markdown, no ` +
    `asterisks, no headings.\n\nContext:\n${context || "(no matching internal docs)"}` +
    `\n\nRequest: ${request_text}`;

  const generated = await generateWithFallback(prompt);
  const draft =
    (generated?.text && stripMarkdown(generated.text)) ||
    (chunks.length
      ? `[DRAFT — extractive fallback] Based on ${citations.map((c) => c.title).join(", ")}: ${chunks
          .map((c) => c.chunk_text)
          .join(" ")}`
      : `[DRAFT — no matching internal policy found for: "${request_text}". Needs manual input before approval.]`);

  const action = store.addAction(request_text, action_type, draft, citations.map((c) => c.title));

  return NextResponse.json({ action }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = DecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = store.decideAction(parsed.data.id, parsed.data.decision);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ action: updated });
}
