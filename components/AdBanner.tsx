"use client";

import { ExternalLink, Sparkles } from "lucide-react";

// 상단 광고 1 (서핑용품 스토어 — 서프위키Ai 큐레이션 숍)
export function AdSlot1() {
  return (
    <a
      href="https://surfwikikoreacpang.vercel.app/"
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="block p-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl text-white shadow-md hover:shadow-lg transition group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏄</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">서핑용품 스토어 오픈!</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white/25 rounded-md">광고</span>
            </div>
            <p className="text-[11px] text-sky-100 mt-0.5">
              보드·슈트·왁스·리쉬 — 서프위키Ai 엄선 큐레이션 보러가기
            </p>
          </div>
        </div>
        <ExternalLink size={14} className="text-sky-200 group-hover:text-white transition shrink-0" />
      </div>
    </a>
  );
}

// 웨이브파크 서핑 체험 광고 (쿠팡 파트너스)
export function WaveParkAd() {
  return (
    <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-sky-50 overflow-hidden shadow-sm">
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌊</span>
          <span className="text-[10px] font-black text-cyan-800">시흥 웨이브파크 서핑 체험</span>
        </div>
        <span className="text-[8px] font-bold text-cyan-500/70 px-1.5 py-0.5 bg-cyan-100 rounded-md">쿠팡 제휴</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-cyan-100/50">
        <a
          href="https://link.coupang.com/a/gT8iUXvU0i"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-white hover:bg-cyan-50/50 transition group"
        >
          <span className="text-lg shrink-0">🏄‍♂️</span>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-cyan-700 transition truncate">서프존</div>
            <div className="text-[9px] text-slate-500 leading-tight">인공 파도에서 실전 서핑!</div>
          </div>
          <ExternalLink size={10} className="text-slate-300 group-hover:text-cyan-500 transition shrink-0 ml-auto" />
        </a>
        <a
          href="https://link.coupang.com/a/gT8lbc3LEG"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="flex items-center gap-2 p-2.5 bg-white hover:bg-cyan-50/50 transition group"
        >
          <span className="text-lg shrink-0">🏖️</span>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-cyan-700 transition truncate">미오코스타존</div>
            <div className="text-[9px] text-slate-500 leading-tight">워터파크 + 풀빌라 올인원</div>
          </div>
          <ExternalLink size={10} className="text-slate-300 group-hover:text-cyan-500 transition shrink-0 ml-auto" />
        </a>
      </div>
      <p className="text-[8px] text-slate-400 text-center py-1">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.
      </p>
    </div>
  );
}
