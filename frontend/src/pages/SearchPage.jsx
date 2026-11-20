import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import PostCard from '../components/PostCard.jsx';

export default function SearchPage({ query }) {
  const { q = '', tag } = query;
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(tag ? { tag } : { q });
    if (!tag && !q) {
      api('/api/stores?q=').then((stores) => setResult({ stores, posts: [] }));
      return;
    }
    api(`/api/search?${params}`).then(setResult);
  }, [q, tag]);

  const update = (id, patch) => setResult((r) => ({ ...r, posts: r.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  return (
    <div className="narrow" style={{ maxWidth: 720 }}>
      <h2>{tag ? `#${tag}` : q ? `‘${q}’ 검색 결과` : '가게 찾기'}</h2>
      {!result && <div className="card sk" style={{ height: 120 }} />}
      {result?.stores.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">가게</h3>
          {result.stores.map((s) => (
            <a key={s.id} className="list-item" href={`#/stores/${s.id}`}><b>{s.name}</b><span className="muted">{s.category} · {s.region}</span></a>
          ))}
        </div>
      )}
      {result && (q || tag) && (
        <>
          <h3 className="section-title">게시글</h3>
          <div className="feed">
            {result.posts.length === 0 && <div className="card empty">검색 결과가 없어요.</div>}
            {result.posts.map((p) => <PostCard key={p.id} post={p} onChange={update} />)}
          </div>
        </>
      )}
    </div>
  );
}
