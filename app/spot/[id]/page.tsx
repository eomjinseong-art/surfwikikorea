import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import spotsData from "@/data/spots.json";
import SpotClient from "./SpotClient";
import {
  MapPin,
  Waves,
  Wind,
  Mountain,
  ArrowLeft,
  Compass,
  Shield,
} from "lucide-react";

/* ── helpers ── */

type Spot = (typeof spotsData)[number];

function getSpot(id: string): Spot | undefined {
  return spotsData.find((s) => s.id === id);
}

function difficultyKo(d: string) {
  switch (d) {
    case "Beginner":
      return "초보 입문";
    case "Intermediate":
      return "중급자";
    case "Advanced":
      return "상급자 전용";
    case "All":
      return "전 레벨 (초급~상급)";
    default:
      return d;
  }
}

function difficultyDesc(d: string) {
  switch (d) {
    case "Beginner":
      return "파도가 완만하고 수심이 얕아 입문자·강습에 적합합니다. 안전하게 첫 서핑을 경험할 수 있습니다.";
    case "Intermediate":
      return "일정 수준의 패들·테이크오프 능력이 필요합니다. 다양한 파도 사이즈에 대응할 수 있는 중급 서퍼에게 추천합니다.";
    case "Advanced":
      return "파워풀한 파도나 리프 브레이크가 있어 숙련된 서퍼에게만 적합합니다. 충분한 경험과 안전 장비가 필수입니다.";
    case "All":
      return "초보부터 상급자까지 모든 레벨이 즐길 수 있는 다목적 스팟입니다. 파도 사이즈에 따라 다양한 경험을 제공합니다.";
    default:
      return "";
  }
}

function windDirLabel(deg: number) {
  const dirs = [
    "북(N)",
    "북북동(NNE)",
    "북동(NE)",
    "동북동(ENE)",
    "동(E)",
    "동남동(ESE)",
    "남동(SE)",
    "남남동(SSE)",
    "남(S)",
    "남남서(SSW)",
    "남서(SW)",
    "서남서(WSW)",
    "서(W)",
    "서북서(WNW)",
    "북서(NW)",
    "북북서(NNW)",
  ];
  const idx = Math.round(deg / 22.5) % 16;
  return `${dirs[idx]} (${deg}°)`;
}

/* ── SSG ── */

export function generateStaticParams() {
  return spotsData.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const spot = getSpot(id);
  if (!spot) return { title: "스팟을 찾을 수 없습니다" };

  const title = `${spot.name} 서핑 정보 — 서프위키Ai`;
  const description = `${spot.description} | 지역: ${spot.subRegion} (${spot.region}) | 난이도: ${difficultyKo(spot.difficulty)} | 바닥: ${spot.bottomType}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/spot/${spot.id}`,
    },
    openGraph: {
      title,
      description,
      locale: "ko_KR",
      type: "article",
      siteName: "서프위키Ai",
      url: `/spot/${spot.id}`,
    },
  };
}

