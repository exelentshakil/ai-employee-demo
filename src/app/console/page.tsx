"use client";

import { useEffect, useState } from "react";

type Citation = { document_id: string; title: string; snippet: string };
type Doc = { id: string; title: string; source_type: string; created_at: string; chunk_count: number };
type ActionRec = {
  id: string;
  request_text: string;
  action_type: string;
  draft_output: string;
  status: "pending" | "approved" | "rejected";
  citations: string[];
  created_at: string;
};

const TABS = ["Ask", "Actions", "Knowledge Base"] as const;
type Tab = (typeof TABS)[number];

export default function Console() {
  const [tab, setTab] = useState<Tab>("Ask");
  const [health, setHealth] = useState<{ gemini: string; store: string } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealth(d.layers))
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="header">
        <h1>AI Employee — Console</h1>
        <p>Every answer is grounded in your documents. Every action waits for your approval.</p>
        {health && (
          <div className="row">
            <span className="badge"><span className="dot" />Gemini: {health.gemini}</span>
            <span className="badge"><span className="dot" />Store: {health.store}</span>
          </div>
        )}
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Ask" && <AskPanel />}
      {tab === "Actions" && <ActionsPanel />}
      {tab === "Knowledge Base" && <KnowledgePanel />}
    </div>
  );
}

function AskPanel() {
  const [question, setQuestion] = useState("What's our refund policy for a $250 request?");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; citations: Citation[]; grounded: boolean; model: string } | null>(null);

  async function ask() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Ask the knowledge base</h2>
      <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
      <button className="primary" onClick={ask} disabled={loading || !question.trim()}>
        {loading ? "Thinking…" : "Ask"}
      </button>

      {result && (
        <div style={{ marginTop: 14 }}>
          <div className="answer-box">{result.answer}</div>
          <div className="meta" style={{ marginTop: 6 }}>
            model: {result.model} · grounded: {String(result.grounded)}
          </div>
          {result.citations.length > 0 && (
            <div className="citations">
              {result.citations.map((c) => (
                <div className="citation" key={c.document_id}>
                  <strong>{c.title}</strong> — {c.snippet}…
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionsPanel() {
  const [requestText, setRequestText] = useState("Reply to a customer asking for a $250 refund on their order.");
  const [actionType, setActionType] = useState("email_reply");
  const [actions, setActions] = useState<ActionRec[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/actions");
    const data = await res.json();
    setActions(data.actions ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

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
    <>
      <div className="panel">
        <h2>Request a drafted action</h2>
        <p className="meta" style={{ marginBottom: 10 }}>
          Nothing here ever sends automatically — every draft lands in the queue below for your approval first.
        </p>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
          <option value="email_reply">Email reply</option>
          <option value="crm_update">CRM record update</option>
          <option value="calendar_note">Calendar note</option>
        </select>
        <textarea value={requestText} onChange={(e) => setRequestText(e.target.value)} />
        <button className="primary" onClick={draft} disabled={loading || !requestText.trim()}>
          {loading ? "Drafting…" : "Draft (does not send)"}
        </button>
      </div>

      <div className="panel">
        <h2>Action queue</h2>
        {actions.length === 0 && <p className="meta">No drafted actions yet.</p>}
        {actions.map((a) => (
          <div className="action-row" key={a.id}>
            <div className="spread">
              <span className="title">{a.action_type.replace("_", " ")}</span>
              <span className={`status-pill status-${a.status}`}>{a.status}</span>
            </div>
            <div className="meta" style={{ marginBottom: 6 }}>request: {a.request_text}</div>
            <div className="answer-box" style={{ marginBottom: 8 }}>{a.draft_output}</div>
            {a.citations.length > 0 && (
              <div className="meta">grounded in: {a.citations.join(", ")}</div>
            )}
            {a.status === "pending" && (
              <div className="row" style={{ marginTop: 8 }}>
                <button className="ghost approve" onClick={() => decide(a.id, "approved")}>Approve</button>
                <button className="ghost reject" onClick={() => decide(a.id, "rejected")}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
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

  return (
    <>
      <div className="panel">
        <h2>Add a document to the knowledge base</h2>
        <input placeholder="Title (e.g. Vendor Contract Terms)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Paste SOP, policy, FAQ, or any business document text…" value={content} onChange={(e) => setContent(e.target.value)} />
        <button className="primary" onClick={ingest} disabled={loading}>
          {loading ? "Ingesting…" : "Ingest document"}
        </button>
      </div>

      <div className="panel">
        <h2>Ingested documents ({docs.length})</h2>
        {docs.map((d) => (
          <div className="doc-row" key={d.id}>
            <div className="title">{d.title}</div>
            <div className="meta">{d.source_type} · {d.chunk_count} chunks · {new Date(d.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </>
  );
}
