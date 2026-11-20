import { useEffect, useMemo, useState } from 'react';
import { postsApi, storesApi } from '../lib/api.js';
import { parseTags } from '../lib/format.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import ImageDropzone from '../components/ImageDropzone.jsx';
import PostCard from '../components/PostCard.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

/** 입력값이 바뀔 때마다 다시 계산되는 실시간 유효성 검사 */
function validate({ type, storeId, content, images, event }) {
  const e = {};
  if (!content.trim()) e.content = '내용을 입력해 주세요.';
  else if (content.length > 3000) e.content = '3000자 이하로 입력해 주세요.';
  if (type !== 'NORMAL' && !storeId) e.storeId = '홍보할 가게를 선택해 주세요.';
  if (images.some((i) => i.status === 'uploading')) e.images = '사진 업로드가 끝날 때까지 기다려 주세요.';
  if (images.some((i) => i.status === 'error')) e.images = '업로드에 실패한 사진을 지워 주세요.';
  if (type === 'EVENT') {
    if (!event.title.trim()) e.evTitle = '이벤트명을 입력해 주세요.';
    if (!event.benefit.trim()) e.evBenefit = '혜택 내용을 입력해 주세요.';
    if (event.endDate < event.startDate) e.evDate = '종료일은 시작일 이후여야 해요.';
    if (!(event.couponQty >= 1)) e.evQty = '쿠폰은 1장 이상이어야 해요.';
  }
  return e;
}

