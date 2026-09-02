import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = url && key ? createClient(url, key) : null;

function isMissingTable(error: { code?: string; message?: string }) {
  return error.code === "42P01" || (error.message ?? "").includes("schema cache");
}

export async function POST(req: Request) {
  try {
    const { path, userAgent, ip } = await req.json();

    let city: string | null = null;
    let region: string | null = null;
    let country: string | null = null;

    if (ip && !["unknown", "127.0.0.1", "::1"].includes(ip)) {
      try {
        const geo = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`
        ).then((r) => r.json());
        if (geo.status === "success") {
          city = geo.city ?? null;
          region = geo.regionName ?? null;
          country = geo.country ?? null;
        }
      } catch {
        /* geo lookup is best-effort */
      }
    }

    if (supabase) {
      const { error } = await supabase.from("traffic_logs").insert({
        path,
        ip_address: ip,
        city,
        region,
        country,
        user_agent: userAgent,
      });
      if (error && !isMissingTable(error)) {
        console.error("traffic insert failed:", error.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!supabase) {
    return NextResponse.json({ data: [], configured: false });
  }

  const limit = Number(new URL(req.url).searchParams.get("limit") || 500);

  const { data, error } = await supabase
    .from("traffic_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({
        data: [],
        configured: false,
        error: "traffic_logs table not created yet — run supabase_traffic.sql.",
      });
    }
    return NextResponse.json({ data: [], configured: true, error: error.message });
  }

  return NextResponse.json({ data: data ?? [], configured: true });
}
