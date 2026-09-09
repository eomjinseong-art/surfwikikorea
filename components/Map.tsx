"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export default function Map({
  spots,
  selectedSpot,
  onSelectSpot,
  activeRegion,
  setMobileTab,
  conditions,
  userLevel,
  hotSpots,
}: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js";
    const initLeaflet = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([36.3, 127.8], 7);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;
      setLoaded(true);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initLeaflet;
      document.head.appendChild(script);
    } else {
      initLeaflet();
    }
  }, []);

  // 지역 변경 시 카메라 중심 부드럽게 이동
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    const regionCenters: Record<string, { center: [number, number]; zoom: number }> = {
      "동해": { center: [37.7, 128.9], zoom: 8 },
      "남해": { center: [34.9, 128.5], zoom: 8 },
      "제주": { center: [33.38, 126.55], zoom: 9 },
      "서해": { center: [36.7, 126.3], zoom: 8 },
      "전체": { center: [36.3, 127.8], zoom: 7 },
    };

    const target = regionCenters[activeRegion] || regionCenters["전체"];
    mapInstance.current.flyTo(target.center, target.zoom, { duration: 1.0 });
  }, [activeRegion, loaded]);

  // 마커 렌더링
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    const L = (window as any).L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const levelKey = userLevel === "Beginner" ? "beginner" : userLevel === "Intermediate" ? "intermediate" : userLevel === "Advanced" ? "advanced" : null;

    const surfIcon = (color: string, label: string, myScore: number | null) =>
      L.divIcon({
        className: "custom-surf-pin",
        html: `<div style="position:relative;width:38px;height:38px"><div style="background:${color};color:white;width:34px;height:34px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;cursor:pointer;transition:transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${label === "최고" ? "🔥" : "🏄"}</div>${myScore !== null ? `<div style="position:absolute;top:-7px;right:-7px;background:#0f172a;color:white;font-size:8px;font-weight:800;padding:1px 4px;border-radius:8px;border:1.5px solid white;">${myScore}</div>` : ""}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

    spots.forEach((spot: any) => {
      const cond = conditions?.[spot.id];
      const color = cond?.conditionColor ?? "#0284c7";
      const label = cond?.conditionLabel ?? "";
      const myScore = levelKey && cond ? cond[levelKey] : null;
      const marker = L.marker([spot.lat, spot.lng], { icon: surfIcon(color, label, myScore) }).addTo(mapInstance.current);

      marker.on("click", () => {
        onSelectSpot(spot);
        mapInstance.current.flyTo([spot.lat, spot.lng], 12, { duration: 1.2 });
      });

      const condLine = cond ? `<div style="margin-top:2px;"><span style="display:inline-block;font-size:9px;font-weight:800;color:white;background:${color};padding:1px 6px;border-radius:8px;">${label}</span> <span style="font-size:10px;color:#475569;">${cond.waveHeight.toFixed(1)}m · 풍속 ${cond.windSpeed.toFixed(0)}km/h</span></div>` : "";
      marker.bindTooltip(`<b>${spot.name}</b><div style="font-size:11px;color:#0284c7;">${spot.subRegion}</div>${condLine}`, { direction: "top", offset: [0, -18] });
      markersRef.current.push(marker);
    });
  }, [loaded, spots, conditions, userLevel]);

  // 스팟 선택 시 부드러운 카메라 이동
  useEffect(() => {
    if (loaded && mapInstance.current && selectedSpot) {
      mapInstance.current.flyTo([selectedSpot.lat, selectedSpot.lng], 12, { duration: 1.2 });
    }
  }, [selectedSpot, loaded]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapRef} className="w-full h-full" style={{ backgroundColor: "#e0f2fe" }} />

      {/* 우측 상단 스팟 카운터 뱃지 (모바일: 탭 헤더 아래 고정) */}
      <button
        onClick={() => setMobileTab && setMobileTab('list')}
        className="below-tab-header md:top-4 absolute right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 text-[11px] font-bold text-slate-700 flex items-center gap-1.5"
        title="목록 보기"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>실시간 연동 {spots.length}개 스팟</span>
      </button>

      {/* 🔥 지금 파도 좋은 곳 플로팅 칩 (훌륭/최고 등급, AI 점수순) */}
      {hotSpots && hotSpots.length > 0 && (
        <div className="absolute left-0 right-0 z-[450] px-3 below-tab-header md:top-16">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar overscroll-x-contain pb-1">
            <span className="shrink-0 text-[10px] font-black text-white bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1.5 rounded-full shadow-md flex items-center gap-1">
              🔥 지금 파도 좋은 곳
            </span>
            {hotSpots.map(({ spot, cond }: any) => (
              <button
                key={spot.id}
                onClick={() => {
                  onSelectSpot(spot);
                  mapInstance.current?.flyTo([spot.lat, spot.lng], 12, { duration: 1.2 });
                }}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-md text-[10px] font-extrabold border transition active:scale-95 ${
                  selectedSpot?.id === spot.id
                    ? "bg-sky-600 text-white border-sky-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-sky-50"
                }`}
                title={`${spot.name} — ${cond.conditionLabel} · 탭하면 상세정보(웹캠·AI 점수)가 열립니다`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: cond.conditionColor }}
                />
                <span className="whitespace-nowrap">{spot.name}</span>
                <span className="text-sky-600 font-black whitespace-nowrap">
                  {cond.waveHeight.toFixed(1)}m
                </span>
              </button>
            ))}
            <span className="shrink-0 text-[9px] font-bold text-slate-500 bg-white/90 border border-slate-200 rounded-full px-2 py-1 whitespace-nowrap">
              옆으로 밀면 더보기 →
            </span>
          </div>
          <p className="mt-0.5 px-1 text-[9px] font-bold text-slate-500 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            실시간 AI 점수 기준 훌륭·최고 등급 스팟 {hotSpots.length}곳 · 칩을 누르면 상세가 열립니다
          </p>
        </div>
      )}

      {/* 초보자용 지도 범례 (좌하단 고정, 탭해서 펼침/접기) */}
      <div className="absolute bottom-3 left-3 z-[450]">
        {legendOpen && (
          <div className="mb-1.5 bg-white/97 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-3 w-[232px] text-[10px] leading-relaxed">
            <div className="font-black text-slate-800 text-[11px] mb-1.5">지도 기호 설명</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#94a3b8" }} />
                <span className="text-slate-600">잠잠 — 파도가 거의 없음</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                <span className="text-slate-600">보통 — 입수 전 확인 권장</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#059669" }} />
                <span className="text-slate-600">좋음 — 서핑하기 괜찮음</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#0891b2" }} />
                <span className="text-slate-600">훌륭 — 지금이 적기!</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: "#2563eb" }} />
                <span className="text-slate-600">최고 — 서퍼라면 지금 바로</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[13px] leading-none">🔥</span>
                <span className="text-slate-600">핀의 불 = 최고 등급 스팟</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="min-w-[18px] h-3.5 px-0.5 rounded bg-slate-900 text-white text-[8px] font-black flex items-center justify-center shrink-0">72</span>
                <span className="text-slate-600">숫자 = 선택한 레벨 기준 내 점수<br />(레벨 필터 선택 시 표시)</span>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[9px] text-slate-400">
              핀 색은 실시간 파도·바람 예보(Open-Meteo)로 매시간 자동 갱신됩니다
            </div>
          </div>
        )}
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className={`flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full shadow-md border px-2.5 py-1.5 text-[10px] font-extrabold transition ${
            legendOpen ? "bg-sky-600 border-sky-700 text-white" : "border-slate-200/80 text-slate-700 hover:bg-sky-50"
          }`}
          title="지도 기호 설명"
        >
          <Info size={12} />
          <span>범례</span>
        </button>
      </div>
    </div>
  );
}