/* ── page component ── */

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = getSpot(id);
  if (!spot) notFound();

  /* JSON-LD structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Beach", "TouristAttraction"],
    name: spot.name,
    description: spot.description,
    address: {
      "@type": "PostalAddress",
      addressRegion: spot.subRegion,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.lat,
      longitude: spot.lng,
    },
    touristType: "Surfer",
    url: `https://surfwikikorea.vercel.app/spot/${spot.id}`,
    isAccessibleForFree: true,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "난이도",
        value: difficultyKo(spot.difficulty),
      },
      {
        "@type": "PropertyValue",
        name: "바닥 타입",
        value: spot.bottomType,
      },
      {
        "@type": "PropertyValue",
        name: "최적 바람 방향",
        value: windDirLabel(spot.optimalWindDir),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* ── header bar ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 transition shrink-0"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-extrabold hidden sm:inline">
                서프위키Ai 메인
              </span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black text-slate-900 truncate">
                {spot.name}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold truncate">
                {spot.subRegion} · {spot.region}
              </p>
            </div>
            <span className="text-2xl shrink-0">🏄‍♂️</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* ── hero card ── */}
          <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* title section */}
            <div className="p-5 pb-4">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-[11px] font-extrabold px-2 py-1 rounded-lg bg-sky-100 text-sky-700">
                  {spot.region}
                </span>
                <span className="text-[11px] font-extrabold px-2 py-1 rounded-lg bg-sky-50 text-sky-600">
                  {spot.subRegion}
                </span>
                <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {difficultyKo(spot.difficulty)}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-2">
                {spot.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {spot.description}
              </p>
            </div>

            {/* info grid */}
            <div className="grid grid-cols-2 gap-px bg-slate-100">
              <InfoCell
                icon={<MapPin size={14} className="text-sky-500" />}
                label="위치"
                value={spot.subRegion}
              />
              <InfoCell
                icon={<Mountain size={14} className="text-sky-500" />}
                label="바닥 타입"
                value={spot.bottomType}
              />
              <InfoCell
                icon={<Wind size={14} className="text-sky-500" />}
                label="최적 바람 방향"
                value={windDirLabel(spot.optimalWindDir)}
              />
              <InfoCell
                icon={<Shield size={14} className="text-sky-500" />}
                label="난이도"
                value={difficultyKo(spot.difficulty)}
              />
            </div>
          </article>

          {/* ── difficulty guide ── */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-sky-500" />
              난이도 안내 · {difficultyKo(spot.difficulty)}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {difficultyDesc(spot.difficulty)}
            </p>
          </section>

          {/* ── wind direction guide ── */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Compass size={16} className="text-sky-500" />
              바람 방향 가이드
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              이 스팟의 최적 바람 방향(오프쇼어)은{" "}
              <strong className="text-sky-700">
                {windDirLabel(spot.optimalWindDir)}
              </strong>
              입니다. 오프쇼어 바람은 해안에서 바다 쪽으로 부는 바람으로, 파도면을
              깨끗하게 정리하여 최적의 서핑 컨디션을 만들어줍니다. 반대로 온쇼어
              바람이 강하면 파도가 지저분해지고 서핑하기 어려워집니다.
            </p>
            <div className="mt-3 p-3 bg-sky-50 rounded-xl">
              <p className="text-[11px] font-bold text-sky-700">
                💡 팁: 이른 아침(6~9시)에는 바람이 약해 글래시(Glassy) 컨디션이
                형성되기 쉽습니다. {spot.name}에서 서핑하기 가장 좋은 시간대입니다.
              </p>
            </div>
          </section>

          {/* ── coordinates ── */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-sky-500" />
              위치 정보
            </h2>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-slate-400 font-bold text-[11px]">
                  위도
                </span>
                <p className="text-slate-700 font-semibold">{spot.lat}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold text-[11px]">
                  경도
                </span>
                <p className="text-slate-700 font-semibold">{spot.lng}</p>
              </div>
            </div>
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold text-xs rounded-xl transition shadow-sm"
            >
              🚗 카카오맵 길찾기
            </a>
          </section>

          {/* ── real-time client section ── */}
          <SpotClient spotId={spot.id} spotName={spot.name} />

          {/* ── back to main CTA ── */}
          <section className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-5 text-center shadow-md">
            <p className="text-white/80 text-xs font-bold mb-2">
              서프위키Ai에서 실시간 AI 서핑 점수를 확인하세요
            </p>
            <Link
              href={`/?spot=${spot.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-sky-50 text-sky-700 font-black text-sm rounded-2xl transition shadow-lg"
            >
              <Waves size={18} />
              {spot.name} 실시간 점수 보기
            </Link>
          </section>

          {/* ── data credit ── */}
          <footer className="text-center pb-6">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              이 페이지의 데이터는{" "}
              <strong className="text-slate-500">서프위키Ai</strong>가 제공하며,
              <br />
              실시간 파도·바람 AI 점수는 메인 페이지에서 확인할 수 있습니다.
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              © {new Date().getFullYear()} 서프위키Ai. 대한민국 전국 100개 서핑
              스팟 가이드.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

/* ── sub-component ── */

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-extrabold text-slate-400">
          {label}
        </span>
      </div>
      <p className="text-[13px] font-bold text-slate-800">{value}</p>
    </div>
  );
}
