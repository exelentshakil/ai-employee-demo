"use client";

import Link from "next/link";
import { Bot, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Nav({ modelStatus }: { modelStatus?: string }) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-line">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="size-9 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center">
            <Bot className="size-[18px] text-accent" />
          </span>
          <span className="font-semibold tracking-tight">AI Employee</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {modelStatus && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border border-line bg-panel-2 text-muted">
              <span className="size-1.5 rounded-full bg-ok pulse-dot" />
              {modelStatus}
            </span>
          )}
          <a
            href="https://github.com/exelentshakil/ai-employee-demo"
            target="_blank"
            rel="noreferrer"
            className="size-9 rounded-lg border border-line bg-panel-2 text-muted flex items-center justify-center transition-colors hover:text-accent hover:border-accent/40"
            aria-label="Source on GitHub"
          >
            <Github className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
