"use client";

import { useState } from "react";
import { Share2, Check, ChevronUp } from "lucide-react";

export default function MobileBottomBar() {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleShare = async () => {
    const url = "https://surfwikikorea.vercel.app";
    const shareData = {
      title: "서프위키Ai — 대한민국 전국 실시간 서핑 지도",
      text: "전국 100개 서핑 스팟 · 실시간 AI 파도 점수 · 해변 웹캠 한 번에! 🏄‍♂️",
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("이 링크를 복사하세요:", url);
    }
  };

  return (
    <div className="mobile-bottom-bar md:hidden fixed left-0 right-0 z-[700]">
      {/* 펼침 패널 */}
      {expanded && (
        <div className="mx-3 mb-1.5 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl text-white text-[10px] shadow-lg border border-white/10 animate-slideUp">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sky-300">🌊</span>
              <span className="font-bold">실시간 AI 파도 점수</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-300">📹</span>
              <span className="font-bold">전국 30곳 해변 웹캠</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-300">📍</span>
              <span className="font-bold">전국 100개 스팟 통합 지도</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-300">🚗</span>
              <span className="font-bold">카카오 내비 원클릭 안내</span>
            </div>
          </div>
        </div>
      )}

      {/* 컴팩트 바 */}
      <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-2 border-t border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 shrink-0">
            ONLY HERE
          </span>
          <span className="text-[10px] font-black text-white truncate">
            100개 스팟 · AI 점수 · 웹캠
          </span>
          <ChevronUp
            size={12}
            className={`text-sky-300 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-extrabold text-[10px] rounded-full transition shrink-0"
        >
          {copied ? (
            <>
              <Check size={11} />
              <span>복사됨!</span>
            </>
          ) : (
            <>
              <Share2 size={11} />
              <span>공유</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
