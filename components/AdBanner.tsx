"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, X } from "lucide-react";

const ads = [
  {
    id: 1,
    title: "서핑 용품 및 로컬 숍 제휴 배너",
    desc: "SurfMaster 공식 제휴 배너 입점 준비 중입니다.",
    tag: "입점준비중",
    tagBg: "bg-sky-100 text-sky-700",
    url: "#",
    isPartner: true,
  },
  {
    id: 2,
    title: "아브아르 (AVOIR)",
    desc: "트렌디하고 감각적인 데일리 여성의류 쇼핑몰",
    tag: "패션/쇼핑",
    tagBg: "bg-pink-100 text-pink-700",
    url: "https://avoir24.com/",
  },
  {
    id: 3,
    title: "그날의 남녀",
    desc: "우리의 연애 케미는 몇 점? 실시간 커플 궁합 테스트",
    tag: "연애/심리",
    tagBg: "bg-purple-100 text-purple-700",
    url: "https://couple-score.vercel.app/",
  },
  {
    id: 4,
    title: "나두 Ai",
    desc: "생산성을 극대화하는 최신 AI 툴 모음 및 가이드",
    tag: "AI/테크",
    tagBg: "bg-indigo-100 text-indigo-700",
    url: "https://ai-tools-site-liart-one.vercel.app/",
  },
  {
    id: 5,
    title: "숨숨마을",
    desc: "반려묘 및 반려동물을 위한 행복한 필수 용품 큐레이션",
    tag: "반려동물",
    tagBg: "bg-amber-100 text-amber-700",
    url: "https://b-cat-cpang.vercel.app/",
  },
];

export default function AdBanner({ onRequestOpen }: { onRequestOpen?: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isPaused || isMinimized) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ads.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, isMinimized]);

  const currentAd = ads[currentIdx];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % ads.length);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-4 z-[999]">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 border border-slate-700 hover:bg-slate-800 transition"
        >
          <Megaphone size={13} className="text-sky-400" />
          <span>추천 링크 ({currentIdx + 1}/5)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-xl z-[999] transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-white">AD</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${currentAd.tagBg}`}>
            {currentAd.tag}
          </span>
        </div>

        <a
          href={currentAd.url}
          target={currentAd.url !== "#" ? "_blank" : "_self"}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (currentAd.isPartner && onRequestOpen) {
              e.preventDefault();
              onRequestOpen();
            }
          }}
          className="flex-1 min-w-0 flex items-center gap-1.5 group cursor-pointer text-left"
        >
          <div className="truncate">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-800 group-hover:text-sky-600 transition truncate">
                {currentAd.title}
              </span>
              <ExternalLink size={11} className="text-slate-400 group-hover:text-sky-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {currentAd.desc}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <span className="text-[10px] font-semibold text-slate-400 mr-1">
            {currentIdx + 1}/{ads.length}
          </span>
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            title="이전 광고"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            title="다음 광고"
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition ml-1"
            title="광고 최소화"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
