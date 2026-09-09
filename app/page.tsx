"use client";

import { useState, useMemo } from "react";
import spotsData from "@/data/spots.json";
import accommodationsData from "@/data/accommodations.json";
import Map from "@/components/Map";
import SpotDrawer from "@/components/SpotDrawer";
import AdGrid, { AdSlot1 } from "@/components/AdBanner";
import SpotRequestModal from "@/components/SpotRequestModal";
import { PlusCircle, RotateCcw, Search, Compass, Layers, ChevronRight, BedDouble, ExternalLink } from "lucide-react";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("전체");
  const [activeDifficulty, setActiveDifficulty] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "map">("map");
  const [activeWindFilter, setActiveWindFilter] = useState("전체");
  const [activeBottomFilter, setActiveBottomFilter] = useState("전체");
  const [contentTab, setContentTab] = useState<"spots" | "stays">("spots");
  const [stayRegion, setStayRegion] = useState("전체");

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
    return spotsData.filter((spot) => {
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

      // 검색어 조건
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(query);
        const matchSub = spot.subRegion.toLowerCase().includes(query);
        const matchDesc = spot.description.toLowerCase().includes(query);
        if (!matchName && !matchSub && !matchDesc) return false;
      }

      return true;
    });
  }, [activeRegion, activeDifficulty, searchQuery, activeWindFilter, activeBottomFilter]);

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

  const handleSelectSpot = (spot: any) => {
    setSelectedSpot(spot);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileTab("map");
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col md:flex-row bg-slate-100">
      {/* 1. 좌측 탐색 사이드 패널 */}
      <aside
        className={`w-full md:w-[420px] md:min-w-[420px] h-full bg-white border-r border-slate-200/90 flex flex-col z-20 shadow-xl transition-all duration-300 pt-12 md:pt-0 ${
          mobileTab === "map" ? "hidden md:flex" : "flex"
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

          {/* 검색창 */}
          {contentTab === "spots" && (
          <>
          <div className="relative">
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 focus-within:border-sky-500 focus-within:bg-white transition">
              <Search size={15} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="해변 검색 (예: 죽도, 송정, 중문, 만리포...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 text-xs ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

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
                        </div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition">
                          {spot.name}
                        </h3>
                      </div>
                      <ChevronRight size={16} className={`text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition ${isSelected ? "text-sky-500" : ""}`} />
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {spot.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>바닥: {spot.bottomType}</span>
                      <span>최적풍향: {spot.optimalWindDir}° 오프쇼어</span>
                    </div>
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
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-sm py-1.5 -mx-1 px-1 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>{regionEmoji[group.region] ?? "📍"}</span>
                      <span>{group.region}</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-sky-600">{group.items.length}개</span>
                  </div>
                  {group.items.map((stay) => (
                    <a
                      key={stay.id}
                      href={stay.url}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="block p-3 rounded-2xl border bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              쿠팡트립
                            </span>
                            {stay.subRegion && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {stay.subRegion}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition truncate">
                            {stay.name}
                          </h3>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-sky-500 transition shrink-0 mt-1" />
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

        {/* 사이드바 하단: 상시 노출 광고 2~5 그리드 */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <AdGrid />
        </div>
      </aside>

      {/* 2. 우측 인터랙티브 지도 영역 */}
      <section className="flex-1 h-full relative overflow-hidden">
        {/* 모바일 상단 고정 탭 헤더 (모바일 전용) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-[600] flex justify-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 shadow-md border-b border-slate-200">
          <button
            onClick={() => setMobileTab("list")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mobileTab === "list" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
            }`}
          >
            📋 스팟 목록 ({filteredSpots.length})
          </button>
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mobileTab === "map" ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
            }`}
          >
            🗺️ 지도 보기
          </button>
        </div>

        {/* 인터랙티브 지도 컴포넌트 */}
        <Map
          spots={filteredSpots}
          selectedSpot={selectedSpot}
          onSelectSpot={setSelectedSpot}
          activeRegion={activeRegion}
          setMobileTab={setMobileTab}
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
