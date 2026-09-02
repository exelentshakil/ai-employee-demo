import { randomUUID } from "crypto";
import type { ActionRecord, ActionType, ChunkRecord, DocumentRecord } from "./types";

const SEED_DOCS: { title: string; source_type: string; content: string }[] = [
  {
    title: "Pricing Policy",
    source_type: "policy",
    content:
      "Standard hourly rate is $95/hr for consulting, $65/hr for implementation work. " +
      "Rush jobs (under 48 hours) carry a 25% surcharge. We never discount the first invoice " +
      "of a new client relationship — loyalty discounts only apply after 3 completed projects.",
  },
  {
    title: "Customer Support SOP",
    source_type: "sop",
    content:
      "All support replies must open by restating the customer's issue in one sentence. " +
      "Refunds under $200 can be approved without manager sign-off. Refunds over $200 must be " +
      "escalated to a manager before any reply promises one. Response time target is 4 business hours.",
  },
  {
    title: "Sales Follow-up Playbook",
    source_type: "sop",
    content:
      "Leads that request a quote get a same-day reply with a ballpark range, never an exact number, " +
      "until a discovery call has happened. After a discovery call, follow up within 24 hours with a " +
      "written proposal. Leads that go quiet for 10 days move to the nurture sequence, not a hard close.",
  },
  {
    title: "Meeting Scheduling Rules",
    source_type: "policy",
    content:
      "Client calls are booked in 30-minute slots, Tuesday–Thursday only, 10am–4pm client local time. " +
      "No meetings are booked on the same day they are requested unless marked urgent by a partner.",
  },
];

function splitIntoChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

class MemoryStore {
  documents: DocumentRecord[] = [];
  chunks: ChunkRecord[] = [];
  actions: ActionRecord[] = [];
  seeded = false;

  seedIfNeeded() {
    if (this.seeded) return;
    this.seeded = true;
    for (const d of SEED_DOCS) this.addDocument(d.title, d.source_type, d.content);
  }

  addDocument(title: string, source_type: string, content: string): DocumentRecord {
    const doc: DocumentRecord = {
      id: randomUUID(),
      title,
      source_type,
      content,
      created_at: new Date().toISOString(),
    };
    this.documents.unshift(doc);
    splitIntoChunks(content).forEach((chunk_text, chunk_index) => {
      this.chunks.push({
        id: randomUUID(),
        document_id: doc.id,
        document_title: title,
        chunk_text,
        chunk_index,
      });
    });
    return doc;
  }

  addAction(
    request_text: string,
    action_type: ActionType,
    draft_output: string,
    citations: string[]
  ): ActionRecord {
    const action: ActionRecord = {
      id: randomUUID(),
      request_text,
      action_type,
      draft_output,
      status: "pending",
      citations,
      created_at: new Date().toISOString(),
      decided_at: null,
    };
    this.actions.unshift(action);
    return action;
  }

  decideAction(id: string, status: "approved" | "rejected"): ActionRecord | null {
    const action = this.actions.find((a) => a.id === id);
    if (!action) return null;
    action.status = status;
    action.decided_at = new Date().toISOString();
    return action;
  }
}

const globalForStore = globalThis as unknown as { __aiEmployeeStore?: MemoryStore };

export const store = globalForStore.__aiEmployeeStore ?? new MemoryStore();
globalForStore.__aiEmployeeStore = store;
store.seedIfNeeded();
