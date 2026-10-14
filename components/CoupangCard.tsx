const COUPANG_CARD_URL = "https://link.coupang.com/a/hsdzLh1vB6";

const COPY = {
  icon: "🏄",
  ko: "파도는 기다려야 오지만, 서프 왁스는 내일 와요",
  en: "Waves take patience. Gear doesn't.",
};

const CSS = `
.cpcard{display:block;margin:2rem auto;max-width:48rem;border-radius:1rem;border:1px solid rgba(128,128,128,.28);background:rgba(128,128,128,.07);padding:1.1rem 1.25rem;color:inherit;text-decoration:none;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
.cpcard:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.12);border-color:rgba(229,50,45,.55)}
.cpcard:active{transform:translateY(0);box-shadow:0 2px 6px rgba(0,0,0,.1)}
.cpcard:focus-visible{outline:2px solid #e5322d;outline-offset:3px}
.cpcard .cpcard-btn{transition:filter .15s ease}
.cpcard:hover .cpcard-btn{filter:brightness(1.08)}
@media (prefers-reduced-motion:reduce){.cpcard,.cpcard:hover,.cpcard:active{transition:none;transform:none}}
`;

/**
 * 본문 중간용 쿠팡 파트너스 카드 (광고). 카드 전체가 하나의 링크입니다.
 * 팝업·고정 오버레이 없이 본문 흐름 안에만 놓습니다. 한 페이지에 1~2개까지만 사용하세요.
 */
export function CoupangCard({ className = "" }: { className?: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <a
        href={COUPANG_CARD_URL}
        target="_blank"
        rel="sponsored noopener"
        aria-label={`광고: ${COPY.ko} — 쿠팡에서 보기 (새 창)`}
        data-coupang-card=""
        className={`cpcard ${className}`.trim()}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
          <span aria-hidden="true" style={{ fontSize: "1.9rem", lineHeight: 1 }}>
            {COPY.icon}
          </span>
          <span style={{ flex: "1 1 14rem", minWidth: 0, display: "block" }}>
            <span style={{ display: "block", fontWeight: 600, lineHeight: 1.5 }}>{COPY.ko}</span>
            <span style={{ display: "block", marginTop: "0.15rem", fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.4 }}>{COPY.en}</span>
          </span>
          <span
            className="cpcard-btn"
            aria-hidden="true"
            style={{
              flexShrink: 0,
              display: "inline-block",
              borderRadius: "999px",
              background: "#e5322d",
              color: "#fff",
              padding: "0.55rem 1.1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            쿠팡에서 보기
          </span>
        </span>
        <span style={{ display: "block", marginTop: "0.75rem", fontSize: "0.7rem", opacity: 0.6, lineHeight: 1.5 }}>
          <span style={{ marginRight: "0.35rem", border: "1px solid rgba(128,128,128,0.4)", borderRadius: "4px", padding: "0 0.3rem" }}>광고</span>
          이 포스트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </span>
      </a>
    </>
  );
}
