"use client";

import { useEffect, useState } from "react";
import { getMarineForecast } from "@/lib/marine";
import { calculateSurfScores } from "@/lib/scoring";
import { getCamForSpot, snapshotProxyUrl } from "@/lib/beachCams";
import { buildFinderGrid, wetsuitAdvice } from "@/lib/finder";
import { Wind, Waves, Gauge, Compass, X, AlertTriangle, MapPin, Sparkles, Navigation, Video, ChevronDown, Wind as WindyIcon } from "lucide-react";

export default function SpotDrawer({ spot, onClose }: any) {
  const [data, setData] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [camError, setCamError] = useState(false);
  const [showFinder, setShowFinder] = useState(false);
  const [showWindy, setShowWindy] = useState(false);
  const [finderDays, setFinderDays] = useState<any[]>([]);
  const [waterTemp, setWaterTemp] = useState<number | null>(null);

  useEffect(() => {
    if (!spot) return;
    setLoading(true);
    setCamError(false);
    setShowFinder(false);
    setShowWindy(false);
    getMarineForecast(spot.lat, spot.lng).then((res) => {
      if (res) {
        setData(res);
        setScores(calculateSurfScores(res.waveHeight, res.wavePeriod, res.windSpeed, res.windDirection, spot.optimalWindDir));
      }
      setLoading(false);
    });

    // 7일 그리드 + 수온 (Open-Meteo Marine hourly)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lng}&hourly=wave_height,wave_period&timezone=Asia%2FTokyo&forecast_days=7`;
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lng}&hourly=wind_speed_10m,wind_direction_10m&timezone=Asia%2FTokyo&forecast_days=7`;
    const tempUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lng}&current=sea_surface_temperature&timezone=Asia%2FTokyo`;
    Promise.all([fetch(marineUrl).then((r) => r.json()), fetch(windUrl).then((r) => r.json()), fetch(tempUrl).then((r) => r.json())])
      .then(([m, w, t]) => {
        if (m.hourly && w.hourly) {
          setFinderDays(buildFinderGrid(m.hourly.time, m.hourly.time.map((iso: string) => parseInt(iso.slice(11, 13), 10)), m.hourly.wave_height, m.hourly.wave_period, w.hourly.wind_speed_10m, w.hourly.wind_direction_10m, spot.optimalWindDir));
        }
        setWaterTemp(typeof t.current?.sea_surface_temperature === "number" ? t.current.sea_surface_temperature : null);
      })
      .catch(() => {});
  }, [spot]);

  const cam = spot ? getCamForSpot(spot.id) : null;
  const wetsuit = wetsuitAdvice(waterTemp);

  if (!spot) return null;

  // 조석/지형 특성에 따른 꿀팁 및 경고 생성
  const isWestOrJeju = spot.region === "서해" || spot.region === "제주" || spot.name.includes("다대포");
  const isHeavySpot = spot.difficulty === "Advanced" || spot.name.includes("신항만") || spot.name.includes("봉수대") || spot.name.includes("기사문") || spot.name.includes("물치");
  const needsShoes = spot.bottomType.includes("암초") || spot.bottomType.includes("자갈") || spot.bottomType.includes("테트라") || spot.name.includes("신항만");

  return (
    <div className="absolute bottom-16 md:bottom-20 left-0 right-0 md:left-6 md:right-auto md:w-[410px] bg-white/98 backdrop-blur-md rounded-t-3xl md:rounded-3xl shadow-2xl z-[1001] border border-slate-200/80 p-5 max-h-[80vh] overflow-y-auto transition-all animate-slideUp">
      {/* 헤더 */}
      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
              {spot.region} • {spot.subRegion}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              추천: {spot.difficulty === "All" ? "초급~전체" : spot.difficulty === "Beginner" ? "초보 입문" : spot.difficulty === "Intermediate" ? "중급자" : "상급자 전용"}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1.5 tracking-tight flex items-center gap-1.5">
            {spot.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{spot.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="animate-spin text-xl">🌊</div>
          <span>실시간 해양 기상 및 AI 파도 점수 분석 중...</span>
        </div>
      ) : data && scores ? (
        <div className="mt-4 space-y-4">
          {/* AI 브리핑 카드 */}
          <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50/70 rounded-2xl border border-sky-100/80 text-xs">
            <div className="flex items-center gap-1 text-sky-700 font-extrabold text-[11px] mb-1">
              <Sparkles size={13} className="text-sky-500" />
              <span>AI 실시간 파도 브리핑</span>
            </div>
            <p className="font-semibold text-slate-700 leading-relaxed">{scores.summary}</p>
          </div>

          {/* 숙련도별 서핑 점수 (초/중/상) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500">초보 강습</span>
              <div className="text-lg font-black text-emerald-600 mt-0.5">{scores.beginner}점</div>
              <span className="text-[9px] text-slate-400">{scores.beginner >= 70 ? "입수 추천" : "안전 유의"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500">중급 롱/숏</span>
              <div className="text-lg font-black text-sky-600 mt-0.5">{scores.intermediate}점</div>
              <span className="text-[9px] text-slate-400">{scores.intermediate >= 70 ? "세션 최적" : "보통"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500">상급 배럴</span>
              <div className="text-lg font-black text-indigo-600 mt-0.5">{scores.advanced}점</div>
              <span className="text-[9px] text-slate-400">{scores.advanced >= 70 ? "파워풀" : "파도 작음"}</span>
            </div>
          </div>

          {/* 실시간 수치 데이터 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Waves size={17} className="text-sky-500 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">유의 파고</div>
                <div className="font-extrabold text-slate-800">{data.waveHeight}m</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Gauge size={17} className="text-indigo-500 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">파주기</div>
                <div className="font-extrabold text-slate-800">{data.wavePeriod}초</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Wind size={17} className="text-teal-500 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">바람 컨디션</div>
                <div className="font-extrabold text-slate-800 truncate">{scores.windStatus}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Compass size={17} className="text-amber-500 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">바닥 지형</div>
                <div className="font-extrabold text-slate-800 truncate">{spot.bottomType}</div>
              </div>
            </div>
          </div>

          {/* 실시간 해변 CCTV / 웹캠 (공개 제공 스냅샷) */}
          {cam && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-white">
                <span className="text-[11px] font-extrabold flex items-center gap-1.5">
                  <Video size={13} className="text-red-400" />
                  <span>실시간 해변 뷰</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </span>
                <a
                  href={cam.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold text-slate-300 hover:text-white underline underline-offset-2"
                  title="원본 웹캠 페이지 열기"
                >
                  출처: {cam.credit} ↗
                </a>
              </div>
              {cam.stream ? (
                <iframe src={cam.stream} className="w-full h-48" allowFullScreen title={`${spot.name} 실시간 웹캠`} />
              ) : (
                <div className="relative bg-slate-100">
                  {snapshotProxyUrl(cam) && !camError ? (
                    <img
                      src={snapshotProxyUrl(cam)!}
                      alt={`${spot.name} 해변 스냅샷`}
                      className="w-full h-48 object-cover"
                      onError={() => setCamError(true)}
                    />
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-xs text-slate-400 gap-1">
                      <span className="text-2xl">📹</span>
                      <span>스냅샷을 불러올 수 없습니다</span>
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                    30초마다 갱신
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                    이미지 제공: {cam.credit}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Windy 실시간 풍향/파도 애니메이션 위젯 */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <button
              onClick={() => setShowWindy(!showWindy)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100 hover:to-sky-100 transition"
            >
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                <WindyIcon size={13} className="text-teal-600" />
                <span>풍향·파도 애니메이션 지도 (Windy)</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showWindy ? "rotate-180" : ""}`} />
            </button>
            {showWindy && (
              <iframe
                width="100%"
                height="260"
                frameBorder="0"
                src={`https://embed.windy.com/embed2.html?lat=${spot.lat}&lon=${spot.lng}&detailLat=${spot.lat}&detailLon=${spot.lng}&zoom=9&level=surface&overlay=wind&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=kt&metricTemp=%C2%B0C&radarRange=-1`}
                title="Windy 풍향 애니메이션"
              />
            )}
          </div>

          {/* 7일 오전/오후/야간 파도 파인더 그리드 + 수온/웻슈트 */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <button
              onClick={() => setShowFinder(!showFinder)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 transition"
            >
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                📊
                <span>7일 파도 파인더 (오전/오후/야간)</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showFinder ? "rotate-180" : ""}`} />
            </button>
            {showFinder && (
              <div className="p-2 overflow-x-auto">
                {wetsuit && (
                  <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-100 text-[11px] font-bold text-cyan-800 flex items-center gap-1.5">
                    <span>{wetsuit.emoji}</span>
                    <span>수온 {waterTemp !== null ? `${waterTemp.toFixed(1)}°C` : "정보 없음"} — 추천: {wetsuit.text}</span>
                  </div>
                )}
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left font-bold px-1 py-1">날짜</th>
                      <th className="font-bold px-1 py-1">오전</th>
                      <th className="font-bold px-1 py-1">오후</th>
                      <th className="font-bold px-1 py-1">야간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finderDays.slice(0, 7).map((d) => (
                      <tr key={d.date} className="border-t border-slate-100">
                        <td className="px-1 py-1.5 font-bold text-slate-700 whitespace-nowrap">
                          {d.date.slice(5).replace("-", "/")}
                          <span className="ml-1 text-[8px] font-extrabold text-sky-600">{d.bestLabel}</span>
                        </td>
                        {[d.am, d.pm, d.night].map((c, i) => (
                          <td key={i} className="px-0.5 py-1 text-center">
                            {c ? (
                              <div
                                className="rounded-lg py-1 font-extrabold text-white"
                                style={{
                                  backgroundColor: c.score >= 70 ? "#0891b2" : c.score >= 55 ? "#059669" : c.score >= 40 ? "#f59e0b" : "#94a3b8",
                                }}
                              >
                                {c.waveHeight.toFixed(1)}m
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 실전 안전 및 서퍼 꿀팁 */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-[11px]">
            <div className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-500" />
              <span>실전 서핑 팁 & 주의사항</span>
            </div>
            <ul className="space-y-1 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
              {isWestOrJeju && (
                <li className="text-amber-700 font-semibold">
                  물때(조석) 필수 확인: 간조/만조 시 파도와 수심이 급변합니다.
                </li>
              )}
              {needsShoes && (
                <li className="text-rose-600 font-semibold">
                  아쿠아슈즈/부츠 권장: 암초나 자갈 바닥으로 발 부상에 주의하세요.
                </li>
              )}
              {isHeavySpot && (
                <li className="text-indigo-600 font-semibold">
                  급심 및 방파제 조류 주의: 초보자는 단독 입수를 피하고 서핑존을 준수하세요.
                </li>
              )}
              <li>
                성수기(7~8월)에는 해수욕 구간과 서핑 구간이 엄격히 분리 운영됩니다.
              </li>
              <li>
                현지 서프숍 및 당일 안전요원 공지를 우선 확인 후 입수하세요.
              </li>
            </ul>
          </div>

          {/* 카카오맵 정식 연동 길찾기 버튼 그룹 */}
          <div className="pt-2 space-y-1.5">
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.768 1.838 5.19 4.606 6.556l-.973 3.654a.434.434 0 0 0 .604.496l4.316-2.856c.477.068.964.105 1.447.105 5.523 0 10-3.477 10-7.955C22 6.477 17.523 3 12 3z"/>
              </svg>
              <span>카카오맵으로 실시간 길찾기</span>
            </a>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-center"
              >
                📍 카카오맵 위치
              </a>
              <a
                href={`https://kakaonavi.kakao.com/navigate?name=${encodeURIComponent(spot.name)}&x=${spot.lng}&y=${spot.lat}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-center"
              >
                🚗 카카오내비 안내
              </a>
            </div>
          </div>

          {/* 데이터 출처 표기 */}
          <div className="pt-1 pb-1 text-[9px] leading-relaxed text-slate-400 space-y-0.5">
            <p>🌀 파도·바람 예보: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-1 hover:text-slate-600">Open-Meteo</a> (CC BY 4.0) · 실시간 해양 기반 AI 점수는 서프위키Ai 자체 계산</p>
            <p>💨 풍향·파도 애니메이션 지도: <a href="https://www.windy.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-1 hover:text-slate-600">Windy.com</a> 공식 임베드 위젯</p>
            <p>📹 해변 웹캠 이미지: <a href="https://www.wsbfarm.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-1 hover:text-slate-600">WSB FARM</a> 공개 웹캠 — 각 카메라 원본 페이지에서 출처 표기</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
