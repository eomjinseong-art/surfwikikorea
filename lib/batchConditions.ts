// 실시간 컨디션 배치 조회: 스팟 목록 전체의 파고/풍향을 한 번에 가져와
// 라벨(잠잠/보통/좋음/훌륭/최고)과 핀 색상 계산에 사용한다.
import type { MarineForecast } from "./marine";
import { calculateSurfScores } from "./scoring";

export interface SpotConditions extends MarineForecast {
  beginner: number;
  intermediate: number;
  advanced: number;
  conditionLabel: string;
  conditionColor: string;
}

const parseWindDir = (raw: unknown): number => {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
    const map: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, NNE: 22.5, ENE: 67.5, ESE: 112.5, SSE: 157.5, SSW: 202.5, WSW: 247.5, WNW: 292.5, NNW: 337.5 };
    return map[raw.trim().toUpperCase()] ?? 0;
  }
  return 0;
};

const toNum = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

// 인공파도 서핑장(시흥 웨이브파크): 기상 예보와 무관하게 운영 시간 내내
// 일정한 파도를 제공하므로 예보 대신 고정값을 사용한다.
export const ARTIFICIAL_WAVE_SPOT_IDS = new Set(["siheung-wavepark"]);
export const isArtificialWaveSpot = (id: string): boolean => ARTIFICIAL_WAVE_SPOT_IDS.has(id);

const ARTIFICIAL_FIXED: SpotConditions = {
  waveHeight: 0.8,
  wavePeriod: 8,
  windSpeed: 0,
  windDirection: 0,
  beginner: 90,
  intermediate: 90,
  advanced: 90,
  conditionLabel: "훌륭",
  conditionColor: "#0891b2",
};

function classify(scores: { beginner: number; intermediate: number; advanced: number }): {
  conditionLabel: string;
  conditionColor: string;
} {
  const best = Math.max(scores.beginner, scores.intermediate, scores.advanced);
  if (best >= 85) return { conditionLabel: "최고", conditionColor: "#2563eb" };
  if (best >= 70) return { conditionLabel: "훌륭", conditionColor: "#0891b2" };
  if (best >= 55) return { conditionLabel: "좋음", conditionColor: "#059669" };
  if (best >= 40) return { conditionLabel: "보통", conditionColor: "#f59e0b" };
  return { conditionLabel: "잠잠", conditionColor: "#94a3b8" };
}

export async function getBatchConditions(
  spots: { id: string; lat: number; lng: number; optimalWindDir: number }[]
): Promise<Record<string, SpotConditions>> {
  const result: Record<string, SpotConditions> = {};
  if (spots.length === 0) return result;

  // 인공파도 스팟은 API 성공/실패와 무관하게 항상 고정값 우선 채움
  spots.forEach((s) => {
    if (isArtificialWaveSpot(s.id)) result[s.id] = { ...ARTIFICIAL_FIXED };
  });

  const lats = spots.map((s) => s.lat.toFixed(2)).join(",");
  const lngs = spots.map((s) => s.lng.toFixed(2)).join(",");
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&current=wave_height,wave_period&timezone=Asia%2FTokyo`;
  const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FTokyo`;

  try {
    const [mRes, wRes] = await Promise.all([fetch(marineUrl), fetch(windUrl)]);
    const mList = await mRes.json();
    const wList = await wRes.json();
    const mArr = Array.isArray(mList) ? mList : [mList];
    const wArr = Array.isArray(wList) ? wList : [wList];

    spots.forEach((spot, idx) => {
      if (isArtificialWaveSpot(spot.id)) return; // 인공파도는 고정값 유지 (예보로 덮어쓰지 않음)
      const m = mArr[idx]?.current ?? {};
      const w = wArr[idx]?.current ?? {};
      const forecast: MarineForecast = {
        waveHeight: toNum(m.wave_height, 0.6),
        wavePeriod: toNum(m.wave_period, 5.5),
        windSpeed: toNum(w.wind_speed_10m, 8),
        windDirection: parseWindDir(w.wind_direction_10m ?? 270),
      };
      const scores = calculateSurfScores(
        forecast.waveHeight,
        forecast.wavePeriod,
        forecast.windSpeed,
        forecast.windDirection,
        spot.optimalWindDir
      );
      const { conditionLabel, conditionColor } = classify(scores);
      result[spot.id] = { ...forecast, ...scores, conditionLabel, conditionColor };
    });
  } catch {
    // 네트워크 실패 시 조용히 빈 결과 반환 — UI는 점수 없이 동작한다
  }
  return result;
}

// 세션 저장소: 같은 페이지 세션에서는 재조회하지 않는다 (새로고침·재방문 시에도 유지)
let cache: { at: number; data: Record<string, SpotConditions> } | null = null;
let inflight: Promise<Record<string, SpotConditions>> | null = null;
const TTL = 10 * 60 * 1000;
const SS_KEY = "surfwiki-batch-conds";

function readSession(): { at: number; data: Record<string, SpotConditions> } | null {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function writeSession(entry: { at: number; data: Record<string, SpotConditions> }) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(entry));
  } catch {}
}

export async function getBatchConditionsCached(spots: { id: string; lat: number; lng: number; optimalWindDir: number }[]) {
  const now = Date.now();
  if (cache && now - cache.at < TTL) return cache.data;
  const sess = readSession();
  if (sess && now - sess.at < TTL) {
    cache = sess;
    return sess.data;
  }
  // 동시 호출 시 같은 요청 공유 (중복 fetch 방지)
  if (inflight) return inflight;
  inflight = getBatchConditions(spots).then((data) => {
    if (Object.keys(data).length > 0) {
      cache = { at: Date.now(), data };
      writeSession(cache);
    }
    inflight = null;
    return data;
  }).catch(() => {
    inflight = null;
    return {};
  });
  return inflight;
}
