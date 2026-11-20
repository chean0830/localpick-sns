export default function CouponRing({ rate, used, issued }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`쿠폰 사용률 ${rate}%`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg)" strokeWidth="14" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--coral)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c * (1 - rate / 100)} transform="rotate(-90 70 70)" />
        <text x="70" y="68" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">{rate}%</text>
        <text x="70" y="90" textAnchor="middle" fontSize="12" fill="var(--gray)">{used}/{issued}장 사용</text>
      </svg>
    </div>
  );
}
