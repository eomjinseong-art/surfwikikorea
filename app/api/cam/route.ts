// 공개 웹캠 스냅샷 프록시: 브라우저 CORS 제한 우회를 위해 서버에서 이미지를 가져온다.
// ?beach=CODE  → WSB FARM 해변 페이지에서 최신 프레임 경로를 자동 추적해 반환
// ?url=...     → 허용 목록 호스트의 고정 이미지 직접 프록시
// 오픈 프록시 방지를 위해 허용 목록(호스트/파라미터 화이트리스트) 외 요청은 거부한다.
import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0";
const ALLOWED_DIRECT_HOSTS = new Set(["www.wsbfarm.com"]);
const BEACH_CODE_RE = /^[A-Z0-9]{1,6}$/;
const IMG_PATH_RE = /\/upload\/wavecam\/\d+\/\d+\.jpg/;

// 해변 페이지 → 최신 프레임 경로 캐시 (프레임 번호가 롤링되므로 60초마다 재확인)
const pageCache = new Map<string, { img: string; at: number }>();

async function resolveSnapshotPath(beach: string): Promise<string | null> {
  const cached = pageCache.get(beach);
  if (cached && Date.now() - cached.at < 60_000) return cached.img;
  try {
    const res = await fetch(
      `https://www.wsbfarm.com/wavecam/WaveChartView?beach=${encodeURIComponent(beach)}`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000), cache: "no-store" }
    );
    if (!res.ok) return cached?.img ?? null;
    const html = await res.text();
    const m = html.match(IMG_PATH_RE);
    if (m) {
      pageCache.set(beach, { img: m[0], at: Date.now() });
      return m[0];
    }
  } catch {
    // 실패 시 캐시된 이전 경로로 폴백
  }
  return cached?.img ?? null;
}

async function fetchImage(url: string, referer?: string): Promise<NextResponse | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Referer: referer ?? "https://www.wsbfarm.com/" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 모드 1: 해변 코드로 최신 스냅샷 자동 추적
  const beach = searchParams.get("beach");
  if (beach) {
    if (!BEACH_CODE_RE.test(beach)) {
      return NextResponse.json({ error: "invalid beach code" }, { status: 400 });
    }
    const path = await resolveSnapshotPath(beach);
    if (!path) {
      return NextResponse.json({ error: "snapshot not found" }, { status: 404 });
    }
    const img = await fetchImage(`https://www.wsbfarm.com${path}`);
    return img ?? NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }

  // 모드 2: 고정 URL 직접 프록시 (호스트 화이트리스트)
  const target = searchParams.get("url");
  if (target) {
    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }
    if (parsed.protocol !== "https:" || !ALLOWED_DIRECT_HOSTS.has(parsed.hostname)) {
      return NextResponse.json({ error: "host not allowed" }, { status: 403 });
    }
    const img = await fetchImage(parsed.toString());
    return img ?? NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }

  return NextResponse.json({ error: "beach or url required" }, { status: 400 });
}
