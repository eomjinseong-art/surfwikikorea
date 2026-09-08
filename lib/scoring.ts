export interface SurfScores {
  beginner: number;
  intermediate: number;
  advanced: number;
  windStatus: string;
  summary: string;
}

export function calculateSurfScores(waveHeight: number, wavePeriod: number, windSpeed: number, windDir: number, optimalWindDir: number): SurfScores {
  const windDiff = Math.abs(windDir - optimalWindDir) % 360;
  let windStatus = '크로스쇼어';
  let bonus = 0;
  if (windDiff <= 45 || windDiff >= 315) { windStatus = '오프쇼어 (면 깔끔)'; bonus = 20; }
  else if (windDiff >= 135 && windDiff <= 225) { windStatus = '온쇼어 (바람파도)'; bonus = -20; }

  let b = 50; if (waveHeight >= 0.4 && waveHeight <= 0.8) b += 35; else if (waveHeight > 1.2) b -= 30;
  let i = 40 + bonus; if (waveHeight >= 0.8 && waveHeight <= 1.5) i += 35; else i -= 15;
  let a = 30 + bonus; if (waveHeight >= 1.2) a += 40; if (wavePeriod >= 9) a += 20;

  const beginner = Math.max(10, Math.min(100, b));
  const intermediate = Math.max(10, Math.min(100, i));
  const advanced = Math.max(10, Math.min(100, a));

  let summary = "🌊 좋은 서핑 컨디션입니다!";
  if (windStatus.includes('오프쇼어') && waveHeight >= 1.0) summary = "🔥 클린한 오프쇼어 파도! 중상급자 추천!";
  else if (waveHeight <= 0.7 && beginner >= 70) summary = "🏄‍♂️ 잔잔하고 안전하여 초보 강습에 최고!";

  return { beginner, intermediate, advanced, windStatus, summary };
}
