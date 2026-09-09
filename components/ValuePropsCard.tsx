"use client";

import { Waves, MapPin, Wind, Navigation, ShieldCheck } from "lucide-react";

// 사이드바 하단: 서프위키Ai만의 차별화 포인트 하이라이트 카드
export default function ValuePropsCard() {
  const items = [
    {
      icon: Waves,
      title: "실시간 AI 파도 점수",
      desc: "해양 예보 기반 초보/중급/상급 입수 점수",
    },
    {
      icon: MapPin,
      title: "전국 86개 스팟 통합",
      desc: "동해·남해·제주·서해를 한 장의 지도에",
    },
    {
      icon: Wind,
      title: "오프쇼어 풍향 필터",
      desc: "스팟별 최적 바람 방향까지 필터링",
    },
    {
      icon: Navigation,
      title: "카카오 내비 원클릭",
      desc: "클릭 한 번으로 바로 길찾기 안내",
    },
    {
      icon: ShieldCheck,
      title: "안전 꿀팁 자동 생성",
      desc: "물때·암초·위험 스팟을 입수 전 경고",
    },
  ];

  return (
    <div className="rounded-2xl p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-lg relative overflow-hidden">
      {/* 배경 장식 글로우 */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-sky-500/25 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-20 h-20 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">
            ONLY HERE
          </span>
          <span className="text-[11px] font-black tracking-tight text-white">
            대한민국 유일, 이것까지 되는 서핑 지도
          </span>
        </div>

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.title} className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <item.icon size={11} className="text-sky-300" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold leading-tight">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-300/90 leading-snug">
                  {item.desc}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400">
            매일 실시간 해양 예보 자동 갱신
          </span>
          <span className="text-[9px] font-black text-sky-300">서프위키Ai</span>
        </div>
      </div>
    </div>
  );
}
