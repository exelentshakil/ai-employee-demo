"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  Calendar,
  Check,
  FileText,
  Inbox,
  Loader2,
  Quote,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Citation = { document_id: string; title: string; snippet: string };
type Doc = { id: string; title: string; source_type: string; created_at: string; chunk_count: number };
type ActionRec = {
  id: string;
  request_text: string;
  action_type: "email_reply" | "crm_update" | "calendar_note";
  draft_output: string;
  status: "pending" | "approved" | "rejected";
  citations: string[];
  created_at: string;
};

const TABS = [
  { id: "ask", label: "Ask", icon: Sparkles },
  { id: "actions", label: "Action Queue", icon: Inbox },
  { id: "kb", label: "Knowledge Base", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ACTION_META = {
  email_reply: { label: "Email reply", icon: Send },
  crm_update: { label: "CRM update", icon: Building2 },
  calendar_note: { label: "Calendar note", icon: Calendar },
} as const;

export function Console() {
  const [tab, setTab] = useState<TabId>("ask");
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-[11px] font-medium text-accent">
          <span className="size-1.5 rounded-full bg-accent pulse-dot" />
          Live demo · no login required
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          Grounded answers. Nothing sent without your approval.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Ask it something and every claim cites the document it came from. Ask it to act and the
          draft waits in a queue for you — it never touches an inbox, CRM or calendar on its own.
        </p>
      </div>

      <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.id ? "text-ink" : "text-muted hover:text-ink"
            )}
          >
            <t.icon className="size-4" />
            {t.label}
            {t.id === "actions" && pendingCount > 0 && (
              <span className="ml-0.5 rounded-full bg-warn/15 text-warn text-[10px] font-semibold px-1.5 py-0.5 tabular-nums">
                {pendingCount}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      <div className="animate-in-up">
        {tab === "ask" && <AskPanel />}
        {tab === "actions" && <ActionsPanel onPendingChange={setPendingCount} />}
        {tab === "kb" && <KnowledgePanel />}
      </div>
    </div>
  );
}

const SAMPLE_QUESTIONS = [
  "Can I approve a $250 refund myself?",
  "What's our rate for rush implementation work?",
  "When can client calls be booked?",
];

function AskPanel() {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    citations: Citation[];
    grounded: boolean;
    model: string;
  } | null>(null);

  async function ask(q?: string) {
    const text = q ?? question;
    if (!text.trim()) return;
    if (q) setQuestion(q);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="card p-5">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">
          Ask the knowledge base
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="mt-3 w-full resize-none rounded-lg border border-line bg-panel-2 px-3.5 py-3 text-sm outline-none transition-colors focus:border-accent/50"
        />
        <button
          onClick={() => ask()}
          disabled={loading || !question.trim()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {loading ? "Retrieving…" : "Ask"}
        </button>

        {result && (
          <div className="mt-6 animate-in-up">
            <div className="rounded-lg border border-line bg-panel-2 p-4 text-sm leading-relaxed whitespace-pre-line">
              {result.answer}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted">
              <span className="rounded border border-line px-2 py-0.5">model: {result.model}</span>
              <span
                className={cn(
                  "rounded border px-2 py-0.5",
                  result.grounded ? "border-ok/40 text-ok" : "border-warn/40 text-warn"
                )}
              >
                {result.grounded ? "grounded" : "no source match"}
              </span>
            </div>

            {result.citations.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                  Sources
                </div>
                <div className="space-y-2">
                  {result.citations.map((c) => (
                    <div
                      key={c.document_id}
                      className="rounded-lg border-l-2 border-accent bg-panel-2 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Quote className="size-3 text-accent" />
                        {c.title}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-muted">{c.snippet}…</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5 h-fit">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Try one</div>
        <div className="mt-3 space-y-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-left text-xs leading-relaxed transition-colors hover:border-accent/40 hover:text-accent"
            >
              {q}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Ask something outside the loaded documents and it will tell you it has no source —
          it will not improvise an answer.
        </p>
      </div>
    </div>
  );
}

function ActionsPanel({ onPendingChange }: { onPendingChange: (n: number) => void }) {
  const [requestText, setRequestText] = useState(
    "Reply to a customer asking for a $250 refund on their order."
  );
  const [actionType, setActionType] = useState<keyof typeof ACTION_META>("email_reply");
  const [actions, setActions] = useState<ActionRec[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/actions");
    const data = await res.json();
    const list: ActionRec[] = data.actions ?? [];
    setActions(list);
    onPendingChange(list.filter((a) => a.status === "pending").length);
  }, [onPendingChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function draft() {
    setLoading(true);
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_text: requestText, action_type: actionType }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function decide(id: string, decision: "approved" | "rejected") {
    await fetch("/api/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    await refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="card p-5 h-fit">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">
          Request a drafted action
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {(Object.keys(ACTION_META) as (keyof typeof ACTION_META)[]).map((k) => {
            const Icon = ACTION_META[k].icon;
            return (
              <button
                key={k}
                onClick={() => setActionType(k)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[10px] font-medium transition-colors",
                  actionType === k
                    ? "border-accent/50 bg-accent/8 text-accent"
                    : "border-line bg-panel-2 text-muted hover:text-ink"
                )}
              >
                <Icon className="size-4" />
                {ACTION_META[k].label}
              </button>
            );
          })}
        </div>

        <textarea
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          rows={4}
          className="mt-3 w-full resize-none rounded-lg border border-line bg-panel-2 px-3.5 py-3 text-sm outline-none transition-colors focus:border-accent/50"
        />

        <button
          onClick={draft}
          disabled={loading || !requestText.trim()}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {loading ? "Drafting…" : "Draft — does not send"}
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          The draft is written to the queue with status <span className="text-warn">pending</span>.
          In production this is exactly where the Gmail / CRM API call would fire — only after you
          approve.
        </p>
      </div>

      <div className="space-y-3">
        {actions.length === 0 && (
          <div className="card p-10 text-center text-sm text-muted">
            No drafted actions yet. Create one on the left.
          </div>
        )}

        {actions.map((a) => {
          const meta = ACTION_META[a.action_type];
          const Icon = meta?.icon ?? FileText;
          return (
            <div key={a.id} className="card p-5 animate-in-up">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Icon className="size-3.5 text-accent" />
                  </span>
                  {meta?.label ?? a.action_type}
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    a.status === "pending" && "border-warn/40 text-warn bg-warn/8",
                    a.status === "approved" && "border-ok/40 text-ok bg-ok/8",
                    a.status === "rejected" && "border-bad/40 text-bad bg-bad/8"
                  )}
                >
                  {a.status}
                </span>
              </div>

              <div className="mt-3 text-xs text-muted">
                <span className="font-medium">Request:</span> {a.request_text}
              </div>

              <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3.5 text-sm leading-relaxed whitespace-pre-line">
                {a.draft_output}
              </div>

              {a.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                  <span className="font-medium">Grounded in:</span>
                  {a.citations.map((c) => (
                    <span key={c} className="rounded border border-line bg-panel-2 px-2 py-0.5">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {a.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => decide(a.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ok/40 bg-ok/8 px-3.5 py-2 text-xs font-medium text-ok transition-colors hover:bg-ok/15"
                  >
                    <Check className="size-3.5" />
                    Approve &amp; send
                  </button>
                  <button
                    onClick={() => decide(a.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-bad/40 bg-bad/8 px-3.5 py-2 text-xs font-medium text-bad transition-colors hover:bg-bad/15"
                  >
                    <X className="size-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KnowledgePanel() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    setDocs(data.documents ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function ingest() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, source_type: "doc" }),
      });
      setTitle("");
      setContent("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  const totalChunks = docs.reduce((s, d) => s + d.chunk_count, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="card p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">
          Add a document
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title — e.g. Vendor Contract Terms"
          className="mt-3 w-full rounded-lg border border-line bg-panel-2 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="Paste an SOP, policy, FAQ, pricing sheet, or any business document…"
          className="mt-2.5 w-full resize-none rounded-lg border border-line bg-panel-2 px-3.5 py-3 text-sm outline-none transition-colors focus:border-accent/50"
        />
        <button
          onClick={ingest}
          disabled={loading || !title.trim() || !content.trim()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <BookOpen className="size-4" />}
          {loading ? "Ingesting…" : "Ingest document"}
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Ingest a doc, then switch to Ask and query it — you&apos;ll see it cited by name. This is
          how your real SOPs and processes train the system.
        </p>
      </div>

      <div className="card p-5 h-fit">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">
            Ingested documents
          </div>
          <span className="font-mono text-xs tabular-nums text-muted">
            {docs.length} docs · {totalChunks} chunks
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="rounded-lg border border-line bg-panel-2 px-3.5 py-2.5">
              <div className="text-sm font-medium">{d.title}</div>
              <div className="mt-0.5 font-mono text-[10px] text-muted">
                {d.source_type} · {d.chunk_count} chunks
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
