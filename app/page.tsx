"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import spotsData from "@/data/spots.json";
import accommodationsData from "@/data/accommodations.json";
import Map from "@/components/Map";
import SpotDrawer from "@/components/SpotDrawer";
import { AdSlot1, WaveParkAd } from "@/components/AdBanner";
import ValuePropsCard from "@/components/ValuePropsCard";
import { getBatchConditionsCached } from "@/lib/batchConditions";
import { CAM_SPOT_IDS, getCamForSpot } from "@/lib/beachCams";
import SpotRequestModal from "@/components/SpotRequestModal";
import Link from "next/link";
import { PlusCircle, RotateCcw, Search, Compass, Layers, ChevronRight, BedDouble, ExternalLink, Star, Video, Flame } from "lucide-react";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("전체");
  const [activeDifficulty, setActiveDifficulty] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "map" | "cams">("map");
  const [activeWindFilter, setActiveWindFilter] = useState("전체");
  const [activeBottomFilter, setActiveBottomFilter] = useState("전체");
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

  // 1. 전체 초기화 (로고 클릭 시)
  const handleResetAll = () => {
    setActiveRegion("전체");
    setActiveDifficulty("전체");
    setSearchQuery("");
    setSelectedSpot(null);
    setActiveWindFilter("전체");
    setActiveBottomFilter("전체");
  };

  // 2. 다차원 필터링 (지역 + 난이도 + 검색어 + 바람 + 바닥)
  const filteredSpots = useMemo(() => {
    const list = spotsData.filter((spot) => {
      // 지역 조건
      if (activeRegion !== "전체" && spot.region !== activeRegion) return false;
      
      // 난이도 조건
      if (activeDifficulty !== "전체") {
        if (activeDifficulty === "Beginner" && spot.difficulty !== "Beginner" && spot.difficulty !== "All") return false;
        if (activeDifficulty === "Intermediate" && spot.difficulty !== "Intermediate" && spot.difficulty !== "All") return false;
        if (activeDifficulty === "Advanced" && spot.difficulty !== "Advanced") return false;
      }

      // 바람 방향 조건
      if (activeWindFilter !== "전체") {
        const windMap: Record<string, string[]> = {
          "북(N)": ["N", "북"],
          "북동(NE)": ["NE", "북동"],
          "동(E)": ["E", "동"],
          "남동(SE)": ["SE", "남동"],
          "남(S)": ["S", "남"],
          "남서(SW)": ["SW", "남서"],
          "서(W)": ["W", "서"],
          "북서(NW)": ["NW", "북서"],
        };
        const keys = windMap[activeWindFilter] || [];
        const dir = String((spot as any).optimalWindDir ?? "");
        if (!keys.some((k) => dir.includes(k))) return false;
      }

      // 바닥 타입 조건
      if (activeBottomFilter !== "전체") {
        const bt = ((spot as any).bottomType ?? "").toLowerCase();
        const filterMap: Record<string, string[]> = {
          "모래": ["sand", "모래"],
          "자갈": ["pebble", "gravel", "자갈"],
          "암반": ["reef", "rock", "암반"],
          "혼합": ["mixed", "혼합"],
        };
        const keys = filterMap[activeBottomFilter] || [];
        if (!keys.some((k) => bt.includes(k))) return false;
      }

      // 검색어 조건 (이름/하위지역/설명/지역 모두 대상)
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

    // 내 레벨 선택 시 해당 레벨 점수순 정렬 + 즐겨찾기 최상단
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
      if (levelKey) return scoreOf(b) - scoreOf(a);
      return 0;
    });
  }, [activeRegion, activeDifficulty, searchQuery, activeWindFilter, activeBottomFilter, batchConds, favs]);

  // 숙소: 지역별 그룹핑
  const groupedStays = useMemo(() => {
    const filtered = accommodationsData.filter(
      (a) => stayRegion === "전체" || a.region === stayRegion
    );
    const order = ["동해", "남해", "제주", "서해", "미분류"];
    return order
      .map((region) => ({ region, items: filtered.filter((a) => a.region === region) }))
      .filter((g) => g.items.length > 0);
  }, [stayRegion]);

  // 지도 상단 플로팅: 지금 파도 핫한 스팟 (훌륭/최고만, 점수순 최대 8개)
  const hotSpots = useMemo(() => {
    const scored = spotsData
      .map((s: any) => ({ spot: s, cond: batchConds[s.id] }))
      .filter((x: any) => x.cond && (x.cond.conditionLabel === "훌륭" || x.cond.conditionLabel === "최고"))
      .sort((a: any, b: any) => Math.max(b.cond.intermediate, b.cond.advanced) - Math.max(a.cond.intermediate, a.cond.advanced))
      .slice(0, 8);
    return scored;
  }, [batchConds]);

  // CCTV 탭: 웹캠 있는 스팟
  const [camSpots] = useMemo(() => {
    const list = spotsData.filter((s: any) => batchConds[s.id] && CAM_SPOT_IDS.has(s.id));
    return [list];
  }, [batchConds]);

  // 통합 스팟 오픈: 목록·지도·핫스팟 칩·웹캠 어디에서 눌러도 동일하게 동작한다.
  // 모바일에서는 지도 탭으로 전환한 뒤 서랍을 열어 "눌렀는데 아무 반응 없음"을 방지한다.
  const handleSelectSpot = (spot: any) => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && mobileTab !== "map") {
      setMobileTab("map");
    }
    setSelectedSpot(spot);
  };

  // CCTV 탭에서 카드 클릭: 지도로 전환 + 해당 스팟 서랍을 연다
  const handleSelectCamSpot = handleSelectSpot;

  const camBeachCode = (spotId: string) => getCamForSpot(spotId)?.beachCode ?? "";

  // 검색 시작 시 모바일이면 목록 뷰로 전환 (지도에서 검색이 안 되는 문제 해결)
  const handleSearchInput = (v: string) => {
    setSearchQuery(v);
    if (v.trim() && typeof window !== "undefined" && window.innerWidth < 768 && mobileTab === "map") {
      setMobileTab("list");
    }
  };

  // 실시간 컨디션 배치 조회 (10분 캐시)
  useEffect(() => {
    let alive = true;
    getBatchConditionsCached(spotsData).then((data) => {
      if (alive && data && Object.keys(data).length > 0) setBatchConds(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 즐겨찾기 (localStorage)
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
      {/* 1. 좌측 탐색 사이드 패널 */}
      <aside
        className={`w-full md:w-[420px] md:min-w-[420px] h-full bg-white border-r border-slate-200/90 flex flex-col z-20 shadow-xl transition-all duration-300 pt-12 md:pt-0 ${
          mobileTab === "map" || mobileTab === "cams" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* 타이틀 & 초기화 버튼 & 스팟 제보 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 group text-left"
            title="클릭 시 전체 필터 초기화"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">🏄‍♂️</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition">
                  서프위키Ai
                </h1>
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
                contentTab === "spots"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏄 스팟 ({spotsData.length})
            </button>
            <button
              onClick={() => setContentTab("stays")}
              className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                contentTab === "stays"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏨 숙소 ({accommodationsData.length})
            </button>
          </div>
        </div>

        {/* 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 광고 1: 상시 노출 최상단 프리미엄 고정 배너 */}
          <AdSlot1 onRequestOpen={() => setIsRequestModalOpen(true)} />

          {/* 광고 2: 웨이브파크 서핑 체험 (쿠팡 파트너스) */}
          <WaveParkAd />

          {/* 검색창 (폼 + 검색 버튼, 실시간 결과 수 표시) */}
          {contentTab === "spots" && (
          <>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative"
            role="search"
          >
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 focus-within:border-sky-500 focus-within:bg-white transition">
              <Search size={15} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                placeholder="해변·지역 검색 (예: 죽도, 송정, 부산, 제주...)"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 text-xs ml-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="ml-1.5 shrink-0 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-extrabold rounded-xl transition"
              >
                검색
              </button>
            </div>
            {searchQuery.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full mt-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5">
                  "{searchQuery}" 검색 결과 {filteredSpots.length}개 스팟
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
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className={`py-1.5 text-xs font-extrabold rounded-xl transition ${
                    activeRegion === r
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {r}
                </button>
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
                <button
                  key={d.value}
                  onClick={() => setActiveDifficulty(d.value)}
                  className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border transition truncate ${
                    activeDifficulty === d.value
                      ? "bg-sky-50 border-sky-500 text-sky-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d.label}
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
                <button
                  key={w}
                  onClick={() => setActiveWindFilter(w)}
                  className={`py-1 px-2 text-[10px] font-bold rounded-xl border transition ${
                    activeWindFilter === w
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {w}
                </button>
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
                <button
                  key={b}
                  onClick={() => setActiveBottomFilter(b)}
                  className={`py-1 px-2 text-[10px] font-bold rounded-xl border transition ${
                    activeBottomFilter === b
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 📹 실시간 웹캠 퀵 스트립: 실시간 파도를 먼저 확인 */}
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
                    <button
                      key={spot.id}
                      onClick={() => handleSelectCamSpot(spot)}
                      className="shrink-0 w-24 text-left rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-sky-300 shadow-sm transition"
                      title={`${spot.name} 실시간 보기`}
                    >
                      <div className="relative h-14 bg-slate-200">
                        <img
                          src={`/api/cam?beach=${camBeachCode(spot.id)}`}
                          alt={`${spot.name} 실시간 스냅샷`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="px-1.5 py-1">
                        <div className="text-[9px] font-black text-slate-800 truncate">{spot.name}</div>
                        {cond && (
                          <span
                            className="inline-block mt-0.5 text-[8px] font-extrabold px-1 rounded text-white"
                            style={{ backgroundColor: cond.conditionColor }}
                          >
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
              추천 서핑 스팟 <span className="text-sky-600 font-extrabold">({filteredSpots.length}개)</span>
            </span>
            <span className="text-[10px] text-slate-400">클릭 시 우측 지도로 이동</span>
          </div>

          {/* 스팟 카드 목록 */}
          <div className="space-y-2">
            {filteredSpots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                선택한 조건에 맞는 서핑 스팟이 없습니다.<br />
                <button
                  onClick={handleResetAll}
                  className="mt-2 px-3 py-1 bg-sky-100 text-sky-700 font-bold rounded-lg text-xs"
                >
                  필터 전체 초기화
                </button>
              </div>
            ) : (
              filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => handleSelectSpot(spot)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left group ${
                      isSelected
                        ? "bg-sky-50/80 border-sky-500 shadow-md ring-1 ring-sky-400/40"
                        : "bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                            {spot.subRegion}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {spot.difficulty === "All" ? "초급~전체" : spot.difficulty === "Beginner" ? "초보 추천" : spot.difficulty === "Intermediate" ? "중급" : "상급 전용"}
                          </span>
                          {batchConds[spot.id] && (
                            <span
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: batchConds[spot.id].conditionColor }}
                            >
                              {batchConds[spot.id].conditionLabel} {batchConds[spot.id].waveHeight.toFixed(1)}m
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition">
                          {spot.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFav(spot.id); }}
                          className={`p-1 rounded-full transition ${favs.includes(spot.id) ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                          title={favs.includes(spot.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                        >
                          <Star size={14} fill={favs.includes(spot.id) ? "currentColor" : "none"} />
                        </button>
                        <ChevronRight size={16} className={`text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition ${isSelected ? "text-sky-500" : ""}`} />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {spot.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>바닥: {spot.bottomType}</span>
                      <span>최적풍향: {spot.optimalWindDir}° 오프쇼어</span>
                    </div>
                    <Link
                      href={`/spot/${spot.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 inline-block text-[10px] font-bold text-sky-500 hover:text-sky-700 transition"
                    >
                      상세 정보 →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
          </>
          )}

          {/* 숙소 탭: 지역별 숙소 목록 */}
          {contentTab === "stays" && (
            <>
              {/* 숙소 지역 선택 */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 flex items-center gap-1">
                  <BedDouble size={12} className="text-sky-500" />
                  <span>숙소 지역 선택</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {stayRegions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setStayRegion(r)}
                      className={`py-1.5 px-2.5 text-[10px] font-bold rounded-xl border transition ${
                        stayRegion === r
                          ? "bg-sky-50 border-sky-500 text-sky-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지역별 그룹 섹션 */}
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
                    <a
                      key={stay.id}
                      href={stay.couponUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="block rounded-2xl border bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all group overflow-hidden"
                    >
                      {/* 숙소 대표 이미지 */}
                      {stay.image && (
                        <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                          <img
                            src={stay.image}
                            alt={stay.name}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/90 text-slate-700 shadow-sm">
                            쿠팡트립 예약가능
                          </span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                {stay.subRegion || stay.region}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition truncate">
                              {stay.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {stay.desc}
                            </p>
                          </div>
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500 transition shrink-0 mt-1" />
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <span className="flex-1 py-1.5 bg-sky-500 group-hover:bg-sky-600 text-white font-extrabold text-[11px] rounded-lg transition text-center">
                            쿠팡에서 예약하기
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(stay.localSiteUrl, "_blank", "noopener");
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            숙소 정보
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ))}

              {groupedStays.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  해당 지역에 등록된 숙소가 없습니다.
                </div>
              )}

              {/* 쿠팡 파트너스 제휴 고지 */}
              <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
              </p>
            </>
          )}
        </div>

        {/* 사이드바 하단: 차별화 포인트 하이라이트 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <ValuePropsCard />
        </div>
      </aside>

      {/* 2. 우측 인터랙티브 지도 영역 */}
      <section className="flex-1 h-full relative overflow-hidden">
        {/* 모바일 상단 고정 탭 헤더 (모바일 전용) */}
        <div className="mobile-tab-header md:hidden fixed left-0 right-0 z-[600] flex justify-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 shadow-md border-b border-slate-200">
          <button
            onClick={() => setMobileTab("list")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mobileTab === "list" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
            }`}
          >
            📋 목록 ({filteredSpots.length})
          </button>
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mobileTab === "map" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
            }`}
          >
            🗺️ 지도
          </button>
          <button
            onClick={() => setMobileTab("cams")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mobileTab === "cams" ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
            }`}
          >
            📹 실시간 ({camSpots.length})
          </button>
        </div>

        {/* 📹 실시간 CCTV 탭 (모바일 전용 풀스크린) */}
        {mobileTab === "cams" && (
          <div className="md:hidden absolute inset-0 z-[500] bg-slate-100 pt-[calc(env(safe-area-inset-top,0px)+56px)] overflow-y-auto overscroll-contain">
            <div className="px-4 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-sm font-black text-slate-900">실시간 해변 웹캠 {camSpots.length}곳</h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                카드를 누르면 지도와 상세정보(웹캠·AI 점수)가 열립니다 · 이미지 제공: WSB FARM
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-6">
              {camSpots.map((spot: any) => {
                const cond = batchConds[spot.id];
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSelectCamSpot(spot)}
                    className="text-left rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm active:scale-[0.98] transition"
                  >
                    <div className="relative h-24 bg-slate-200">
                      <img
                        src={`/api/cam?beach=${camBeachCode(spot.id)}`}
                        alt={`${spot.name} 실시간 스냅샷`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded bg-black/60 text-white">
                        LIVE
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="text-[11px] font-black text-slate-900 truncate">{spot.name}</div>
                      {cond && (
                        <span
                          className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: cond.conditionColor }}
                        >
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

        {/* 인터랙티브 지도 컴포넌트 */}
        <Map
          spots={filteredSpots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          activeRegion={activeRegion}
          setMobileTab={setMobileTab}
          conditions={batchConds}
          userLevel={activeDifficulty}
          hotSpots={hotSpots}
        />

        {/* 스팟 클릭 시 열리는 상세 서랍 (카카오맵 길찾기 내장) */}
        {selectedSpot && (
          <SpotDrawer
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
          />
        )}
      </section>

      {/* 서핑 스팟 제보 모달 (Formspree) */}
      <SpotRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </main>
  );
}
