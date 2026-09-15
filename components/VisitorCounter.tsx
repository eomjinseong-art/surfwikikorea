"use client";

import { useEffect, useState } from "react";

/** Abacus public counter: one /hit per local calendar day, else /get */
const VISITOR_COUNTER_NS = "surfwikikorea-app";
const VISITOR_COUNTER_KEY = "visits";
const VISITOR_COUNTER_BASE = "https://abacus.jasoncameron.dev";
const VISITOR_VISITED_STORAGE_KEY = "surfwikipedia_visit_marked_v1";

let sharedPromise: Promise<number | null> | null = null;

function localCalendarDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadVisitorCount(): Promise<number | null> {
  if (sharedPromise) return sharedPromise;
  sharedPromise = (async () => {
    let alreadyCountedToday = false;
    try {
      const today = localCalendarDate();
      alreadyCountedToday = localStorage.getItem(VISITOR_VISITED_STORAGE_KEY) === today;
      if (!alreadyCountedToday) {
        localStorage.setItem(VISITOR_VISITED_STORAGE_KEY, today);
      }
    } catch {
      /* private mode etc: allow hit */
    }

    const path = alreadyCountedToday ? "/get/" : "/hit/";
    const res = await fetch(
      `${VISITOR_COUNTER_BASE}${path}${VISITOR_COUNTER_NS}/${VISITOR_COUNTER_KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const n = parseInt(data?.value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  })().catch(() => null);

  return sharedPromise;
}

export default function VisitorCounter({
  variant = "bar",
}: {
  variant?: "bar" | "inline";
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadVisitorCount().then((n) => {
      if (!cancelled && n != null) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count == null) return null;

  const formatted = count.toLocaleString("ko-KR");
  const content = (
    <>
      <span aria-hidden>👁</span>
      <span className="tabular-nums">{formatted}</span>
    </>
  );

  if (variant === "inline") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[8px] font-semibold text-slate-500 leading-tight"
        title={formatted}
      >
        {content}
      </span>
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-1 px-3 py-1 min-h-[28px] text-[10px] font-medium text-slate-500"
      title={formatted}
    >
      {content}
    </div>
  );
}
