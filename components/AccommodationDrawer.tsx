"use client";

import { X, BedDouble, MapPin, ExternalLink, Store } from "lucide-react";

export default function AccommodationDrawer({ accommodation, onClose }: any) {
  if (!accommodation) return null;

  const kind = accommodation.kind === "shop" || String(accommodation.id || "").startsWith("shop-") ? "shop" : "stay";
  const bookingUrl = accommodation.bookingUrl || accommodation.localSiteUrl || accommodation.couponUrl;
  const isCoupang = /coupang\.com|link\.coupang\.com/i.test(bookingUrl || "");

  return (
    <div className="absolute mobile-drawer-safe md:bottom-20 left-0 right-0 md:left-6 md:right-auto md:w-[410px] bg-white/98 backdrop-blur-md rounded-t-3xl md:rounded-3xl shadow-2xl z-[1001] border border-slate-200/80 p-5 max-h-[80vh] overflow-y-auto transition-all animate-slideUp">
      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                kind === "shop" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
              }`}
            >
              {kind === "shop" ? "서핑샵" : "숙소"} · {accommodation.region} • {accommodation.subRegion || "-"}
            </span>
            {accommodation.type && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {accommodation.type}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1.5 tracking-tight flex items-center gap-1.5">
            {kind === "shop" ? <Store size={18} className="text-emerald-600" /> : <BedDouble size={18} className="text-violet-600" />}
            {accommodation.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {accommodation.desc || accommodation.type || ""}
          </p>
          {accommodation.nearSpotName && (
            <p className="text-[11px] text-sky-600 font-bold mt-1">근처 스팟 · {accommodation.nearSpotName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>
      </div>

      {accommodation.image && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          <img src={accommodation.image} alt={accommodation.name} className="w-full h-40 object-cover" loading="lazy" />
        </div>
      )}

      <div className="mt-4 space-y-2 text-xs">
        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-2">
          <MapPin size={15} className={kind === "shop" ? "text-emerald-600 mt-0.5 shrink-0" : "text-violet-600 mt-0.5 shrink-0"} />
          <div>
            <div className="text-[10px] text-slate-400">위치</div>
            <div className="font-semibold text-slate-700">{accommodation.address || accommodation.location || "위치 정보 없음"}</div>
          </div>
        </div>
      </div>

      {bookingUrl && (
        <div className="mt-4">
          <a
            href={bookingUrl}
            target="_blank"
            rel={isCoupang ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            className={`w-full py-3 text-white font-extrabold rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
              kind === "shop" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            <ExternalLink size={14} />
            {isCoupang ? "쿠팡에서 예약하기" : kind === "shop" ? "서핑샵 바로가기" : "예약 사이트 열기"}
          </a>
        </div>
      )}

      {isCoupang && (
        <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
        </p>
      )}
    </div>
  );
}
