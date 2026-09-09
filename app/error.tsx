"use client";

// 런타임 오류가 나도 지도 앱 전체가 하얗게 꺼지지 않도록 하는 에러 바운더리
// (모바일에서 "자꾸 꺼지는" 증상의 방어선)
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("서프위키Ai 런타임 오류:", error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-100 px-6 text-center gap-4">
      <span className="text-4xl">🌊</span>
      <h2 className="text-base font-black text-slate-900">
        잠시 문제가 발생했어요
      </h2>
      <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
        실시간 해양 데이터를 불러오는 중 오류가 발생했습니다.
        <br />
        아래 버튼을 눌러 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold rounded-xl shadow-md transition"
      >
        다시 시도
      </button>
    </div>
  );
}
