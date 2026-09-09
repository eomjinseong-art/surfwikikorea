"use client";

import { ExternalLink, Sparkles } from "lucide-react";

export const ads2to5 = [
  {
    id: 2,
    title: "아브아르 (AVOIR)",
    desc: "감각적인 데일리 여성의류",
    tag: "패션",
    tagBg: "bg-pink-100 text-pink-700",
    url: "https://avoir24.com/",
    icon: "👗",
  },
  {
    id: 3,
    title: "그날의 남녀",
    desc: "실시간 커플 연애 궁합 테스트",
    tag: "연애",
    tagBg: "bg-purple-100 text-purple-700",
    url: "https://couple-score.vercel.app/",
    icon: "💑",
  },
  {
    id: 4,
    title: "나두 Ai",
    desc: "생산성 최고 AI 툴 모음",
    tag: "AI",
    tagBg: "bg-indigo-100 text-indigo-700",
    url: "https://ai-tools-site-liart-one.vercel.app/",
    icon: "🤖",
  },
  {
    id: 5,
    title: "숨숨마을",
    desc: "반려묘 & 반려동물 필수템",
    tag: "펫",
    tagBg: "bg-amber-100 text-amber-700",
    url: "https://b-cat-cpang.vercel.app/",
    icon: "🐱",
  },
];

// 상단 광고 1 (서핑 용품 & 제휴 숍 전용 고정 배너)
export function AdSlot1({ onRequestOpen }: { onRequestOpen?: () => void }) {
  return (
    <div
      onClick={onRequestOpen}
      className="p-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl text-white shadow-md cursor-pointer hover:shadow-lg transition group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏄</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">서핑 용품 & 숍 공식 입점</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white/25 rounded-md">광고 1</span>
            </div>
            <p className="text-[11px] text-sky-100 mt-0.5">
              서프위키 공식 제휴 스폰서 입점 준비 중 (제보/입점 문의)
            </p>
          </div>
        </div>
        <ExternalLink size={14} className="text-sky-200 group-hover:text-white transition shrink-0" />
      </div>
    </div>
  );
}

// 하단 상시 노출 광고: 한 줄 스크롤 스트립 (최소 공간)
export default function AdGrid() {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      <span className="text-[8px] font-black text-slate-400 tracking-wider shrink-0 pr-0.5">
        SPONSOR
      </span>
      {ads2to5.map((ad) => (
        <a
          key={ad.id}
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 rounded-full transition"
          title={ad.desc}
        >
          <span className="text-[11px]">{ad.icon}</span>
          <span className="text-[10px] font-bold text-slate-700 group-hover:text-sky-600 whitespace-nowrap">
            {ad.title}
          </span>
        </a>
      ))}
    </div>
  );
}
