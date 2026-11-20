import { useEffect, useState } from 'react';
import { postsApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed.js';
import PostCard from '../components/PostCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import EventWidget from '../components/EventWidget.jsx';

const TABS = [
  ['all', '전체 피드'],
  ['follow', '팔로우 피드'],
  ['local', '우리동네'],
  ['event', '이벤트'],
];

function FeedList({ tab, region }) {
  const { items, loading, hasNext, error, sentinelRef, updateItem } = useInfiniteFeed(tab, region);

  if (error) return <div className="card empty">{error}</div>;
  if (!loading && items.length === 0) {
    return <div className="card empty">{tab === 'follow' ? '아직 팔로우한 가게가 없어요. 가게를 찾아 단골 등록해 보세요!' : '게시글이 없습니다.'}</div>;
  }
  return (
    <div className="feed">
      {items.map((p) => <PostCard key={p.id} post={p} onChange={updateItem} />)}
      {loading && [0, 1].map((i) => <SkeletonCard key={i} />)}
      {hasNext && <div ref={sentinelRef} className="sentinel" />}
      {!hasNext && items.length > 0 && <p className="muted end">모든 소식을 다 봤어요 👋</p>}
    </div>
  );
}

export default function FeedPage({ query }) {
  const { me } = useAuth();
  const [tab, setTab] = useState(query.tab || 'all');
  const [regionInput, setRegionInput] = useState(localStorage.getItem('lp-region') || '망원동');
  const [region, setRegion] = useState(regionInput);
  const [tags, setTags] = useState([]);

  useEffect(() => { postsApi.popularTags().then(setTags).catch(() => {}); }, []);

  return (
    <div className="container layout">
      <nav className="side-nav">
        {TABS.map(([key, label]) => (
          <a key={key} href={`#/?tab=${key}`} className={tab === key ? 'active' : ''}
             onClick={(e) => { e.preventDefault(); setTab(key); }}>{label}</a>
        ))}
        <a href="#/search?q=">가게 찾기</a>
      </nav>

      <section>
        {tab === 'local' && (
          <form className="card region-form"
                onSubmit={(e) => { e.preventDefault(); localStorage.setItem('lp-region', regionInput); setRegion(regionInput.trim()); }}>
            <input className="input" value={regionInput} onChange={(e) => setRegionInput(e.target.value)} placeholder="동네 이름 (예: 망원동)" />
            <button className="btn btn-primary">보기</button>
          </form>
        )}
        {tab === 'follow' && !me ? (
          <div className="card empty">로그인하면 팔로우한 가게 소식을 볼 수 있어요.<br /><br /><a className="btn btn-navy" href="#/login">로그인</a></div>
        ) : (
          // key가 바뀌면 FeedList가 새로 마운트되어 페이지·목록 상태가 초기화된다
          <FeedList key={`${tab}|${region}`} tab={tab} region={tab === 'local' ? region : ''} />
        )}
      </section>

      <aside>
        <EventWidget />
        <div className="widget">
          <h3 className="section-title">인기 해시태그</h3>
          {tags.map((t) => <a key={t} className="chip" href={`#/search?tag=${encodeURIComponent(t)}`}>#{t}</a>)}
        </div>
      </aside>
    </div>
  );
}
