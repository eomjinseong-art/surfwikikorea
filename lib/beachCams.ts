// 공개 서핑 웹캠 매핑 — 스냅샷 출처: WSB FARM (www.wsbfarm.com) 공개 해변 웹캠 페이지
// 스냅샷은 /api/cam?beach=CODE 프록시가 WSB FARM 공개 페이지에서 최신 프레임을 추적해 제공하며,
// 모든 카드에 "출처: WSB FARM" 표기와 원본 페이지 링크를 반드시 노출한다.
// 라이브 스트림(현재 없음)이 확보되면 stream 필드에 iframe 주소를 넣는다.

export interface BeachCam {
  /** WSB FARM 해변 코드 (스냅샷 자동 추적용) */
  beachCode?: string;
  /** 고정 스냅샷 URL (특수 케이스) */
  fixedSnapshot?: string;
  /** 라이브 스트림 iframe 주소 (없으면 스냅샷 모드) */
  stream?: string;
  credit: string;
  creditUrl: string;
}

// 키: data/spots.json의 스팟 id
export const BEACH_CAMS: Record<string, BeachCam> = {
  // ── 양양 ──
  "yangyang-jukdo": { beachCode: "JD3", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JD3" },
  "yangyang-ingu": { beachCode: "IJ1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=IJ1" },
  "yangyang-gisamun": { beachCode: "GSM1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=GSM1" },
  "yangyang-gaetmaeul": { beachCode: "GMU1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=GMU1" },
  "yangyang-namae3": { beachCode: "NA1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=NA1" },
  "yangyang-mulchi": { beachCode: "MUL", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=MUL" },
  "yangyang-seorak": { beachCode: "YSK1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YSK1" },
  "yangyang-dongsan": { beachCode: "DS1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=DS1" },
  "yangyang-surfyy": { beachCode: "YHJD1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YHJD1" },
  "yangyang-hajodae": { beachCode: "YHJD2", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YHJD2" },
  "yangyang-dongho": { beachCode: "YDH1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YDH1" },
  "yangyang-naksan": { beachCode: "YNS1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YNS1" },
  // ── 속초/고성/동해/강릉/삼척 ──
  "sokcho-beach": { beachCode: "SCC1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=SCC1" },
  "goseong-songjiho": { beachCode: "SJH1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=SJH1" },
  "goseong-cheonjin": { beachCode: "GCJ1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=GCJ1" },
  "goseong-jeongam": { beachCode: "YJA1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YJA1" },
  "donghae-daejin": { beachCode: "DJ2", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=DJ2" },
  "gangneung-geumjin": { beachCode: "GJ1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=GJ1" },
  "gangneung-gyeongpo": { beachCode: "GGP1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=GGP1" },
  "samcheok-yonghwa": { beachCode: "YWH1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=YWH1" },
  // ── 포항/울산/부산 ──
  "pohang-shinhangman": { beachCode: "SHM1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=SHM1" },
  "pohang-wolpo": { beachCode: "PWP1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=PWP1" },
  "ulsan-jinha": { beachCode: "JH1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JH1" },
  "busan-songjeong": { beachCode: "SJ2", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=SJ2" },
  "busan-dadaepo": { beachCode: "DDP1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=DDP1" },
  // ── 제주 ──
  "jeju-jungmun": { beachCode: "JM1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JM1" },
  "jeju-ihoteu": { beachCode: "JIT1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JIT1" },
  "jeju-sagye": { beachCode: "JSG1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JSG1" },
  "jeju-gwakji": { beachCode: "JGJ1", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=JGJ1" },
  // ── 서해 ──
  "taean-mallipo": { beachCode: "MLP2", credit: "WSB FARM", creditUrl: "https://www.wsbfarm.com/wavecam/WaveChartView?beach=MLP2" },
};

// 스팟 데이터에 실제 존재하는 id만 유효. 매핑 키가 spots.json에 없으면 무시된다.
export function getCamForSpot(spotId: string): BeachCam | null {
  return BEACH_CAMS[spotId] ?? null;
}

// CCTV 탭/빠른 필터용: 웹캠이 있는 스팟 id 집합
export const CAM_SPOT_IDS: Set<string> = new Set(Object.keys(BEACH_CAMS));

export function snapshotProxyUrl(cam: BeachCam): string | null {
  if (cam.stream) return null; // 라이브 스트림이 우선
  if (cam.beachCode) return `/api/cam?beach=${encodeURIComponent(cam.beachCode)}`;
  if (cam.fixedSnapshot) return cam.fixedSnapshot;
  return null;
}
