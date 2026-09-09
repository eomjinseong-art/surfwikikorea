"use client";

import { useState } from "react";
import spotsData from "@/data/spots.json";
import Map from "@/components/Map";
import SpotDrawer from "@/components/SpotDrawer";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const regions = ["전체", "동해", "남해", "제주", "서해"];

  // 지역 필터
  const regionFilteredSpots = activeRegion === "전체" 
    ? spotsData 
    : spotsData.filter((s) => s.region === activeRegion);

  // 검색 필터
  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : spotsData.filter((s) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectSearchResult = (spot: any) => {
    setSelectedSpot(spot);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* 상단 컨트롤 영역 (검색창 + 지역 필터) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col md:flex-row items-end md:items-center gap-2">
        {/* 스팟 실시간 검색창 */}
        <div className="relative">
          <div className="flex items-center bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-slate-100">
            <span className="text-slate-400 text-xs mr-2">🔍</span>
            <input
              type="text"
              placeholder="스팟 검색 (예: 죽도, 송정, 중문...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-44 md:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs ml-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-1.5 w-64 max-h-60 overflow-y-auto bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-2 z-[1002]">
              {searchResults.slice(0, 10).map((spot: any) => (
                <button
                  key={spot.id}
                  onClick={() => handleSelectSearchResult(spot)}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl transition flex justify-between items-center group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-sky-600">{spot.name}</div>
                    <div className="text-[10px] text-slate-400">{spot.subRegion}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                    {spot.difficulty}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 권역별 탭 버튼 */}
        <div className="flex gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-100">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => {
                setActiveRegion(r);
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeRegion === r ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 영역 */}
      <Map
        spots={regionFilteredSpots}
        selectedSpot={selectedSpot}
        onSelectSpot={setSelectedSpot}
        activeRegion={activeRegion}
      />

      {/* 스팟 상세 카드 */}
      {selectedSpot && <SpotDrawer spot={selectedSpot} onClose={() => setSelectedSpot(null)} />}
    </main>
  );
}
