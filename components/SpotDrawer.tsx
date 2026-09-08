"use client";

import { useEffect, useState } from "react";
import { getMarineForecast } from "@/lib/marine";
import { calculateSurfScores } from "@/lib/scoring";
import { Wind, Waves, Gauge, Compass, X } from "lucide-react";

export default function SpotDrawer({ spot, onClose }: any) {
  const [data, setData] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spot) return;
    setLoading(true);
    getMarineForecast(spot.lat, spot.lng).then((res) => {
      if (res) {
        setData(res);
        setScores(calculateSurfScores(res.waveHeight, res.wavePeriod, res.windSpeed, res.windDirection, spot.optimalWindDir));
      }
      setLoading(false);
    });
  }, [spot]);

  if (!spot) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 md:left-6 md:bottom-6 md:right-auto md:w-96 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-20 border border-slate-100 p-5 max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">{spot.subRegion}</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{spot.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{spot.description}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-slate-400">🌊 실시간 파도 & AI 점수 계산 중...</div>
      ) : data && scores ? (
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-sky-50 rounded-2xl text-xs font-medium text-sky-900">{scores.summary}</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500">초급자</span>
              <div className="text-lg font-black text-emerald-600">{scores.beginner}점</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500">중급자</span>
              <div className="text-lg font-black text-sky-600">{scores.intermediate}점</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500">상급자</span>
              <div className="text-lg font-black text-indigo-600">{scores.advanced}점</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <Waves size={16} className="text-sky-500" />
              <div><div className="text-slate-400 text-[10px]">유의 파고</div><div className="font-bold">{data.waveHeight}m</div></div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <Gauge size={16} className="text-indigo-500" />
              <div><div className="text-slate-400 text-[10px]">파주기</div><div className="font-bold">{data.wavePeriod}초</div></div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <Wind size={16} className="text-teal-500" />
              <div><div className="text-slate-400 text-[10px]">바람 상태</div><div className="font-bold">{scores.windStatus}</div></div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <Compass size={16} className="text-amber-500" />
              <div><div className="text-slate-400 text-[10px]">바닥 지형</div><div className="font-bold">{spot.bottomType}</div></div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
