// 7일 예보 그리드(오전/오후/야간) + 수온/웻슈트 조언 유틸
import { calculateSurfScores } from "./scoring";

export interface FinderCell {
  hour: number;
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  windDir: number;
  score: number;
}

export interface FinderDay {
  date: string;
  am: FinderCell | null;
  pm: FinderCell | null;
  night: FinderCell | null;
  bestScore: number;
  bestLabel: string;
}

function pickCell(hours: number[], waveH: (number | null)[], waveP: (number | null)[], windS: (number | null)[], windD: (number | null)[], hour: number): FinderCell | null {
  const i = hours.indexOf(hour);
  if (i === -1) return null;
  const wh = waveH[i] ?? 0;
  const wp = waveP[i] ?? 5.5;
  const ws = windS[i] ?? 0;
  const wd = windD[i] ?? 0;
  const scores = calculateSurfScores(wh, wp, ws, wd, 270);
  return { hour, waveHeight: wh, wavePeriod: wp, windSpeed: ws, windDir: wd, score: scores.intermediate };
}

export function buildFinderGrid(
  dates: string[],
  hours: number[],
  waveH: (number | null)[],
  waveP: (number | null)[],
  windS: (number | null)[],
  windD: (number | null)[],
  optimalWindDir: number
): FinderDay[] {
  const byDate = new Map<string, number[]>();
  dates.forEach((d, i) => {
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(i);
  });

  const days: FinderDay[] = [];
  byDate.forEach((idxs, date) => {
    const slot = (from: number, to: number): FinderCell | null => {
      for (const i of idxs) {
        const h = hours[i];
        if (h >= from && h < to) {
          return pickCell(hours, waveH, waveP, windS, windD, h);
        }
      }
      return null;
    };
    const am = slot(6, 12);
    const pm = slot(12, 18);
    const night = slot(18, 24);
    const cells = [am, pm, night].filter(Boolean) as FinderCell[];
    // 스팟별 최적 풍향 반영해 스코어 재계산
    const recalc = (c: FinderCell | null): number => {
      if (!c) return 0;
      const s = calculateSurfScores(c.waveHeight, c.wavePeriod, c.windSpeed, c.windDir, optimalWindDir);
      return Math.max(s.beginner, s.intermediate, s.advanced);
    };
    const best = Math.max(0, ...cells.map(recalc));
    days.push({
      date,
      am: am ? { ...am, score: recalc(am) } : null,
      pm: pm ? { ...pm, score: recalc(pm) } : null,
      night: night ? { ...night, score: recalc(night) } : null,
      bestScore: best,
      bestLabel: best >= 70 ? "훌륭" : best >= 55 ? "좋음" : best >= 40 ? "보통" : "잠잠",
    });
  });
  return days;
}

export function wetsuitAdvice(waterTempC: number | null): { text: string; emoji: string } | null {
  if (waterTempC === null || !Number.isFinite(waterTempC)) return null;
  if (waterTempC >= 24) return { text: "슈트 불필요 (레깅스/톱)", emoji: "🩳" };
  if (waterTempC >= 20) return { text: "1.5~2mm 슈프마 수트", emoji: "🦵" };
  if (waterTempC >= 16) return { text: "3/2mm 풀슈트", emoji: "🧤" };
  if (waterTempC >= 12) return { text: "4/3mm 풀슈트 + 부츠", emoji: "🧦" };
  if (waterTempC >= 8) return { text: "5/4mm 풀슈트 + 부츠 + 장갑", emoji: "🧣" };
  return { text: "5mm 이상 + 후드·장갑·부츠 필수", emoji: "🥶" };
}
