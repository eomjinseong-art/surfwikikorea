import "./globals.css";

export const metadata = {
  title: "SurfMaster AI - 대한민국 전국 서핑 지도",
  description: "실시간 파도 & AI 서핑 점수 지도",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
