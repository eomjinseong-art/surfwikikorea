"use client";

import { useState } from "react";
import { Waves, MapPin, Wind, Navigation, ShieldCheck, Video, ChevronDown, Share2, Check } from "lucide-react";

// 사이드바 하단: 서프위키Ai만의 차별화 포인트 하이라이트 카드 (펼침/접기) + 공유 기능
export default function ValuePropsCard() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const items = [
    {
      icon: Waves,
      title: "실시간 AI 파도 점수",
      desc: "해양 예보 기반 초보/중급/상급 입수 점수",
    },
    {
      icon: Video,
      title: "전국 30곳 해변 웹캠",
      desc: "입수 전 실시간 파도 영상으로 직접 확인",
    },
    {
      icon: MapPin,
      title: "전국 100개 스팟 통합",
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

  const handleShare = async () => {
    const url = "https://surfwikikorea.vercel.app";
    const shareData = {
      title: "서프위키Ai — 대한민국 전국 실시간 서핑 지도",
      text: "전국 100개 서핑 스팟 · 실시간 AI 파도 점수 · 해변 웹캠 한 번에! 🏄‍♂️",
      url,
    };

    try {
      // 모바일 네이티브 공유 (카카오톡, 메시지 등)
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // 사용자가 공유를 취소한 경우 등 — fallback으로 계속
    }

    // 데스크톱 / 공유 API 미지원 시: 링크 복사
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 실패 시 prompt
      window.prompt("이 링크를 복사하세요:", url);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-lg relative overflow-hidden">
      {/* 배경 장식 글로우 */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-sky-500/25 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-20 h-20 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

      <button
        onClick={() => setOpen(!open)}
        className="relative w-full text-left p-3"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 shrink-0">
              ONLY HERE
            </span>
            <span className="text-[11px] font-black tracking-tight truncate">
              대한민국 유일 · 100개 스팟 · 실시간 AI 점수 · 해변 웹캠
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-sky-300 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
        {!open && (
          <div className="mt-1 text-[9px] font-bold text-slate-400">
            탭해서 서프위키만의 차별화 기능 펼쳐보기 →
          </div>
        )}
      </button>

      {open && (
        <div className="relative px-3 pb-3">
          <ul className="space-y-2 border-t border-white/10 pt-2.5">
            {items.map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="mt-0.5 w-5 h-5 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <item.icon size={11} className="text-sky-300" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold leading-tight">{item.title}</div>
                  <div className="text-[10px] text-slate-300/90 leading-snug">{item.desc}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* 공유 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-white font-extrabold text-[11px] rounded-xl transition shadow-md"
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>링크가 복사되었습니다!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>친구에게 서프위키 공유하기</span>
              </>
            )}
          </button>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400">매일 실시간 해양 예보 자동 갱신</span>
            <span className="text-[9px] font-black text-sky-300">서프위키Ai</span>
          </div>
        </div>
      )}
    </div>
  );
}
