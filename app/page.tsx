"use client";

import { useState, useMemo, useEffect } from "react";
import spotsData from "@/data/spots.json";
import accommodationsData from "@/data/accommodations.json";
import Map from "@/components/Map";
import SpotDrawer from "@/components/SpotDrawer";
import { AdSlot1, WaveParkAd } from "@/components/AdBanner";
import ValuePropsCard from "@/components/ValuePropsCard";
import MobileBottomBar from "@/components/MobileBottomBar";
import { getBatchConditionsCached } from "@/lib/batchConditions";
import { CAM_SPOT_IDS, getCamForSpot } from "@/lib/beachCams";
import SpotRequestModal from "@/components/SpotRequestModal";
import Link from "next/link";
import { PlusCircle, RotateCcw, Search, Compass, Layers, ChevronRight, BedDouble, ExternalLink, Star, Video } from "lucide-react";

const CONDITION_OPTIONS = [
  { label: "전체", value: "전체", color: "" },
  { label: "최고", value: "최고", color: "#2563eb" },
  { label: "훌륭", value: "훌륭", color: "#0891b2" },
  { label: "좋음", value: "좋음", color: "#059669" },
  { label: "보통", value: "보통", color: "#f59e0b" },
  { label: "잠잠", value: "잠잠", color: "#94a3b8" },
];

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("전체");
  const [activeDifficulty, setActiveDifficulty] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "map" | "cams">("map");
  const [activeWindFilter, setActiveWindFilter] = useState("전체");
  const [activeBottomFilter, setActiveBottomFilter] = useState("전체");
  const [activeConditionFilter, setActiveConditionFilter] = useState("전체");
  const [contentTab, setContentTab] = useState<"spots" | "stays">("spots");
  const [stayRegion, setStayRegion] = useState("전체");
  const [batchConds, setBatchConds] = useState<Record<string, any>>({});
  const [favs, setFavs] = useState<string[]>([]);

  const regions = ["전체", "동해", "남해", "제주", "서해"];
  const difficulties = [
    { label: "전체 난이도", value: "전체" },
    { label: "초보 입문", value: "Beginner" },
    { label: "중급자", value: "Intermediate" },
    { label: "상급자 전용", value: "Advanced" },
  ];
  const windOptions = ["전체", "북(N)", "북동(NE)", "동(E)", "남동(SE)", "남(S)", "남서(SW)", "서(W)", "북서(NW)"];
  const bottomOptions = ["전체", "모래", "자갈", "암반", "혼합"];
  const stayRegions = ["전체", "동해", "남해", "제주", "서해", "미분류"];
  const regionEmoji: Record<string, string> = { "동해": "🌅", "남해": "🏝️", "제주": "🌋", "서해": "🌇", "미분류": "📍" };

  const handleResetAll = () => {
    setActiveRegion("전체");
    setActiveDifficulty("전체");
    setSearchQuery("");
    setSelectedSpot(null);
    setActiveWindFilter("전체");
    setActiveBottomFilter("전체");
    setActiveConditionFilter("전체");
  };

  // 다차원 필터링 (지역 + 난이도 + 검색어 + 바람 + 바닥 + 컨디션)
  const filteredSpots = useMemo(() => {
    const list = spotsData.filter((spot) => {
      if (activeRegion !== "전체" && spot.region !== activeRegion) return false;
      if (activeDifficulty !== "전체") {
        if (activeDifficulty === "Beginner" && spot.difficulty !== "Beginner" && spot.difficulty !== "All") return false;
        if (activeDifficulty === "Intermediate" && spot.difficulty !== "Intermediate" && spot.difficulty !== "All") return false;
        if (activeDifficulty === "Advanced" && spot.difficulty !== "Advanced") return false;
      }
      if (activeWindFilter !== "전체") {
        const windMap: Record<string, string[]> = {
          "북(N)": ["N", "북"], "북동(NE)": ["NE", "북동"], "동(E)": ["E", "동"],
          "남동(SE)": ["SE", "남동"], "남(S)": ["S", "남"], "남서(SW)": ["SW", "남서"],
          "서(W)": ["W", "서"], "북서(NW)": ["NW", "북서"],
        };
        const keys = windMap[activeWindFilter] || [];
        const dir = String((spot as any).optimalWindDir ?? "");
        if (!keys.some((k) => dir.includes(k))) return false;
      }
      if (activeBottomFilter !== "전체") {
        const bt = ((spot as any).bottomType ?? "").toLowerCase();
        const filterMap: Record<string, string[]> = {
          "모래": ["sand", "모래"], "자갈": ["pebble", "gravel", "자갈"],
          "암반": ["reef", "rock", "암반"], "혼합": ["mixed", "혼합"],
        };
        const keys = filterMap[activeBottomFilter] || [];
        if (!keys.some((k) => bt.includes(k))) return false;
      }
      // 컨디션 필터
      if (activeConditionFilter !== "전체") {
        const cond = batchConds[spot.id];
        if (!cond || cond.conditionLabel !== activeConditionFilter) return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(query);
        const matchSub = spot.subRegion.toLowerCase().includes(query);
        const matchDesc = spot.description.toLowerCase().includes(query);
        const matchRegion = spot.region.toLowerCase().includes(query);
        if (!matchName && !matchSub && !matchDesc && !matchRegion) return false;
      }
      return true;
    });

    const levelKey = activeDifficulty === "Beginner" ? "beginner" : activeDifficulty === "Intermediate" ? "intermediate" : activeDifficulty === "Advanced" ? "advanced" : null;
    const scoreOf = (s: any) => {
      const c = batchConds[s.id];
      if (!c) return -1;
      return levelKey ? c[levelKey] : Math.max(c.beginner, c.intermediate, c.advanced);
    };
    return [...list].sort((a: any, b: any) => {
      const fa = favs.includes(a.id) ? 1 : 0;
      const fb = favs.includes(b.id) ? 1 : 0;
      if (fa !== fb) return fb - fa;
      // 컨디션 필터 활성 시 항상 점수순
      if (activeConditionFilter !== "전체" || levelKey) return scoreOf(b) - scoreOf(a);
      return 0;
    });
  }, [activeRegion, activeDifficulty, searchQuery, activeWindFilter, activeBottomFilter, activeConditionFilter, batchConds, favs]);

  const groupedStays = useMemo(() => {
    const filtered = accommodationsData.filter((a) => stayRegion === "전체" || a.region === stayRegion);
    const order = ["동해", "남해", "제주", "서해", "미분류"];
    return order.map((region) => ({ region, items: filtered.filter((a) => a.region === region) })).filter((g) => g.items.length > 0);
  }, [stayRegion]);

  const hotSpots = useMemo(() => {
    return spotsData
      .map((s: any) => ({ spot: s, cond: batchConds[s.id] }))
      .filter((x: any) => x.cond && (x.cond.conditionLabel === "훌륭" || x.cond.conditionLabel === "최고"))
      .sort((a: any, b: any) => Math.max(b.cond.intermediate, b.cond.advanced) - Math.max(a.cond.intermediate, a.cond.advanced))
      .slice(0, 8);
  }, [batchConds]);

  const [camSpots] = useMemo(() => {
    return [spotsData.filter((s: any) => batchConds[s.id] && CAM_SPOT_IDS.has(s.id))];
  }, [batchConds]);

  // 컨디션별 카운트 (범례 칩에 개수 표시)
  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = { "최고": 0, "훌륭": 0, "좋음": 0, "보통": 0, "잠잠": 0 };
    Object.values(batchConds).forEach((c: any) => {
      if (c.conditionLabel && counts[c.conditionLabel] !== undefined) {
        counts[c.conditionLabel]++;
      }
    });
    return counts;
  }, [batchConds]);

  const handleSelectSpot = (spot: any) => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && mobileTab !== "map") {
      setMobileTab("map");
    }
    setSelectedSpot(spot);
  };

  const handleSelectCamSpot = handleSelectSpot;
  const camBeachCode = (spotId: string) => getCamForSpot(spotId)?.beachCode ?? "";

  const handleSearchInput = (v: string) => {
    setSearchQuery(v);
    if (v.trim() && typeof window !== "undefined" && window.innerWidth < 768 && mobileTab === "map") {
      setMobileTab("list");
    }
  };

  // 컨디션 필터: 지도 범례에서 클릭 → 목록 탭 전환 + 필터 적용
  const handleConditionFilter = (value: string) => {
    setActiveConditionFilter(value);
    setContentTab("spots");
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileTab("list");
    }
  };

  useEffect(() => {
    let alive = true;
    getBatchConditionsCached(spotsData).then((data) => {
      if (alive && data && Object.keys(data).length > 0) setBatchConds(data);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("surfwiki-favs");
      if (saved) setFavs(JSON.parse(saved));
    } catch {}
  }, []);
  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem("surfwiki-favs", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col md:flex-row bg-slate-100">

      {/* ── 모바일 타이틀바 (최상단 고정) ── */}
      <div className="mobile-title-bar md:hidden fixed left-0 right-0 z-[700] flex items-center justify-between bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-sm border-b border-slate-200/80">
        <button onClick={handleResetAll} className="flex items-center gap-1.5 group" title="전체 초기화">
          <span className="text-lg">🏄‍♂️</span>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition leading-tight">서프위키Ai</h1>
            <p className="text-[8px] font-semibold text-slate-400 leading-tight">전국 실시간 서핑 지도</p>
          </div>
        </button>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 rounded-lg text-[10px] font-extrabold shadow-sm transition flex items-center gap-1 shrink-0"
        >
          <PlusCircle size={11} />
          <span>스팟 제보</span>
        </button>
      </div>

      {/* 1. 좌측 탐색 사이드 패널 */}
      <aside
        className={`w-full md:w-[420px] md:min-w-[420px] h-full bg-white border-r border-slate-200/90 flex flex-col z-20 shadow-xl transition-all duration-300 mobile-panel-top mobile-panel-bottom md:pt-0 md:pb-0 ${
          mobileTab === "map" || mobileTab === "cams" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* 타이틀 & 초기화 (데스크톱 전용 — 모바일은 상단 고정 바로 대체) */}
        <div className="hidden md:flex p-4 border-b border-slate-100 items-center justify-between bg-white shrink-0">
          <button onClick={handleResetAll} className="flex items-center gap-2 group text-left" title="전체 필터 초기화">
            <span className="text-2xl group-hover:rotate-12 transition-transform">🏄‍♂️</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition">서프위키Ai</h1>
                <RotateCcw size={13} className="text-slate-400 group-hover:text-sky-500 group-hover:rotate-180 transition-all" />
              </div>
              <p className="text-[10px] font-semibold text-slate-400">전국 실시간 서핑 지도 & AI 가이드</p>
            </div>
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1 shrink-0"
          >
            <PlusCircle size={13} />
            <span>스팟 제보</span>
          </button>
        </div>

        {/* 스팟 | 숙소 전환 탭 */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setContentTab("spots")}
              className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                contentTab === "spots" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏄 스팟 ({spotsData.length})
            </button>
            <button
              onClick={() => setContentTab("stays")}
              className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                contentTab === "stays" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏨 숙소 ({accommodationsData.length})
            </button>
          </div>
        </div>

        {/* 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AdSlot1 onRequestOpen={() => setIsRequestModalOpen(true)} />
          <WaveParkAd />

          {contentTab === "spots" && (
          <>
          <form onSubmit={(e) => e.preventDefault()} className="relative" role="search">
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 focus-within:border-sky-500 focus-within:bg-white transition">
              <Search size={15} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="search" inputMode="search" enterKeyHint="search"
                placeholder="해변·지역 검색 (예: 죽도, 송정, 부산, 제주...)"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-xs ml-1">✕</button>
              )}
              <button type="submit" className="ml-1.5 shrink-0 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-extrabold rounded-xl transition">검색</button>
            </div>
            {searchQuery.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full mt-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5">
                &quot;{searchQuery}&quot; 검색 결과 {filteredSpots.length}개 스팟
                {filteredSpots.length === 0 && " — 다른 키워드로 검색해 보세요"}
              </div>
            )}
          </form>

          {/* 권역별 탭 */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
              <Compass size={12} className="text-sky-500" />
              <span>해역 권역 선택</span>
            </label>
            <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl">
              {regions.map((r) => (
                <button key={r} onClick={() => setActiveRegion(r)}
                  className={`py-1.5 text-xs font-extrabold rounded-xl transition ${activeRegion === r ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* 난이도 선택 필터 */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
              <Layers size={12} className="text-sky-500" />
              <span>서퍼 숙련도 레벨</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {difficulties.map((d) => (
                <button key={d.value} onClick={() => setActiveDifficulty(d.value)}
                  className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border transition truncate ${activeDifficulty === d.value ? "bg-sky-50 border-sky-500 text-sky-700 shadow-xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >{d.label}</button>
              ))}
            </div>
          </div>

          {/* 🌊 파도 컨디션 필터 (NEW) */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
              <span className="text-sky-500">🌊</span>
              <span>실시간 파도 컨디션</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveConditionFilter(opt.value)}
                  className={`py-1 px-2 text-[10px] font-bold rounded-xl border transition flex items-center gap-1 ${
                    activeConditionFilter === opt.value
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.color && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                  )}
                  {opt.label}
                  {opt.value !== "전체" && conditionCounts[opt.value] !== undefined && (
                    <span className="text-[8px] text-slate-400 font-extrabold">{conditionCounts[opt.value]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 바람 방향 필터 */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
              <span className="text-sky-500">💨</span>
              <span>최적 바람 방향</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {windOptions.map((w) => (
                <button key={w} onClick={() => setActiveWindFilter(w)}
                  className={`py-1 px-2 text-[10px] font-bold rounded-xl border transition ${activeWindFilter === w ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >{w}</button>
              ))}
            </div>
          </div>

          {/* 바닥 타입 필터 */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
              <span className="text-sky-500">🪨</span>
              <span>바닥 타입</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {bottomOptions.map((b) => (
                <button key={b} onClick={() => setActiveBottomFilter(b)}
                  className={`py-1 px-2 text-[10px] font-bold rounded-xl border transition ${activeBottomFilter === b ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >{b}</button>
              ))}
            </div>
          </div>

          {/* 웹캠 퀵 스트립 */}
          {camSpots.length > 0 && (
            <div className="-mx-1 px-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  실시간 웹캠 {camSpots.length}곳
                </span>
                <span className="text-[9px] text-slate-400">이미지: WSB FARM</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar overscroll-x-contain pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
                {camSpots.map((spot: any) => {
                  const cond = batchConds[spot.id];
                  return (
                    <button key={spot.id} onClick={() => handleSelectCamSpot(spot)}
                      className="shrink-0 w-24 text-left rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-sky-300 shadow-sm transition"
                      title={`${spot.name} 실시간 보기`}
                    >
                      <div className="relative h-14 bg-slate-200">
                        <img src={`/api/cam?beach=${camBeachCode(spot.id)}`} alt={`${spot.name} 실시간 스냅샷`} loading="lazy" className="w-full h-full object-cover" />
                        <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="px-1.5 py-1">
                        <div className="text-[9px] font-black text-slate-800 truncate">{spot.name}</div>
                        {cond && (
                          <span className="inline-block mt-0.5 text-[8px] font-extrabold px-1 rounded text-white" style={{ backgroundColor: cond.conditionColor }}>
                            {cond.waveHeight.toFixed(1)}m
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 스팟 목록 헤더 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-black text-slate-800">
              {activeConditionFilter !== "전체" && (
                <span className="inline-flex items-center gap-1 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CONDITION_OPTIONS.find(o => o.value === activeConditionFilter)?.color }} />
                </span>
              )}
              {activeConditionFilter !== "전체" ? `${activeConditionFilter} 컨디션 스팟` : "추천 서핑 스팟"}{" "}
              <span className="text-sky-600 font-extrabold">({filteredSpots.length}개)</span>
            </span>
            <span className="text-[10px] text-slate-400">클릭 시 지도로 이동</span>
          </div>

          {/* 스팟 카드 목록 */}
          <div className="space-y-2">
            {filteredSpots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                선택한 조건에 맞는 서핑 스팟이 없습니다.<br />
                <button onClick={handleResetAll} className="mt-2 px-3 py-1 bg-sky-100 text-sky-700 font-bold rounded-lg text-xs">필터 전체 초기화</button>
              </div>
            ) : (
              filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <div key={spot.id} onClick={() => handleSelectSpot(spot)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left group ${
                      isSelected ? "bg-sky-50/80 border-sky-500 shadow-md ring-1 ring-sky-400/40" : "bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">{spot.subRegion}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {spot.difficulty === "All" ? "초급~전체" : spot.difficulty === "Beginner" ? "초보 추천" : spot.difficulty === "Intermediate" ? "중급" : "상급 전용"}
                          </span>
                          {batchConds[spot.id] && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: batchConds[spot.id].conditionColor }}>
                              {batchConds[spot.id].conditionLabel} {batchConds[spot.id].waveHeight.toFixed(1)}m
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition">{spot.name}</h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleFav(spot.id); }}
                          className={`p-1 rounded-full transition ${favs.includes(spot.id) ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                          title={favs.includes(spot.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                        >
                          <Star size={14} fill={favs.includes(spot.id) ? "currentColor" : "none"} />
                        </button>
                        <ChevronRight size={16} className={`text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition ${isSelected ? "text-sky-500" : ""}`} />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{spot.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>바닥: {spot.bottomType}</span>
                      <span>최적풍향: {spot.optimalWindDir}° 오프쇼어</span>
                    </div>
                    <Link href={`/spot/${spot.id}`} onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 inline-block text-[10px] font-bold text-sky-500 hover:text-sky-700 transition"
                    >상세 정보 →</Link>
                  </div>
                );
              })
            )}
          </div>
          </>
          )}

          {/* 숙소 탭 */}
          {contentTab === "stays" && (
            <>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
                  <BedDouble size={12} className="text-sky-500" />
                  <span>숙소 지역 선택</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {stayRegions.map((r) => (
                    <button key={r} onClick={() => setStayRegion(r)}
                      className={`py-1.5 px-2.5 text-[10px] font-bold rounded-xl border transition ${stayRegion === r ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >{r}</button>
                  ))}
                </div>
              </div>
              {groupedStays.map((group) => (
                <div key={group.region} className="space-y-2">
                  <div className="flex items-center justify-between py-1.5 -mx-1 px-1 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>{regionEmoji[group.region] ?? "📍"}</span>
                      <span>{group.region}</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-sky-600">{group.items.length}개</span>
                  </div>
                  {group.items.map((stay) => (
                    <a key={stay.id} href={stay.couponUrl} target="_blank" rel="sponsored noopener noreferrer"
                      className="block rounded-2xl border bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all group overflow-hidden"
                    >
                      {stay.image && (
                        <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                          <img src={stay.image} alt={stay.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/90 text-slate-700 shadow-sm">쿠팡트립 예약가능</span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{stay.subRegion || stay.region}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition truncate">{stay.name}</h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{stay.desc}</p>
                          </div>
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500 transition shrink-0 mt-1" />
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <span className="flex-1 py-1.5 bg-sky-500 group-hover:bg-sky-600 text-white font-extrabold text-[11px] rounded-lg transition text-center">쿠팡에서 예약하기</span>
                          <span role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(stay.localSiteUrl, "_blank", "noopener"); }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >숙소 정보</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
              {groupedStays.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">해당 지역에 등록된 숙소가 없습니다.</div>
              )}
              <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
              </p>
            </>
          )}
        </div>

        {/* 사이드바 하단: 데스크톱에서만 ONLY HERE (모바일은 하단 고정) */}
        <div className="hidden md:block p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <ValuePropsCard />
        </div>
      </aside>

      {/* 2. 우측 인터랙티브 지도 영역 */}
      <section className="flex-1 h-full relative overflow-hidden">
        {/* 모바일 탭 헤더 (타이틀바 바로 아래) */}
        <div className="mobile-tab-header md:hidden fixed left-0 right-0 z-[600] flex justify-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-sm border-b border-slate-200">
          <button onClick={() => setMobileTab("list")}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition ${mobileTab === "list" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}
          >📋 목록 ({filteredSpots.length})</button>
          <button onClick={() => setMobileTab("map")}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition ${mobileTab === "map" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}
          >🗺️ 지도</button>
          <button onClick={() => setMobileTab("cams")}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition ${mobileTab === "cams" ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}
          >📹 실시간 ({camSpots.length})</button>
        </div>

        {/* CCTV 탭 */}
        {mobileTab === "cams" && (
          <div className="md:hidden absolute inset-0 z-[500] bg-slate-100 mobile-cams-top overflow-y-auto overscroll-contain">
            <div className="px-4 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-sm font-black text-slate-900">실시간 해변 웹캠 {camSpots.length}곳</h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">카드를 누르면 지도와 상세정보가 열립니다 · 이미지: WSB FARM</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-20">
              {camSpots.map((spot: any) => {
                const cond = batchConds[spot.id];
                return (
                  <button key={spot.id} onClick={() => handleSelectCamSpot(spot)}
                    className="text-left rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm active:scale-[0.98] transition"
                  >
                    <div className="relative h-24 bg-slate-200">
                      <img src={`/api/cam?beach=${camBeachCode(spot.id)}`} alt={`${spot.name} 실시간 스냅샷`} loading="lazy" className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded bg-black/60 text-white">LIVE</span>
                    </div>
                    <div className="p-2">
                      <div className="text-[11px] font-black text-slate-900 truncate">{spot.name}</div>
                      {cond && (
                        <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: cond.conditionColor }}>
                          {cond.conditionLabel} {cond.waveHeight.toFixed(1)}m
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 지도 */}
        <Map
          spots={filteredSpots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          activeRegion={activeRegion}
          setMobileTab={setMobileTab}
          conditions={batchConds}
          userLevel={activeDifficulty}
          hotSpots={hotSpots}
          conditionCounts={conditionCounts}
          onConditionFilter={handleConditionFilter}
          activeConditionFilter={activeConditionFilter}
        />

        {/* 스팟 서랍 */}
        {selectedSpot && (
          <SpotDrawer spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
        )}
      </section>

      {/* 모바일 하단 고정: ONLY HERE + 공유 */}
      <MobileBottomBar />

      {/* 서핑 스팟 제보 모달 */}
      <SpotRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </main>
  );
}
