"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileLock2,
  Github,
  Layers,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { label: "Email integration (Gmail / Outlook OAuth)", hours: 16 },
  { label: "CRM integration — read + update on approval", hours: 14 },
  { label: "Calendar integration — read + create on approval", hours: 8 },
  { label: "Document ingestion at scale (PDF / DOCX / Drive)", hours: 10 },
  { label: "Knowledge base tuning on your real SOPs", hours: 10 },
  { label: "Prompt & workflow library for top recurring tasks", hours: 10 },
  { label: "Accuracy testing pass + revision loop", hours: 6 },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Approval-Gated Actions",
    body: "Nothing reaches your inbox or CRM until a human clicks Approve. The gate is structural, not a prompt instruction.",
  },
  {
    icon: FileLock2,
    title: "Grounded + Cited",
    body: "Every answer is retrieved from your documents and cites its source. No match means it says so instead of guessing.",
  },
  {
    icon: Layers,
    title: "Zero-Setup Fallback",
    body: "Runs with no API key configured via a deterministic extractive path, so the demo never breaks in front of you.",
  },
  {
    icon: Workflow,
    title: "Auditable by Design",
    body: "Knowledge base and action log are both exposed as their own endpoints — inspect it without trusting the UI.",
  },
];

const COVER_LETTER = `You said this isn't just a chatbot — so I built the two things that actually make an AI trustworthy with real work: grounded answers and an approval gate before anything touches your systems.

Ask tab: every answer is retrieved from an ingested knowledge base and cited to the source doc — it says "I don't know" instead of guessing when nothing matches.

Actions tab: ask it to draft an email reply, CRM update, or calendar note — it drafts, grounded in your docs, and queues it as pending. Nothing sends until you click Approve. That's the structural boundary that makes it safe to connect to a real inbox.

Knowledge Base tab: paste in an SOP or policy and watch it get cited in the next answer — this is how your documents and processes actually train it.

Honest gap: the demo runs on sample business docs and doesn't yet touch real Gmail/CRM/Calendar — those need OAuth into your actual accounts, which I'd wire up in phase 1.

Total for phase 1 (real email/CRM/calendar connections, tuned to your docs, tested for accuracy): $11,100 at $150/hr over 74 hours, or a scoped-down first slice (email + knowledge base only) for about $3,900 to prove it on real traffic before going further.

What CRM and email provider are you on — that decides the exact integration path and hours.`;

export function Footer() {
  const [open, setOpen] = useState(false);
  const totalHours = PHASES.reduce((s, p) => s + p.hours, 0);

  return (
    <footer className="border-t border-line bg-panel-2/40 mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              An AI employee you can actually let near the inbox
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted max-w-xl">
              This isn&apos;t a chatbot with a system prompt telling it to behave. The knowledge
              boundary and the approval gate are enforced in the architecture — built to the
              specification in your Upwork brief.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {PILLARS.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="mt-0.5 size-8 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <p.icon className="size-4 text-accent" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted">{p.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 h-fit shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Code2 className="size-4 text-accent" />
              Project Proposal &amp; Timeline
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Phase 1 build time
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono tabular-nums">
                  {totalHours} Hours
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Total investment
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-accent">
                  $11,100
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-line space-y-2.5">
              {PHASES.map((p) => (
                <div key={p.label} className="flex items-start justify-between gap-3 text-xs">
                  <span className="flex items-start gap-2 text-muted">
                    <CheckCircle2 className="size-3.5 mt-px shrink-0 text-ok" />
                    {p.label}
                  </span>
                  <span className="font-mono tabular-nums shrink-0">{p.hours}h</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-line text-xs text-muted leading-relaxed">
              Phase 0 — this working demo — is already delivered at no cost. A scoped-down
              first slice (email + knowledge base only) runs ~26h / $3,900.
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent/40 hover:text-accent"
            >
              {open ? "Hide" : "Read"} Full Cover Letter
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <div className="mt-4 animate-in-up rounded-lg border border-line bg-panel-2 p-4 text-xs leading-relaxed text-muted whitespace-pre-line max-h-80 overflow-y-auto">
                {COVER_LETTER}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted">
          <span>Built for the Upwork &ldquo;AI Automation Specialist for AI Employee&rdquo; brief.</span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/exelentshakil/ai-employee-demo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Github className="size-3.5" />
              View Source
            </a>
            <a
              href="https://shakilhq.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              shakilhq.com
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
