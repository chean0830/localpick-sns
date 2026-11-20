import { useEffect, useState } from 'react';
import { eventsApi } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function EventItem({ ev, onDownloaded }) {
  const { me } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const soldOut = ev.remaining <= 0;
  const percent = Math.round((ev.issued / ev.couponQty) * 100);

  const download = async () => {
    if (!me) return navigate('/login');
    setBusy(true);
    try {
      await eventsApi.download(ev.id);
      onDownloaded(ev.id);
      toast('쿠폰을 받았어요! 마이페이지 쿠폰함에서 확인하세요.');
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="event-item">
      <div className="title">{ev.title}</div>
      <div className="muted"><a href={`#/stores/${ev.storeId}`}>{ev.storeName}</a> · ~{ev.endDate}</div>
      <div className="progress" title={`${ev.issued}/${ev.couponQty}장 발급`}><span style={{ width: `${percent}%` }} /></div>
      <div className="event-row">
        <span className="muted">남은 {ev.remaining}장</span>
        <button className={`btn btn-sm ${ev.downloaded || soldOut ? 'btn-line' : 'btn-primary'}`}
                disabled={ev.downloaded || soldOut || busy} onClick={download}>
          {ev.downloaded ? '받음 ✓' : soldOut ? '소진' : busy ? '받는 중…' : '쿠폰 받기'}
        </button>
      </div>
    </div>
  );
}

export default function EventWidget() {
  const [events, setEvents] = useState(null);
  useEffect(() => { eventsApi.ongoing().then(setEvents).catch(() => setEvents([])); }, []);

  const onDownloaded = (id) => setEvents((prev) => prev.map((e) =>
    e.id === id ? { ...e, downloaded: true, issued: e.issued + 1, remaining: e.remaining - 1 } : e));

  return (
    <div className="widget">
      <h3 className="section-title">진행 중 이벤트</h3>
      {events === null && <div className="sk" style={{ height: 80, borderRadius: 8 }} />}
      {events?.length === 0 && <p className="muted">진행 중인 이벤트가 없어요.</p>}
      {events?.slice(0, 3).map((ev) => <EventItem key={ev.id} ev={ev} onDownloaded={onDownloaded} />)}
    </div>
  );
}
