import { useEffect, useState } from 'react';
import { storesApi } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import CouponRing from '../components/CouponRing.jsx';

/** [확장 기능] 사장님 홍보 대시보드: 홍보 성과를 한 화면에서 확인 */
export default function DashboardPage({ params }) {
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const storeId = params.storeId;

  useEffect(() => {
    storesApi.mine().then((l) => setStores(l.filter((s) => s.status === 'OK'))).catch(() => {});
  }, []);

  useEffect(() => {
    setStats(null);
    Promise.all([storesApi.stats(storeId), storesApi.events(storeId)])
      .then(([s, e]) => { setStats(s); setEvents(e); })
      .catch((e) => setError(e.message));
  }, [storeId]);

  if (error) return <div className="narrow"><div className="card empty">{error}</div></div>;
  const maxView = Math.max(1, ...(stats?.topPosts || []).map((p) => p.viewCount));

  return (
    <div className="container dashboard">
      <div className="dash-head">
        <div>
          <p className="muted" style={{ margin: 0 }}>사장님 홍보 대시보드</p>
          <h2 style={{ margin: '4px 0 0' }}>{stores.find((s) => String(s.id) === storeId)?.name || '내 가게'}</h2>
        </div>
        {stores.length > 1 && (
          <select className="input" style={{ width: 180 }} value={storeId} onChange={(e) => navigate(`/dashboard/${e.target.value}`)}>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {!stats ? <div className="card sk" style={{ height: 320 }} /> : (
        <>
          <div className="kpi-row">
            {[['게시글', stats.postCount], ['총 조회수', stats.totalViews], ['받은 좋아요', stats.totalLikes], ['팔로워(단골)', stats.followerCount]].map(([l, v]) => (
              <div key={l} className="kpi"><span className="muted">{l}</span><b>{v.toLocaleString()}</b></div>
            ))}
          </div>

          <div className="dash-grid">
            <div className="card">
              <h3 className="section-title">쿠폰 사용률</h3>
              <CouponRing rate={stats.couponUseRate} used={stats.couponUsed} issued={stats.couponIssued} />
              <p className="muted" style={{ textAlign: 'center' }}>발급 {stats.couponIssued}장 중 {stats.couponUsed}장이 매장에서 사용됐어요.</p>
            </div>

            <div className="card">
              <h3 className="section-title">조회수 TOP 3 게시글</h3>
              {stats.topPosts.length === 0 && <p className="muted">아직 게시글이 없어요.</p>}
              {stats.topPosts.map((p, i) => (
                <a key={p.id} className="bar-row" href={`#/posts/${p.id}`}>
                  <span className="rank">{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ellipsis">{p.content}</div>
                    <div className="bar"><span style={{ width: `${(p.viewCount / maxView) * 100}%` }} /></div>
                  </div>
                  <span className="bar-value">{p.viewCount}회<br /><span className="muted">♥ {p.likeCount}</span></span>
                </a>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="section-title">이벤트별 쿠폰 발급 현황</h3>
            {events.length === 0 && <p className="muted">등록한 이벤트가 없어요. <a href="#/write" style={{ color: 'var(--coral)' }}>이벤트 글 쓰기</a></p>}
            {events.map((ev) => (
              <div key={ev.id} className="event-stat">
                <div><b>{ev.title}</b><div className="muted">{ev.startDate} ~ {ev.endDate} · {ev.benefit}</div></div>
                <div className="event-stat-bar">
                  <div className="progress"><span style={{ width: `${(ev.issued / ev.couponQty) * 100}%` }} /></div>
                  <span className="muted">{ev.issued}/{ev.couponQty}장 발급</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
