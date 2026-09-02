"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Circle, Globe, RefreshCw } from "lucide-react";

type Row = {
  id: string;
  created_at: string;
  path: string | null;
  ip_address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  user_agent: string | null;
};

export default function TrafficPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/traffic?limit=500");
      const json = await res.json();
      setRows(Array.isArray(json.data) ? json.data : []);
      setNotice(json.error ?? null);
    } catch {
      setRows([]);
      setNotice("Could not reach /api/traffic.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const uniqueIps = new Set(rows.map((r) => r.ip_address).filter(Boolean)).size;
    const cutoff = Date.now() - 5 * 60 * 1000;
    const live = new Set(
      rows.filter((r) => new Date(r.created_at).getTime() > cutoff).map((r) => r.ip_address)
    ).size;
    return { visitors: rows.length, uniqueIps, live };
  }, [rows]);

  const topPaths = useMemo(() => rank(rows.map((r) => r.path || "/")), [rows]);
  const topLocations = useMemo(
    () =>
      rank(
        rows.map((r) =>
          [r.city, r.country].filter(Boolean).join(", ") || "Unknown"
        )
      ),
    [rows]
  );

  const series = useMemo(() => buildSeries(rows), [rows]);

  return (
    <div className="min-h-screen bg-[#08090c] text-[#e8eaf0]">
      <header className="border-b border-[#1c1f28] sticky top-0 z-10 bg-[#08090c]/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="size-8 rounded-lg border border-[#1c1f28] flex items-center justify-center text-[#7b8194] hover:text-[#e8eaf0] transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="size-5 rounded bg-indigo-500/90 flex items-center justify-center">
              <Circle className="size-2 fill-white text-white" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Demo Analytics</span>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs text-[#7b8194] hover:text-[#e8eaf0] transition-colors"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {notice && (
          <div className="mb-5 rounded-lg border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-xs text-amber-300/90">
            {notice}
          </div>
        )}

        <div className="rounded-xl border border-[#1c1f28] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1c1f28] border-b border-[#1c1f28]">
            <Metric label="Page views" value={stats.visitors} />
            <Metric label="Unique IPs" value={stats.uniqueIps} />
            <Metric label="Countries" value={new Set(rows.map((r) => r.country).filter(Boolean)).size} />
            <Metric label="Live (5m)" value={stats.live} live />
          </div>

          <div className="p-5">
            <Sparkline series={series} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Panel title="Top paths" rows={topPaths} />
          <Panel title="Top locations" rows={topLocations} icon={<Globe className="size-3.5" />} />
        </div>

        <div className="mt-5 rounded-xl border border-[#1c1f28] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1c1f28] text-xs font-medium uppercase tracking-wider text-[#7b8194]">
            Recent visits
          </div>
          {rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[#7b8194]">
              No traffic recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#1c1f28]">
              {rows.slice(0, 25).map((r) => (
                <div
                  key={r.id}
                  className="px-5 py-2.5 flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-mono text-[#b8bdcc] truncate">{r.path || "/"}</span>
                  <span className="text-[#7b8194] truncate hidden sm:block">
                    {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                  </span>
                  <span className="font-mono text-[#5d6376] shrink-0">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, live }: { label: string; value: number; live?: boolean }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[#7b8194]">{label}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-2xl font-semibold font-mono tabular-nums">{value}</span>
        {live && <span className="size-1.5 rounded-full bg-emerald-400 pulse-dot" />}
      </div>
    </div>
  );
}

function Panel({
  title,
  rows,
  icon,
}: {
  title: string;
  rows: { key: string; count: number }[];
  icon?: React.ReactNode;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl border border-[#1c1f28] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1c1f28] flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#7b8194]">
        {icon}
        {title}
      </div>
      <div className="p-3">
        {rows.length === 0 ? (
          <div className="px-2 py-8 text-center text-xs text-[#7b8194]">No data yet.</div>
        ) : (
          <div className="space-y-1">
            {rows.slice(0, 8).map((r) => (
              <div key={r.key} className="relative rounded px-2.5 py-2 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded bg-indigo-500/12"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
                <div className="relative flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-[#c4c9d6]">{r.key}</span>
                  <span className="font-mono tabular-nums text-[#7b8194] shrink-0">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ series }: { series: { label: string; count: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const w = 100;
  const h = 32;
  // Inset the baseline so a flat zero-line still renders instead of being
  // clipped against the bottom edge.
  const pts = series.map((s, i) => {
    const x = series.length > 1 ? (i / (series.length - 1)) * w : 0;
    const y = h - 1 - (s.count / max) * (h - 3);
    return `${x},${y}`;
  });

  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-[#7b8194] mb-3">
        Last 14 days
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-28">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {pts.length > 1 && (
          <>
            <polygon fill="url(#tg)" points={`0,${h} ${pts.join(" ")} ${w},${h}`} />
            <polyline
              fill="none"
              stroke="#818cf8"
              strokeWidth="0.8"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              points={pts.join(" ")}
            />
          </>
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-mono text-[#5d6376]">
        <span>{series[0]?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function rank(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function buildSeries(rows: Row[]) {
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: rows.filter((r) => r.created_at?.slice(0, 10) === key).length,
    });
  }
  return days;
}
