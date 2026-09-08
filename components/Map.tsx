"use client";

import { useEffect, useRef, useState } from "react";

export default function Map({ spots, selectedSpot, onSelectSpot }: any) {
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
      }).setView([36.3, 128.0], 7);

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
        mapInstance.current.flyTo([spot.lat, spot.lng], 11, { duration: 1.2 });
      });

      marker.bindTooltip(`<b>${spot.name}</b>`, { direction: "top", offset: [0, -18] });
      markersRef.current.push(marker);
    });
  }, [loaded, spots]);

  useEffect(() => {
    if (loaded && mapInstance.current && selectedSpot) {
      mapInstance.current.flyTo([selectedSpot.lat, selectedSpot.lng], 11, { duration: 1.2 });
    }
  }, [selectedSpot, loaded]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={mapRef} style={{ width: "100vw", height: "100vh", backgroundColor: "#e0f2fe" }} />
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5">
        <span className="text-2xl">🏄‍♂️</span>
        <div>
          <h1 className="text-xs font-black text-slate-800 tracking-tight">SurfMaster AI</h1>
          <p className="text-[10px] font-semibold text-sky-600">전국 실시간 서핑 지도</p>
        </div>
      </div>
    </div>
  );
}
