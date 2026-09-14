import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://surfwikikorea.vercel.app";
const SITE_NAME = "서프위키Ai";
const SITE_TITLE = "서프위키Ai - 대한민국 전국 서핑 지도";
const SITE_DESCRIPTION =
  "대한민국 전국 100개 서핑 스팟의 실시간 파도, 풍향 및 AI 서핑 점수 가이드";
const OG_DESCRIPTION =
  "전국 100개 서핑 스팟 실시간 파도 점수 · 해변 웹캠 · 숙소까지 한 번에";
const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

// 모바일 브라우저 상단 주소창 색상 + 안전영역(노치) 대응
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  // 홈 화면에 추가하면 브라우저 UI 없이 독립 앱처럼 실행
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: OG_DESCRIPTION,
    locale: "ko_KR",
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 외부 API/지도 사전연결: 첫 실시간 조회 TTFB 단축 */}
        <link rel="preconnect" href="https://marine-api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://marine-api.open-meteo.com" />
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
