export interface SurfScores {
  beginner: number;
  intermediate: number;
  advanced: number;
  windStatus: string;
  summary: string;
}

// Gaussian-like bell curve: peaks at `optimal`, falls off with `sigma`
function bellCurve(value: number, optimal: number, sigma: number): number {
  return Math.exp(-0.5 * ((value - optimal) / sigma) ** 2);
}

// Asymmetric bell: different spread below vs above the optimal
function asymBell(value: number, optimal: number, sigmaLow: number, sigmaHigh: number): number {
  const sigma = value < optimal ? sigmaLow : sigmaHigh;
  return Math.exp(-0.5 * ((value - optimal) / sigma) ** 2);
}

// Plateau curve: full score in [lo, hi], Gaussian falloff outside
function plateau(value: number, lo: number, hi: number, sigmaLow: number, sigmaHigh: number): number {
  if (value >= lo && value <= hi) return 1.0;
  if (value < lo) return Math.exp(-0.5 * ((value - lo) / sigmaLow) ** 2);
  return Math.exp(-0.5 * ((value - hi) / sigmaHigh) ** 2);
}

// Continuous wind direction score: 0° diff = 1.0 (offshore), 180° = 0.0 (onshore)
function windDirectionScore(windDir: number, optimalWindDir: number): number {
  const raw = Math.abs(windDir - optimalWindDir) % 360;
  const diff = raw > 180 ? 360 - raw : raw; // 0..180
  // Cosine-based: offshore(0°)=1, cross(90°)=0.5, onshore(180°)=0
  return 0.5 * (1 + Math.cos((diff / 180) * Math.PI));
}

// Wind speed factor: light wind is ideal, strong wind degrades conditions
// dirScore 0..1 modulates how much strong wind hurts
function windSpeedFactor(windSpeed: number, dirScore: number): number {
  // windSpeed in m/s (API typically provides m/s)
  // Light wind (<3 m/s ~10km/h): near-perfect regardless of direction
  if (windSpeed <= 3) return 1.0;

  // Calm-ish (3-5 m/s): slight effect modulated by direction
  // Strong (>8 m/s ~30km/h): significant effect
  // The worse the direction, the worse strong wind is

  const speedPenalty = Math.min(1.0, (windSpeed - 3) / 12); // 0 at 3m/s, 1 at 15m/s
  // If offshore (dirScore=1): penalty is small (spray but clean face)
  // If onshore (dirScore=0): penalty is large
  const dirModifier = 1.0 - dirScore; // 0 for offshore, 1 for onshore
  const penalty = speedPenalty * (0.3 + 0.7 * dirModifier);
  return Math.max(0.1, 1.0 - penalty);
}

// Wave quality factor: period-to-height ratio indicates swell organization
function swellQuality(waveHeight: number, wavePeriod: number): number {
  if (waveHeight <= 0.05) return 0.3; // flat
  const ratio = wavePeriod / waveHeight;
  // Ratio 8-15 is great (organized groundswell), <5 is messy windswell, >20 means tiny waves with long period (decent)
  if (ratio >= 8 && ratio <= 20) return 1.0;
  if (ratio < 8) return 0.5 + 0.5 * (ratio / 8);
  // ratio > 20: still decent
  return Math.max(0.6, 1.0 - (ratio - 20) / 40);
}

