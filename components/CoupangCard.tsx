const COUPANG_CARD_URL = "https://link.coupang.com/a/hsdzLh1vB6";

const COPY = {
  icon: "🏄",
  ko: "파도는 기다려야 오지만, 서프 왁스는 내일 와요",
  en: "Waves take patience. Gear doesn't.",
};

/**
 * 본문 중간용 쿠팡 파트너스 카드 (광고). 팝업·고정 오버레이 없이 본문 흐름 안에만 놓입니다.
 * 한 페이지에 1~2개까지만 사용하세요 (하단 배너 별도).
 */
export function CoupangCard({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="광고"
      data-coupang-card=""
      className={className}
      style={{
        margin: "2rem auto",
        maxWidth: "48rem",
        borderRadius: "1rem",
        border: "1px solid rgba(128,128,128,0.28)",
        background: "rgba(128,128,128,0.07)",
        padding: "1.1rem 1.25rem",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
        <span aria-hidden="true" style={{ fontSize: "1.9rem", lineHeight: 1 }}>
          {COPY.icon}
        </span>
        <div style={{ flex: "1 1 14rem", minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.5 }}>{COPY.ko}</p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.4 }}>{COPY.en}</p>
        </div>
        <a
          href={COUPANG_CARD_URL}
          target="_blank"
          rel="sponsored noopener"
          style={{
            flexShrink: 0,
            display: "inline-block",
            borderRadius: "999px",
            background: "#e5322d",
            color: "#fff",
            padding: "0.55rem 1.1rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          쿠팡에서 보기
        </a>
      </div>
      <p style={{ margin: "0.75rem 0 0", fontSize: "0.7rem", opacity: 0.6, lineHeight: 1.5 }}>
        <span style={{ marginRight: "0.35rem", border: "1px solid rgba(128,128,128,0.4)", borderRadius: "4px", padding: "0 0.3rem" }}>광고</span>
        이 포스트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </aside>
  );
}
