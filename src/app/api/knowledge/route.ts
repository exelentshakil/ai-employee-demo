import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";

const IngestSchema = z.object({
  title: z.string().min(1).max(200),
  source_type: z.string().min(1).max(50).default("doc"),
  content: z.string().min(1).max(20000),
});

export async function GET() {
  return NextResponse.json({
    documents: store.documents.map((d) => ({
      id: d.id,
      title: d.title,
      source_type: d.source_type,
      created_at: d.created_at,
      chunk_count: store.chunks.filter((c) => c.document_id === d.id).length,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, source_type, content } = parsed.data;
  const doc = store.addDocument(title, source_type, content);
  return NextResponse.json({ document: doc }, { status: 201 });
}
