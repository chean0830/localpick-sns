export default function SkeletonCard() {
  return (
    <div className="post skeleton" aria-hidden="true">
      <div className="post-head">
        <div className="avatar sk" />
        <div style={{ flex: 1 }}>
          <div className="sk sk-line" style={{ width: '40%' }} />
          <div className="sk sk-line" style={{ width: '25%', marginTop: 6 }} />
        </div>
      </div>
      <div className="sk" style={{ aspectRatio: '4 / 3' }} />
      <div style={{ padding: 16 }}>
        <div className="sk sk-line" />
        <div className="sk sk-line" style={{ width: '70%', marginTop: 8 }} />
      </div>
    </div>
  );
}
