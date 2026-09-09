import "./globals.css";

export const metadata = {
  title: "서프위키Ai - 대한민국 전국 서핑 지도",
  description: "대한민국 전국 86개 서핑 스팟의 실시간 파도, 풍향 및 AI 서핑 점수 가이드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