export function calculateSurfScores(
  waveHeight: number,
  wavePeriod: number,
  windSpeed: number,
  windDir: number,
  optimalWindDir: number
): SurfScores {
  // ── Wind analysis ──
  const dirScore = windDirectionScore(windDir, optimalWindDir);
  const windFactor = windSpeedFactor(windSpeed, dirScore);
  const quality = swellQuality(waveHeight, wavePeriod);

  // Wind status text (continuous but categorized for display)
  const rawDiff = Math.abs(windDir - optimalWindDir) % 360;
  const angleDiff = rawDiff > 180 ? 360 - rawDiff : rawDiff;
  let windStatus: string;
  if (angleDiff <= 30) windStatus = '오프쇼어 (면 깔끔)';
  else if (angleDiff <= 60) windStatus = '크로스오프쇼어 (양호)';
  else if (angleDiff <= 120) windStatus = '크로스쇼어';
  else if (angleDiff <= 150) windStatus = '크로스온쇼어 (불리)';
  else windStatus = '온쇼어 (바람파도)';

  if (windSpeed <= 2) windStatus = '무풍 (글래시)';
  else if (windSpeed <= 4 && angleDiff <= 60) windStatus = '약한 오프쇼어 (최적)';

  // ── Wave height scores per level (0..1) ──
  // Beginner: optimal 0.3-0.8m, dangerous above 1.2m
  const hBeg = plateau(waveHeight, 0.3, 0.8, 0.2, 0.3) * (waveHeight > 1.5 ? 0.2 : waveHeight > 1.2 ? 0.5 : 1.0);
  // Intermediate: optimal 0.7-1.5m
  const hInt = plateau(waveHeight, 0.7, 1.5, 0.35, 0.5);
  // Advanced: optimal 1.2-3.0m, still decent above
  const hAdv = plateau(waveHeight, 1.2, 3.0, 0.6, 1.5);

  // ── Wave period scores per level (0..1) ──
  // Beginner: 6-10s good, short period = choppy = bad
  const pBeg = plateau(wavePeriod, 6, 10, 2.0, 3.0);
  // Intermediate: 7-12s optimal
  const pInt = plateau(wavePeriod, 7, 12, 2.5, 3.0);
  // Advanced: 9-16s optimal, longer = more power = good
  const pAdv = plateau(wavePeriod, 9, 16, 3.0, 5.0);

  // ── Composite scores ──
  // Weights: height is most important, period and wind both matter, quality is a modifier
  // Beginner: wind matters less (learning), height safety is critical
  const bRaw = (hBeg * 0.45 + pBeg * 0.25 + windFactor * 0.15 + quality * 0.15) * 100;
  // Intermediate: balanced
  const iRaw = (hInt * 0.35 + pInt * 0.25 + windFactor * 0.20 + quality * 0.20) * 100;
  // Advanced: height and period matter most, wind is a factor
  const aRaw = (hAdv * 0.30 + pAdv * 0.25 + windFactor * 0.20 + quality * 0.25) * 100;

  // Bonus/penalty for very calm or very windy
  const calmBonus = windSpeed <= 2 ? 8 : windSpeed <= 4 ? 4 : 0;
  const stormPenalty = windSpeed > 12 ? -15 : windSpeed > 8 ? -8 : 0;

  // Safety penalty for beginners in big waves
  const beginnerSafety = waveHeight > 1.5 ? -25 : waveHeight > 1.2 ? -15 : 0;

  // Period bonus for advanced: very long period groundswell
  const advPeriodBonus = wavePeriod >= 14 ? 10 : wavePeriod >= 12 ? 5 : 0;

  const clamp = (v: number) => Math.max(5, Math.min(100, Math.round(v)));

  const beginner = clamp(bRaw + calmBonus + beginnerSafety);
  const intermediate = clamp(iRaw + calmBonus + stormPenalty);
  const advanced = clamp(aRaw + calmBonus + stormPenalty + advPeriodBonus);

  // ── Summary generation ──
  const avgScore = (beginner + intermediate + advanced) / 3;
  const bestLevel = beginner >= intermediate && beginner >= advanced
    ? 'beginner' : intermediate >= advanced ? 'intermediate' : 'advanced';

  let summary: string;

  if (windSpeed <= 2 && waveHeight >= 0.8 && waveHeight <= 2.0 && wavePeriod >= 9) {
    summary = '🔥 글래시 컨디션! 깨끗한 파도, 오늘이 최고의 서핑일!';
  } else if (angleDiff <= 30 && waveHeight >= 1.0 && wavePeriod >= 10) {
    summary = '🔥 클린한 오프쇼어 + 긴 주기 파도! 중상급자 꼭 입수하세요!';
  } else if (angleDiff <= 30 && waveHeight >= 0.6 && waveHeight <= 1.0) {
    summary = '✨ 오프쇼어로 면이 깨끗하고 파도 크기도 적당! 모든 레벨 추천!';
  } else if (waveHeight <= 0.3) {
    summary = '😴 파도가 거의 없습니다. 내일을 기대해보세요.';
  } else if (waveHeight <= 0.6 && wavePeriod >= 8 && windFactor >= 0.7) {
    summary = '🏄‍♂️ 잔잔하지만 깨끗한 파도. 초보 강습에 최적!';
  } else if (waveHeight <= 0.7 && beginner >= 60) {
    summary = '🏄‍♂️ 작지만 안전한 파도. 초보자 연습하기 좋은 날!';
  } else if (waveHeight >= 2.5 && wavePeriod >= 12) {
    summary = '💪 강력한 그라운드스웰! 상급자 전용. 초중급자는 주의!';
  } else if (waveHeight >= 2.0) {
    summary = '⚡ 큰 파도 주의! 상급자에게 좋지만 안전에 유의하세요.';
  } else if (angleDiff >= 150 && windSpeed >= 8) {
    summary = '💨 강한 온쇼어! 파도면이 지저분합니다. 컨디션 불량.';
  } else if (angleDiff >= 120 && windSpeed >= 6) {
    summary = '🌬️ 온쇼어 기미로 파도가 다소 지저분합니다.';
  } else if (windSpeed >= 10) {
    summary = '💨 바람이 강합니다. 체감 컨디션이 떨어질 수 있어요.';
  } else if (wavePeriod <= 5 && waveHeight >= 0.5) {
    summary = '🌊 짧은 주기 윈드스웰. 파도가 불규칙하고 파워가 약합니다.';
  } else if (avgScore >= 70) {
    summary = '🌊 전반적으로 좋은 컨디션! 즐거운 서핑 되세요!';
  } else if (avgScore >= 50) {
    summary = '🌊 무난한 컨디션입니다. 레벨에 맞게 즐기세요.';
  } else if (avgScore >= 30) {
    summary = '😐 컨디션이 아쉽습니다. 입수 전 현장 확인 권장.';
  } else {
    summary = '⛔ 서핑하기 어려운 컨디션입니다. 다음 기회를 노려보세요.';
  }

  return { beginner, intermediate, advanced, windStatus, summary };
}
