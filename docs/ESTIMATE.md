# Estimate

Rate: **$150/hr** (BarakahSoft standard). Posting budgets $15–20/hr — see
*Reconciling the rate gap* below.

## Phase 0 — Built (this demo, delivered before the bid)

| Item | Hours |
|---|---|
| Grounded knowledge-base ingestion + retrieval | 3 |
| Cited Q&A endpoint with Gemini + deterministic fallback | 3 |
| Approval-gated Action Queue (draft → pending → approve/reject) | 3 |
| Console UI (Ask / Actions / Knowledge tabs) | 3 |
| Health/audit endpoints, deploy, PRD, estimate | 2 |
| **Total** | **14 hrs — $2,100, billed as Job (already delivered)** |

## Phase 1 — Real connections (4–6 weeks, ~20 hrs/week)

| Item | Hours |
|---|---|
| Gmail/Outlook OAuth + read/draft/send-on-approval integration | 16 |
| CRM integration (HubSpot/Pipedrive/whatever they run) — read + update-on-approval | 14 |
| Calendar integration (Google/Outlook) — read + create-on-approval | 8 |
| Document ingestion at scale: PDF/DOCX upload, folder/Drive sync | 10 |
| Knowledge base tuning against their real SOPs, tone, and pricing docs | 10 |
| Prompt/workflow library for their top 5–8 recurring tasks | 10 |
| Accuracy testing pass + revision loop with the client | 6 |
| **Total** | **74 hrs — $11,100** |

## Phase 2 — Ongoing (ad hoc, as automation opportunities are found)

Billed hourly at the same rate, capped at the client's stated <30 hrs/week.
Covers: semantic/vector retrieval upgrade, new automation candidates surfaced
during use, scheduled/recurring workflows, additional integrations.

## Reconciling the rate gap

The posting budgets $15–20/hr for <30 hrs/week. At $150/hr, Phase 1 (74 hrs)
totals **$11,100**. At the posting's own $15–20/hr range, the *same scope*
would take roughly 250–350 freelancer-hours to get right if built by someone
earning at that rate with less senior architecture experience — the real
comparison is total cost and risk of a broken agent connected to live email,
not the hourly number.

**Scoped-down package**, if $11.1K isn't the right fit up front: ship just the
email integration + knowledge base tuning first (≈26 hrs / $3,900), prove the
approval-gate pattern works on real inbox traffic for 2–3 weeks, then decide
on CRM/calendar as a second phase.

## Running cost at volume (Gemini API, once live)

Roughly $0.01–0.03 per grounded answer/draft at current Gemini Flash pricing —
negligible next to the labor cost, but worth knowing before scaling to
hundreds of daily requests.

## Suggested cadence

Given <30 hrs/week: 3–4 focused sessions/week, async updates in between,
one short call weekly to review the Action Queue backlog and correct drift
early rather than after 50 wrong drafts.
