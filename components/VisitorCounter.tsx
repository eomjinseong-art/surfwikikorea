"use client";

import { useEffect, useState } from "react";

/** 그날의 남녀(A-CoupleScore)와 동일: Abacus 공개 카운터 + 기기당 하루 1회 hit */
const VISITOR_COUNTER_NS = "surfwikikorea-app";
const VISITOR_COUNTER_KEY = "visits";
const VISITOR_COUNTER_BASE = "https://abacus.jasoncameron.dev";
const VISITOR_VISITED_STORAGE_KEY = "surfwikipedia_visit_marked_v1";

let sharedPromise: Promise<number | null> | null = null;

function loadVisitorCount(): Promise<number | null> {
  if (sharedPromise) return sharedPromise;
  sharedPromise = (async () => {
    let alreadyCountedToday = false;
    try {
      const today = new Date().toISOString().slice(0, 10);
      alreadyCountedToday = localStorage.getItem(VISITOR_VISITED_STORAGE_KEY) === today;
      if (!alreadyCountedToday) {
        localStorage.setItem(VISITOR_VISITED_STORAGE_KEY, today);
      }
    } catch {
      /* private mode 등: hit 허용 */
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
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadVisitorCount().then((n) => {
      if (!cancelled && n != null) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (count == null) return;
    const start = Math.max(0, count - Math.min(count, 40));
    let cur = start;
    setDisplay(cur);
    if (count - start <= 0) return;
    const step = Math.max(1, Math.ceil((count - start) / 20));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= count) {
        cur = count;
        clearInterval(timer);
      }
      setDisplay(cur);
    }, 24);
    return () => clearInterval(timer);
  }, [count]);

  const label =
    count == null ? (
      <span className="text-sky-400/80">방문자 불러오는 중…</span>
    ) : (
      <>
        <span className="font-extrabold tabular-nums text-sky-700">
          {display.toLocaleString()}
        </span>
        <span>명이 함께 보고 있어요</span>
      </>
    );

  if (variant === "inline") {
    if (count == null) return null;
    return (
      <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-slate-500 leading-tight">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] shrink-0" />
        {label}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[28px] text-[10px] font-semibold text-sky-800 bg-gradient-to-r from-sky-50 to-cyan-50 border-t border-sky-100/80">
      <span
        className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] shrink-0 ${
          count != null ? "animate-pulse" : "opacity-40"
        }`}
      />
      {label}
    </div>
  );
}
