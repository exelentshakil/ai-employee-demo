"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TrafficTracker() {
  const pathname = usePathname();
  const seen = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("disable_tracking") === "true") return;
    if (!pathname || seen.current[pathname]) return;

    seen.current[pathname] = true;

    const send = (ip: string) =>
      fetch("/api/traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, userAgent: navigator.userAgent, ip }),
      }).catch(() => {});

    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => send(d.ip))
      .catch(() => send("unknown"));
  }, [pathname]);

  return null;
}
