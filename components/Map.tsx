"use client";

import { useEffect, useRef, useState } from "react";

export default function Map({ spots, selectedSpot, onSelectSpot, activeRegion, setMobileTab, conditions, userLevel }: any) {


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
      
      {/* 우측 상단 스팟 카운터 뱃지 */}
      <button
        onClick={() => setMobileTab && setMobileTab('list')}
        className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 text-[11px] font-bold text-slate-700 flex items-center gap-1.5"
        title="목록 보기"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>실시간 연동 {spots.length}개 스팟</span>
      </button>
    </div>
  );
}
