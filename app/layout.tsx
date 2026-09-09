import "./globals.css";

// 모바일 브라우저 상단 주소창 색상 + 안전영역(노치) 대응
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export const metadata = {
  metadataBase: new URL("https://surfwikikorea.vercel.app"),
  title: "서프위키Ai - 대한민국 전국 서핑 지도",
  description: "대한민국 전국 100개 서핑 스팟의 실시간 파도, 풍향 및 AI 서핑 점수 가이드",
  applicationName: "서프위키Ai",
  manifest: "/manifest.json",
  // 홈 화면에 추가하면 브라우저 UI 없이 독립 앱처럼 실행
  appleWebApp: {
    capable: true,
    title: "서프위키Ai",
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
    siteName: "서프위키Ai",
    title: "서프위키Ai - 대한민국 전국 서핑 지도",
    description: "전국 100개 서핑 스팟 실시간 파도 점수 · 해변 웹캠 · 숙소까지 한 번에",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
