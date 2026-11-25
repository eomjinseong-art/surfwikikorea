// 공용 광고 박스 자리. 광고 내용은 https://nadoo-ads.vercel.app/ads.json 에서 관리한다.
export function NadooAd({
  inline = false,
  types,
  exclude,
}: {
  inline?: boolean;
  types?: string;
  exclude?: string;
}) {
  const slot = (
    <div
      className="nadoo-ad"
      {...(types ? { "data-types": types } : {})}
      {...(exclude ? { "data-exclude": exclude } : {})}
    />
  );
  if (inline) return slot;
  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "0 16px" }}>
      {slot}
    </div>
  );
}
