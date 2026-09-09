"use client";

import { useEffect, useRef, useState } from "react";

export default function Map({ spots, selectedSpot, onSelectSpot, activeRegion }: any) {
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

  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    const L = (window as any).L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const surfIcon = L.divIcon({
      className: "custom-surf-pin",
      html: '<div style="background:#0284c7;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;cursor:pointer;">🏄</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    spots.forEach((spot: any) => {
      const marker = L.marker([spot.lat, spot.lng], { icon: surfIcon }).addTo(mapInstance.current);

      marker.on("click", () => {
        onSelectSpot(spot);
        mapInstance.current.flyTo([spot.lat, spot.lng], 12, { duration: 1.2 });
      });

      marker.bindTooltip(`<b>${spot.name}</b><br><span style="font-size:11px;color:#0284c7;">${spot.subRegion}</span>`, { direction: "top", offset: [0, -18] });
      markersRef.current.push(marker);
    });
  }, [loaded, spots]);

  useEffect(() => {
    if (loaded && mapInstance.current && selectedSpot) {
      mapInstance.current.flyTo([selectedSpot.lat, selectedSpot.lng], 12, { duration: 1.2 });
    }
  }, [selectedSpot, loaded]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={mapRef} style={{ width: "100vw", height: "100vh", backgroundColor: "#e0f2fe" }} />
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5">
        <span className="text-2xl">🏄‍♂️</span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-black text-slate-800 tracking-tight">SurfMaster AI</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700">
              전국 {spots.length}개 스팟
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-500">실시간 해양 기상 & AI 파도 지수</p>
        </div>
      </div>
    </div>
  );
}