export default function WritePage({ query }) {
  const { me, ready } = useAuth();
  const editId = query.id;
  const [type, setType] = useState('NORMAL');
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [content, setContent] = useState('');
  const [tagText, setTagText] = useState('');
  const [images, setImages] = useState([]);
  const [event, setEvent] = useState({ title: '', benefit: '', startDate: today(), endDate: plusDays(13), couponQty: 100 });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && !me) navigate('/login');
    if (me?.role === 'OWNER') {
      storesApi.mine().then((list) => {
        const ok = list.filter((s) => s.status === 'OK');
        setStores(ok);
        if (ok[0]) setStoreId(String(ok[0].id));
      });
    }
  }, [ready, me]);

  useEffect(() => {
    if (!editId) return;
    postsApi.detail(editId).then((p) => {
      setType(p.type);
      setContent(p.content);
      setTagText(p.tags.map((t) => `#${t}`).join(' '));
    });
  }, [editId]);

  const tags = parseTags(tagText);
  const errors = useMemo(() => validate({ type, storeId, content, images, event }), [type, storeId, content, images, event]);
  const valid = Object.keys(errors).length === 0;
  const show = (key) => touched[key] && errors[key];
  const touch = (key) => setTouched((t) => ({ ...t, [key]: true }));
  const setEv = (k, v) => setEvent((e) => ({ ...e, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ content: true, storeId: true, evTitle: true, evBenefit: true, evDate: true, evQty: true, images: true });
    if (!valid) return;
    setSubmitting(true);
    setServerError('');
    try {
      if (editId) {
        await postsApi.update(editId, { content, tags });
        navigate(`/posts/${editId}`);
        return;
      }
      const post = await postsApi.create({
        type,
        storeId: type === 'NORMAL' ? null : Number(storeId),
        content,
        imageUrls: images.map((i) => i.url),
        tags,
        event: type === 'EVENT' ? event : null,
      });
      navigate(`/posts/${post.id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const store = stores.find((s) => String(s.id) === storeId);
  const preview = {
    id: 0, type, status: 'OPEN', content, viewCount: 0, createdAt: new Date().toISOString(),
    authorNickname: me?.nickname || '나', storeId: type === 'NORMAL' ? null : store?.id,
    storeName: type === 'NORMAL' ? null : store?.name, images: images.map((i) => i.preview), tags,
    likeCount: 0, commentCount: 0, liked: false,
  };
  const isOwner = me?.role === 'OWNER';

  return (
    <div className="container write-layout">
      <form className="card" onSubmit={submit} noValidate>
        <h2 style={{ marginTop: 0 }}>{editId ? '게시글 수정' : '게시글 작성'}</h2>

        {!editId && (
          <div className="form-row">
            <label>게시글 유형</label>
            <div className="radio-chips">
              {[['NORMAL', '일반'], ['PROMO', '홍보'], ['EVENT', '이벤트']].map(([v, label]) => (
                <button type="button" key={v} className={`chip-btn ${type === v ? 'on' : ''}`}
                        disabled={v !== 'NORMAL' && !isOwner} onClick={() => setType(v)}>{label}</button>
              ))}
            </div>
            {!isOwner && <p className="hint">홍보·이벤트 글은 사장님 회원만 쓸 수 있어요.</p>}
          </div>
        )}

        {type !== 'NORMAL' && !editId && (
          <div className="form-row">
            <label htmlFor="store">가게 선택</label>
            <select id="store" className={`input ${show('storeId') ? 'invalid' : ''}`} value={storeId}
                    onChange={(e) => setStoreId(e.target.value)} onBlur={() => touch('storeId')}>
              {stores.length === 0 && <option value="">승인된 가게가 없어요 (마이페이지에서 등록)</option>}
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {show('storeId') && <p className="field-error">{errors.storeId}</p>}
          </div>
        )}

        {!editId && (
          <div className="form-row">
            <label>사진 <span className="muted">(최대 5장 · 첫 장이 대표 사진)</span></label>
            <ImageDropzone images={images} setImages={setImages} />
            {errors.images && <p className="field-error">{errors.images}</p>}
          </div>
        )}

        <div className="form-row">
          <label htmlFor="content">내용 <span className={`counter ${content.length > 3000 ? 'over' : ''}`}>{content.length}/3000</span></label>
          <textarea id="content" className={`input ${show('content') ? 'invalid' : ''}`} value={content}
                    onChange={(e) => setContent(e.target.value)} onBlur={() => touch('content')}
                    placeholder="가게 소식, 신메뉴, 이벤트를 알려 주세요" />
          {show('content') && <p className="field-error">{errors.content}</p>}
        </div>

        <div className="form-row">
          <label htmlFor="tags">해시태그</label>
          <input id="tags" className="input" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="#신메뉴 #망원동 (띄어쓰기로 구분)" />
          <div style={{ marginTop: 8 }}>{tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>
        </div>

        {type === 'EVENT' && !editId && (
          <div className="form-row coupon-box">
            <label>쿠폰 이벤트 설정</label>
            <div className="form-row">
              <input className={`input ${show('evTitle') ? 'invalid' : ''}`} value={event.title} onBlur={() => touch('evTitle')}
                     onChange={(e) => setEv('title', e.target.value)} placeholder="이벤트명 (예: 오픈 2주년 20% 할인)" />
              {show('evTitle') && <p className="field-error">{errors.evTitle}</p>}
            </div>
            <div className="form-row">
              <input className={`input ${show('evBenefit') ? 'invalid' : ''}`} value={event.benefit} onBlur={() => touch('evBenefit')}
                     onChange={(e) => setEv('benefit', e.target.value)} placeholder="혜택 내용 (예: 전 메뉴 20% 할인)" />
              {show('evBenefit') && <p className="field-error">{errors.evBenefit}</p>}
            </div>
            <div className="grid-3">
              <div><label>시작일</label><input className="input" type="date" value={event.startDate} onChange={(e) => { setEv('startDate', e.target.value); touch('evDate'); }} /></div>
              <div><label>종료일</label><input className={`input ${show('evDate') ? 'invalid' : ''}`} type="date" value={event.endDate} onChange={(e) => { setEv('endDate', e.target.value); touch('evDate'); }} /></div>
              <div><label>쿠폰 수량</label><input className="input" type="number" min="1" value={event.couponQty} onChange={(e) => { setEv('couponQty', Number(e.target.value)); touch('evQty'); }} /></div>
            </div>
            {(show('evDate') || show('evQty')) && <p className="field-error">{errors.evDate || errors.evQty}</p>}
          </div>
        )}

        {serverError && <p className="field-error">{serverError}</p>}
        <div className="row-end">
          <button type="button" className="btn btn-line" onClick={() => window.history.back()}>취소</button>
          <button className="btn btn-primary" disabled={!valid || submitting}>{submitting ? '등록 중…' : editId ? '수정' : '등록'}</button>
        </div>
      </form>

      <aside className="preview-col">
        <h3 className="section-title">피드 미리보기</h3>
        <PostCard post={preview} preview />
      </aside>
    </div>
  );
}
