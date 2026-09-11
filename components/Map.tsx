"use client";

import { useEffect, useRef, useState } from "react";

const CONDITION_COLORS: Record<string, string> = {
  "최고": "#2563eb",
  "훌륭": "#0891b2",
  "좋음": "#059669",
  "보통": "#f59e0b",
  "잠잠": "#94a3b8",
};

export default function Map({
  spots,
  accommodations,
  shops,
  selectedSpot,
  selectedAccommodation,
  onSelectSpot,
  onSelectAccommodation,
  onSelectShop,
  onToggleAccommodations,
  onToggleShops,
  showAccommodations,
  showShops,
  activeRegion,
  setMobileTab,
  conditions,
  userLevel,
  hotSpots,
  conditionCounts,
  onConditionFilter,
  activeConditionFilter,
  accommodationCount,
  shopCount,
  onConditionListJump,
  resetSeq,
}: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);

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
      const map = L.map(mapRef.current, { zoomControl: false }).setView([36.3, 127.8], 7);
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

  // 초기화 신호(resetSeq): 타이틀 클릭 등으로 값이 바뀌면 필터 상태와 무관하게
  // 지도를 대한민국 전체 조망(전국 뷰)으로 되돌린다. 최초 마운트 시에는 건너뜀.
  const resetSkipFirst = useRef(true);
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    if (resetSkipFirst.current) {
      resetSkipFirst.current = false;
      return;
    }
    mapInstance.current.flyTo([36.3, 127.8], 7, { duration: 1.0 });
  }, [resetSeq, loaded]);

  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    const L = (window as any).L;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const levelKey =
      userLevel === "Beginner" ? "beginner" : userLevel === "Intermediate" ? "intermediate" : userLevel === "Advanced" ? "advanced" : null;

    const surfIcon = (color: string, label: string, myScore: number | null) =>
      L.divIcon({
        className: "custom-surf-pin",
        html: `<div style="position:relative;width:38px;height:38px"><div style="background:${color};color:white;width:34px;height:34px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;cursor:pointer;transition:transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${label === "최고" ? "🔥" : "🏄"}</div>${myScore !== null ? `<div style="position:absolute;top:-7px;right:-7px;background:#0f172a;color:white;font-size:8px;font-weight:800;padding:1px 4px;border-radius:8px;border:1.5px solid white;">${myScore}</div>` : ""}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

    const stayIcon = () =>
      L.divIcon({
        className: "custom-stay-pin",
        html: `<div style="position:relative;width:38px;height:38px"><div style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;width:32px;height:32px;margin:0 auto;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;cursor:pointer;transition:transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15) rotate(-3deg)'" onmouseout="this.style.transform='scale(1)'">🏨</div><div style="position:absolute;bottom:-4px;right:-2px;background:#fde68a;font-size:9px;line-height:1;padding:2px 3px;border-radius:6px;border:1.5px solid white;">🌴</div></div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

    const shopIcon = () =>
      L.divIcon({
        className: "custom-shop-pin",
        html: `<div style="position:relative;width:38px;height:38px"><div style="background:linear-gradient(135deg,#059669,#10b981);color:white;width:32px;height:32px;margin:0 auto;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;cursor:pointer;transition:transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15) rotate(3deg)'" onmouseout="this.style.transform='scale(1)'">🏄</div><div style="position:absolute;bottom:-4px;right:-2px;background:#d1fae5;font-size:9px;line-height:1;padding:2px 3px;border-radius:6px;border:1.5px solid white;">샵</div></div>`,
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
      const condLine = cond
        ? `<div style="margin-top:2px;"><span style="display:inline-block;font-size:9px;font-weight:800;color:white;background:${color};padding:1px 6px;border-radius:8px;">${label}</span> <span style="font-size:10px;color:#475569;">${cond.waveHeight.toFixed(1)}m · 풍속 ${cond.windSpeed.toFixed(1)}m/s</span></div>`
        : "";
      marker.bindTooltip(`<b>${spot.name}</b><div style="font-size:11px;color:#0284c7;">${spot.subRegion}</div>${condLine}`, {
        direction: "top",
        offset: [0, -18],
      });
      markersRef.current.push(marker);
    });

    (accommodations || []).forEach((stay: any) => {
      const lat = Number(stay.lat);
      const lng = Number(stay.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const marker = L.marker([lat, lng], { icon: stayIcon() }).addTo(mapInstance.current);
      marker.on("click", () => {
        onSelectAccommodation?.(stay);
        mapInstance.current.flyTo([lat, lng], 12, { duration: 1.2 });
      });
      marker.bindTooltip(
        `<b>${stay.name}</b><div style="font-size:11px;color:#7c3aed;">숙소 · ${stay.subRegion || stay.region}</div>`,
        { direction: "top", offset: [0, -18] }
      );
      markersRef.current.push(marker);
    });

    (shops || []).forEach((shop: any) => {
      const lat = Number(shop.lat);
      const lng = Number(shop.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const marker = L.marker([lat, lng], { icon: shopIcon() }).addTo(mapInstance.current);
      marker.on("click", () => {
        onSelectShop?.(shop);
        mapInstance.current.flyTo([lat, lng], 12, { duration: 1.2 });
      });
      marker.bindTooltip(
        `<b>${shop.name}</b><div style="font-size:11px;color:#059669;">서핑샵 · ${shop.type || shop.subRegion || shop.region}</div>`,
        { direction: "top", offset: [0, -18] }
      );
      markersRef.current.push(marker);
    });
  }, [loaded, spots, accommodations, shops, conditions, userLevel, onSelectSpot, onSelectAccommodation, onSelectShop]);

  useEffect(() => {
    if (loaded && mapInstance.current && selectedSpot) {
      mapInstance.current.flyTo([selectedSpot.lat, selectedSpot.lng], 12, { duration: 1.2 });
    }
  }, [selectedSpot, loaded]);

  useEffect(() => {
    if (loaded && mapInstance.current && selectedAccommodation) {
      mapInstance.current.flyTo([selectedAccommodation.lat, selectedAccommodation.lng], 12, { duration: 1.2 });
    }
  }, [selectedAccommodation, loaded]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapRef} className="w-full h-full" style={{ backgroundColor: "#e0f2fe" }} />

      {/* 🔥 핫스팟 칩 */}
      {hotSpots && hotSpots.length > 0 && (
        <div className="absolute left-0 right-0 z-[450] px-3 below-tab-header md:top-4">
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
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cond.conditionColor }} />
                <span className="whitespace-nowrap">{spot.name}</span>
                <span className="text-sky-600 font-black whitespace-nowrap">{cond.waveHeight.toFixed(1)}m</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 우상단: 숙소 / 서핑샵 토글 */}
      {(onToggleAccommodations || onToggleShops) && (
        <div className="absolute right-3 z-[460] below-hotspot-row md:top-16 flex flex-col items-end gap-1.5">
          {onToggleAccommodations && (
            <button
              onClick={onToggleAccommodations}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border shadow-md transition ${
                showAccommodations
                  ? "bg-violet-600 text-white border-violet-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-violet-50"
              }`}
            >
              {showAccommodations
                ? `🏨 숙소 표시중${typeof accommodationCount === "number" ? ` (${accommodationCount})` : ""} — 끄기`
                : `🏨 숙소보기${typeof accommodationCount === "number" ? `(${accommodationCount})` : ""}`}
            </button>
          )}
          {onToggleShops && (
            <button
              onClick={onToggleShops}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border shadow-md transition ${
                showShops
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              {showShops
                ? `🏄 서핑샵 표시중${typeof shopCount === "number" ? ` (${shopCount})` : ""} — 끄기`
                : `🏄 서핑샵${typeof shopCount === "number" ? `(${shopCount})` : ""}`}
            </button>
          )}
        </div>
      )}

      {/* 좌하단: 컨디션 필터 범례 칩 (클릭 시 목록 필터) */}
      {conditionCounts && onConditionFilter && (
        <div className="absolute left-3 z-[450] bottom-28 md:bottom-3 mobile-legend-safe">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-2">
            <div className="text-[9px] font-black text-slate-500 mb-1.5 px-1">파도 상태별 보기</div>
            <div className="flex flex-col gap-1">
              {(["전체", "최고", "훌륭", "좋음", "보통", "잠잠"] as const).map((label) => {
                const count = label === "전체"
                  ? (conditionCounts["최고"] || 0) + (conditionCounts["훌륭"] || 0) + (conditionCounts["좋음"] || 0) + (conditionCounts["보통"] || 0) + (conditionCounts["잠잠"] || 0)
                  : conditionCounts[label] || 0;
                const isActive = activeConditionFilter === label;
                return (
                  <button
                    key={label}
                    onClick={() => onConditionFilter(label)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      isActive
                        ? "bg-sky-100 text-sky-800 ring-1 ring-sky-400"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {label === "전체" ? (
                      <span className="text-[9px]">↺</span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CONDITION_COLORS[label] }} />
                    )}
                    <span>{label}</span>
                    <span className="text-[8px] text-slate-400 ml-auto font-extrabold">{count}</span>
                  </button>
                );
              })}
            </div>
            {/* 모바일: 컨디션 선택 시 지도에 머무르고, 사용자가 원할 때만 목록으로 이동 */}
            {activeConditionFilter && activeConditionFilter !== "전체" && onConditionListJump && (
              <button
                onClick={() => onConditionListJump(activeConditionFilter)}
                className="md:hidden mt-1.5 w-full px-2 py-1.5 rounded-lg bg-sky-500 text-white text-[10px] font-extrabold shadow-sm active:scale-95 transition"
              >
                📋 목록 보기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
