# AI Employee — Grounded Knowledge + Approval-Gated Actions

## Problem

The client wrote: *"This is not just a chatbot. I want an AI system trained
around my business processes ... to assist with real day-to-day work."*

The fear underneath that sentence isn't "can the AI write text" — it's **can I
trust it to touch my email, CRM, and calendar without either (a) hallucinating
answers that don't match how my business actually works, or (b) taking an
action I didn't approve.** Every generic chatbot demo fails on exactly those
two points.

## Core principle

Two hard boundaries, both structural, not promised in a prompt:

1. **Every answer is grounded and cited.** The AI never answers from general
   knowledge — it retrieves from an ingested knowledge base (docs, SOPs, past
   emails, pricing sheets) and every response names which source chunk it used.
   No source match → the AI says so instead of guessing.
2. **Every action is drafted, never executed, until a human approves it.**
   "Send this email," "update this CRM record," "add this to the calendar" all
   land in an Action Queue as a pending draft. Nothing reaches an external
   system until a person clicks Approve. This is the difference between an
   assistant and an unsupervised agent — and it's the thing that makes an
   owner comfortable connecting it to real inboxes and real CRMs.

## Scope

**In scope (this demo):**
- Knowledge base ingestion (paste or upload text/markdown docs — SOPs, FAQs,
  pricing, policies)
- Grounded Q&A over that knowledge base with per-answer source citations
- Action Queue: AI drafts an action (reply email / CRM update / calendar note)
  from a request, queued as `pending`; human approves or rejects
- Audit log: every ingested doc and every action decision is inspectable via
  its own endpoint, not just visible in a chat transcript
- Deterministic fallback: works end-to-end without any API key configured, so
  a reviewer can click through with zero setup

**Out of scope (phase 2+, listed in the estimate):**
- Live connections to real Gmail/Outlook, HubSpot/Pipedrive, Google Calendar
  (OAuth + provider APIs — needs the client's actual accounts)
- Embedding-based semantic retrieval (demo uses keyword/BM25-style retrieval;
  swap-in for vector search is a config change, not a rebuild)
- Multi-user roles/permissions, scheduled autonomous runs, Slack/Teams delivery

## Data model

- `documents` — id, title, source_type, content, created_at
- `doc_chunks` — id, document_id, chunk_text, chunk_index (simple paragraph
  split; swappable for a real chunker)
- `actions` — id, request_text, action_type (email_reply | crm_update |
  calendar_note), draft_output, status (pending | approved | rejected),
  citations (doc ids used to ground the draft), created_at, decided_at

Supabase-backed when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise an
in-memory store with the same shape, seeded with sample business docs so the
demo is never empty.

## Pipeline

1. Ingest → split into chunks → store, indexed by keyword.
2. Ask → retrieve top-matching chunks → Gemini synthesizes an answer
   constrained to only use retrieved text → response includes `citations[]`.
3. Act → same retrieval + synthesis, but output is a **draft**, written to
   `actions` as `pending` — never sent anywhere.
4. Approve/Reject → human decision recorded; approved actions are marked
   `approved` (in phase 2, this is the point where a real send/update call
   would fire).

## Non-functionals

- Runs with zero configured secrets (fallback simulator + seeded KB).
- `GEMINI_API_KEY` optional; when absent, answers are built deterministically
  from the retrieved chunks (extractive, not generative) so the flow never
  breaks.
- `/api/health` reports which layers are live (Gemini / Supabase / fallback).

## Phases (see docs/ESTIMATE.md for hours)

- **Phase 0 (built):** grounded Q&A, action-queue-with-approval, audit
  endpoints, deterministic fallback — this demo.
- **Phase 1:** connect real email (Gmail/Outlook API), real CRM, real
  calendar; move action execution behind the approval gate.
- **Phase 2:** semantic (vector) retrieval, richer document ingestion (PDF/
  DOCX/website crawl), scheduled/recurring workflows, task-suggestion engine.

## Risks

- Provider model deprecation → mitigated with a comma-separated model fallback
  chain read from env.
- Client's real inboxes/CRMs each need their own OAuth app + scopes — that's
  discovery-and-integration work, not something a generic demo can pre-build.
- "Identifying additional tasks that can be automated" is inherently
  discovery-driven — priced as ongoing hours, not a fixed deliverable.

## Acceptance criteria (against the brief)

- [x] "AI trained around business processes/documents" → knowledge base
  ingestion + grounded retrieval
- [x] "Not just a chatbot" → structural approval gate before any action
- [x] "Connecting AI to email, documents, CRM, calendars" → Action Queue
  models exactly these three action types end-to-end; phase 1 wires the real
  providers
- [x] "Creating a knowledge base from existing company info" → `/api/knowledge`
  ingestion + citation-backed answers
- [x] "Developing prompts and repeatable workflows" → the ask/act pipeline is
  the repeatable workflow; prompts are inspectable, not hidden
- [x] "Testing accuracy and reliability" → every answer/action is auditable
  via citations and the action log, not just trusted on faith
- [x] "Identifying additional tasks that can be automated" → addressed as an
  ongoing phase-1/phase-2 activity in the estimate, not a one-time deliverable
