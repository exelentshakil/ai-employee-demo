"use client";

import {
  ArrowRight,
  Code2,
  FileLock2,
  Github,
  Layers,
  ShieldCheck,
  Workflow,
} from "lucide-react";

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

export function Footer() {
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
              Enterprise Implementation Architecture
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">
                Deployment Strategy
              </div>
              <div className="text-xs text-muted leading-relaxed">
                This MVP isn't just a prototype; it's the foundation of an enterprise-grade AI workforce. By wiring this securely into your actual CRM and inbox with hard-coded approval gates, we aren't just saving hours—we are building a highly scalable, zero-hallucination asset that permanently lowers your operational overhead and positions your firm to scale without hiring constraints.
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-line">
              <div className="text-xs font-medium text-text mb-3">Core Modules</div>
              <ul className="space-y-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <div className="size-1 bg-accent rounded-full mt-1.5 shrink-0" />
                  Email integration (Gmail / Outlook OAuth)
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-1 bg-accent rounded-full mt-1.5 shrink-0" />
                  CRM integration — read + update on approval
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-1 bg-accent rounded-full mt-1.5 shrink-0" />
                  Calendar integration — read + create on approval
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-1 bg-accent rounded-full mt-1.5 shrink-0" />
                  Document ingestion at scale (PDF / DOCX / Drive)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted">
          <span>Built as an enterprise proof-of-concept.</span>
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
