"use client";

import { useState, useEffect } from "react";
import { Waves, RefreshCw } from "lucide-react";

interface ConditionData {
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  windDir: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  conditionLabel: string;
  conditionColor: string;
}

export default function SpotClient({
  spotId,
  spotName,
}: {
  spotId: string;
  spotName: string;
}) {
  const [cond, setCond] = useState<ConditionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchConditions = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/conditions?ids=${spotId}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data[spotId]) {
        setCond(data[spotId]);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Waves size={16} className="text-sky-500" />
          실시간 서핑 컨디션
        </h2>
        <button
          onClick={fetchConditions}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 transition"
        >
          <RefreshCw
            size={12}
            className={loading ? "animate-spin" : ""}
          />
          새로고침
        </button>
      </div>

      {loading && !cond && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-slate-500">
            {spotName} 실시간 데이터 조회 중...
          </span>
        </div>
      )}

      {error && !cond && (
        <div className="text-center py-6">
          <p className="text-xs text-slate-400 mb-2">
            실시간 데이터를 불러올 수 없습니다.
          </p>
          <button
            onClick={fetchConditions}
            className="text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {cond && (
        <div className="space-y-4">
          {/* condition badge */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-black px-3 py-1.5 rounded-xl text-white"
              style={{ backgroundColor: cond.conditionColor }}
            >
              {cond.conditionLabel}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              현재 파도 상태
            </span>
          </div>

          {/* metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="파고"
              value={`${cond.waveHeight.toFixed(1)}m`}
            />
            <MetricCard
              label="파주기"
              value={`${cond.wavePeriod.toFixed(1)}s`}
            />
            <MetricCard
              label="풍속"
              value={`${cond.windSpeed.toFixed(1)}m/s`}
            />
            <MetricCard label="풍향" value={`${cond.windDir}°`} />
          </div>

          {/* AI scores */}
          <div>
            <h3 className="text-[11px] font-extrabold text-slate-500 mb-2">
              AI 서핑 점수 (100점 만점)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <ScoreBar
                label="초급"
                score={cond.beginner}
                color="bg-emerald-500"
              />
              <ScoreBar
                label="중급"
                score={cond.intermediate}
                color="bg-sky-500"
              />
              <ScoreBar
                label="상급"
                score={cond.advanced}
                color="bg-violet-500"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className="text-[10px] font-extrabold text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-extrabold text-slate-500">
          {label}
        </span>
        <span className="text-xs font-black text-slate-800">{score}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
