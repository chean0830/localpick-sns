import { useEffect, useState } from 'react';
import { api, eventsApi, storesApi } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PostCard from '../components/PostCard.jsx';

const STATUS = { WAIT: '승인 대기', OK: '운영 중', REJECT: '반려' };
const COUPON = { UNUSED: '사용 가능', USED: '사용 완료', EXPIRED: '기간 만료' };

function StoreForm({ onCreated }) {
  const toast = useToast();
  const [f, setF] = useState({ name: '', category: '', address: '', region: '', openHours: '', intro: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      await storesApi.create(f);
      toast('등록 신청 완료! 관리자 승인 후 운영됩니다.');
      onCreated();
    } catch (err) { toast(err.message); }
  };
  return (
    <form className="card" onSubmit={submit}>
      <h3 className="section-title">새 가게 등록</h3>
      <div className="grid-2">
        <div className="form-row"><label>가게명</label><input className="input" value={f.name} onChange={set('name')} required /></div>
        <div className="form-row"><label>업종</label><input className="input" value={f.category} onChange={set('category')} required /></div>
      </div>
      <div className="form-row"><label>주소</label><input className="input" value={f.address} onChange={set('address')} required /></div>
      <div className="grid-2">
        <div className="form-row"><label>동네</label><input className="input" value={f.region} onChange={set('region')} required /></div>
        <div className="form-row"><label>영업시간</label><input className="input" value={f.openHours} onChange={set('openHours')} /></div>
      </div>
      <button className="btn btn-primary">등록 신청</button>
    </form>
  );
}

export default function MyPage({ query }) {
  const { me, ready } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState(query.tab || 'coupons');
  const [data, setData] = useState(null);

  const load = async (t) => {
    setData(null);
    if (t === 'coupons') setData(await eventsApi.myCoupons());
    if (t === 'posts') setData(await api('/api/posts/mine'));
    if (t === 'following') setData(await storesApi.following());
    if (t === 'stores') setData(await storesApi.mine());
  };

  useEffect(() => {
    if (ready && !me) navigate('/login');
    if (me) load(tab).catch((e) => toast(e.message));
  }, [ready, me, tab]);

  const redeemCoupon = async (id) => {
    if (!window.confirm('매장 직원에게 화면을 보여 준 뒤 눌러 주세요. 사용 처리할까요?')) return;
    try {
      const c = await eventsApi.use(id);
      setData((list) => list.map((x) => (x.id === id ? c : x)));
    } catch (e) { toast(e.message); }
  };

  if (!me) return null;
  const tabs = [['coupons', '내 쿠폰함'], ['posts', '내 게시글'], ['following', '팔로우 가게'], ...(me.role === 'OWNER' ? [['stores', '내 가게']] : [])];

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <div className="card profile">
        <div className="avatar big">{me.nickname.charAt(0)}</div>
        <div>
          <b style={{ fontSize: 18 }}>{me.nickname}</b>
          <div className="muted">{me.email} · {me.role === 'OWNER' ? '사장님 회원' : me.role === 'ADMIN' ? '관리자' : '일반 회원'}</div>
        </div>
      </div>
      <div className="tabs">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {data === null && <div className="card sk" style={{ height: 160 }} />}

      {data && tab === 'coupons' && (
        <div className="coupon-grid">
          {data.length === 0 && <div className="card empty">받은 쿠폰이 없어요.</div>}
          {data.map((c) => (
            <div key={c.id} className={`coupon ${c.status}`}>
              <div>
                <div className="coupon-benefit">{c.benefit}</div>
                <div className="muted">{c.storeName} · {c.eventTitle}</div>
                <div className="muted">~{c.endDate}까지</div>
              </div>
              {c.status === 'UNUSED'
                ? <button className="btn btn-primary btn-sm" onClick={() => redeemCoupon(c.id)}>매장에서 사용</button>
                : <span className="badge">{COUPON[c.status]}</span>}
            </div>
          ))}
        </div>
      )}

      {data && tab === 'posts' && (
        <div className="feed">
          {data.length === 0 && <div className="card empty">작성한 게시글이 없어요.</div>}
          {data.map((p) => <PostCard key={p.id} post={p} onChange={(id, patch) => setData((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)))} />)}
        </div>
      )}

      {data && tab === 'following' && (
        <div className="card">
          {data.length === 0 && <p className="empty">팔로우한 가게가 없어요.</p>}
          {data.map((s) => (
            <a key={s.id} className="list-item" href={`#/stores/${s.id}`}><b>{s.name}</b><span className="muted">{s.category} · {s.region}</span></a>
          ))}
        </div>
      )}

      {data && tab === 'stores' && (
        <>
          {data.map((s) => (
            <div key={s.id} className="card list-item" style={{ marginBottom: 12 }}>
              <div><b>{s.name}</b> <span className="muted">{s.category} · {s.region}</span></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${s.status === 'OK' ? 'PROMO' : ''}`}>{STATUS[s.status]}</span>
                {s.status === 'OK' && <a className="btn btn-navy btn-sm" href={`#/dashboard/${s.id}`}>홍보 대시보드</a>}
              </div>
            </div>
          ))}
          <StoreForm onCreated={() => load('stores')} />
        </>
      )}
    </div>
  );
}
