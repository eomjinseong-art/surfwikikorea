"use client";

import { useState } from "react";
import spotsData from "@/data/spots.json";
import Map from "@/components/Map";
import SpotDrawer from "@/components/SpotDrawer";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("전체");
  const regions = ["전체", "동해", "남해", "제주", "서해"];

  const filteredSpots = activeRegion === "전체" 
    ? spotsData 
    : spotsData.filter((s) => s.region === activeRegion);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 right-4 z-[1000] flex gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-100">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              activeRegion === r ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <Map spots={filteredSpots} selectedSpot={selectedSpot} onSelectSpot={setSelectedSpot} />
      {selectedSpot && <SpotDrawer spot={selectedSpot} onClose={() => setSelectedSpot(null)} />}
    </main>
  );
}
