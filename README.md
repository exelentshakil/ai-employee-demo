# AI Employee — grounded knowledge + approval-gated actions

A working demo built for the Upwork brief *"AI Automation Specialist for AI
Employee"*. Not a chatbot wrapper: the two properties that make an AI safe to
put near a real inbox are enforced in the architecture.

**Live demo:** https://ai-employee-demo-mu.vercel.app

## The two boundaries

1. **Grounded + cited.** Answers are retrieved from an ingested knowledge base
   and cite the source document. Nothing in scope → it says so instead of
   inventing an answer.
2. **Approval-gated.** Every action — email reply, CRM update, calendar note —
   is drafted into a queue with status `pending`. Nothing reaches an external
   system until a human clicks Approve. In production that click is exactly
   where the Gmail / CRM API call fires.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Gemini with a model
fallback chain · Supabase (traffic only) · Vercel.

## Running locally

```bash
npm install
npm run dev
```

No credentials required. Without `GEMINI_API_KEY` the assistant falls back to
deterministic extractive answers built from the retrieved chunks, so every
screen still works — see `/api/health` for which layers are live.

| Env var | Purpose |
|---|---|
| `GEMINI_API_KEY` | Enables generative answers. Optional. |
| `GEMINI_MODELS` | Comma-separated model fallback chain. Optional. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Traffic analytics only. Optional. |

## Endpoints

| Route | Purpose |
|---|---|
| `GET /api/health` | Which layers are live + store stats |
| `GET/POST /api/knowledge` | List / ingest knowledge base documents |
| `POST /api/ask` | Grounded answer with citations |
| `GET/POST/PATCH /api/actions` | List / draft / approve-reject actions |
| `GET/POST /api/traffic` | Visitor analytics (see `README_TRAFFIC.md`) |

## Docs

- [`docs/PRD.md`](docs/PRD.md) — problem, principle, scope, data model, phases
- [`docs/ESTIMATE.md`](docs/ESTIMATE.md) — hours and cost per phase
- [`docs/PROPOSAL.md`](docs/PROPOSAL.md) — the cover letter
- [`README_TRAFFIC.md`](README_TRAFFIC.md) — analytics setup and opt-out

## Known gaps

The demo ships with sample business documents and does not connect to real
Gmail, CRM or Calendar accounts — those need OAuth against the client's own
tenants (phase 1). Retrieval is keyword/stem based rather than vector search;
swapping in embeddings is a config change, not a rebuild. The knowledge store
is in-memory, so it resets on redeploy.
