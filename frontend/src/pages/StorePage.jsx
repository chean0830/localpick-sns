import { useEffect, useState } from 'react';
import { storesApi } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { EventItem } from '../components/EventWidget.jsx';

export default function StorePage({ params }) {
  const { me } = useAuth();
  const toast = useToast();
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    storesApi.detail(params.id).then(setStore).catch((e) => setError(e.message));
    storesApi.posts(params.id).then(setPosts).catch(() => {});
    storesApi.events(params.id).then(setEvents).catch(() => {});
  }, [params.id]);

  const toggleFollow = async () => {
    if (!me) return navigate('/login');
    const prev = store;
    // 낙관적 업데이트
    setStore((s) => ({ ...s, following: !s.following, followerCount: s.followerCount + (s.following ? -1 : 1) }));
    try {
      const r = await storesApi.follow(store.id);
      setStore((s) => ({ ...s, following: r.following, followerCount: r.followerCount }));
      toast(r.following ? '단골 가게로 등록했어요!' : '팔로우를 취소했어요.');
    } catch (e) {
      setStore(prev);
      toast(e.message);
    }
  };

  if (error) return <div className="narrow"><div className="card empty">{error}</div></div>;
  if (!store) return <div className="container"><div className="card sk" style={{ height: 300 }} /></div>;

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="store-cover" />
        <div className="store-info">
          <div className="store-top">
            <div className="store-avatar">{store.name.charAt(0)}</div>
            {store.mine ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="btn btn-line" href={`#/dashboard/${store.id}`}>홍보 대시보드</a>
                <a className="btn btn-primary" href="#/write">홍보 글쓰기</a>
              </div>
            ) : (
              <button className={`btn ${store.following ? 'btn-line' : 'btn-primary'}`} onClick={toggleFollow}>
                {store.following ? '팔로잉 ✓' : '팔로우'}
              </button>
            )}
          </div>
          <h2 style={{ margin: '12px 0 4px' }}>{store.name} {store.status !== 'OK' && <span className="badge">승인 대기</span>}</h2>
          <div className="muted">{store.category} · {store.region} · {store.openHours || '영업시간 미등록'}</div>
          <div className="stats">
            <div><b>{store.postCount}</b><span className="muted">게시글</span></div>
            <div><b>{store.followerCount}</b><span className="muted">팔로워</span></div>
            <div><b>{store.eventCount}</b><span className="muted">이벤트</span></div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[['posts', '게시글'], ['events', '이벤트'], ['info', '가게 정보']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'posts' && (posts.length ? (
        <div className="thumb-grid">
          {posts.map((p) => (
            <a key={p.id} href={`#/posts/${p.id}`}>{p.images[0] ? <img src={p.images[0]} alt="" /> : p.content.slice(0, 40)}</a>
          ))}
        </div>
      ) : <div className="card empty">아직 게시글이 없어요.</div>)}

      {tab === 'events' && (events.length ? (
        <div className="card">
          {events.map((ev) => (
            <EventItem key={ev.id} ev={ev} onDownloaded={(id) => setEvents((prev) => prev.map((e) =>
              e.id === id ? { ...e, downloaded: true, issued: e.issued + 1, remaining: e.remaining - 1 } : e))} />
          ))}
        </div>
      ) : <div className="card empty">등록된 이벤트가 없어요.</div>)}

      {tab === 'info' && (
        <div className="card">
          <p><b>주소</b><br />{store.address}</p>
          <p><b>영업시간</b><br />{store.openHours || '-'}</p>
          <p><b>소개</b><br />{store.intro || '-'}</p>
          <p className="muted">사장님 · {store.ownerNickname}</p>
        </div>
      )}
    </div>
  );
}
