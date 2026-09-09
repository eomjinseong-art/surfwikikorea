// 초기 로딩 시 스켈레톤 화면: 사용자가 "앱이 꺼진 것처럼" 느끼지 않도록 즉시 표시된다
export default function Loading() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-100 gap-4">
      <span className="text-4xl animate-bounce">🏄‍♂️</span>
      <div className="text-xs font-black text-slate-700">서프위키Ai 불러오는 중...</div>
      <div className="w-40 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full w-1/2 bg-sky-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
