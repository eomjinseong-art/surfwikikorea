// 공용 광고 박스 자리. 광고 내용은 https://nadoo-ads.vercel.app/ads.json 에서 관리한다.
export function NadooAd({ inline = false }: { inline?: boolean }) {
  if (inline) return <div className="nadoo-ad" />;
  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "0 16px" }}>
      <div className="nadoo-ad" />
    </div>
  );
}
