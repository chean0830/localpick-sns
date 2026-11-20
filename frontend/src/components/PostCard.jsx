import { TYPE_LABEL, timeAgo } from '../lib/format.js';
import { useOptimisticLike } from '../hooks/useOptimisticLike.js';

export default function PostCard({ post, onChange, preview = false }) {
  const toggleLike = useOptimisticLike(post, (patch) => onChange?.(post.id, patch));
  const who = post.storeName || post.authorNickname;
  const detail = preview ? undefined : `#/posts/${post.id}`;

  return (
    <article className="post">
      <div className="post-head">
        <div className="avatar">{who.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <a className="name" href={post.storeId && !preview ? `#/stores/${post.storeId}` : undefined}>{who}</a>
          <div className="muted">{preview ? '미리보기' : `${timeAgo(post.createdAt)} · 조회 ${post.viewCount}`}</div>
        </div>
        {post.status === 'BLIND' && <span className="badge BLIND">블라인드</span>}
        <span className={`badge ${post.type}`}>{TYPE_LABEL[post.type]}</span>
      </div>
      {post.images.length > 0 && (
        <a className="post-images" href={detail}>
          {post.images.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
        </a>
      )}
      <a className="post-body" href={detail}>{post.content || <span className="muted">내용을 입력하면 여기에 표시돼요</span>}</a>
      {post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map((t) => <a key={t} className="tag" href={preview ? undefined : `#/search?tag=${encodeURIComponent(t)}`}>#{t}</a>)}
        </div>
      )}
      <div className="post-foot">
        <button className={`like-btn ${post.liked ? 'on' : ''}`} onClick={preview ? undefined : toggleLike} aria-pressed={post.liked}>
          ♥ <span>{post.likeCount}</span>
        </button>
        <a href={detail}>댓글 {post.commentCount}</a>
      </div>
    </article>
  );
}
