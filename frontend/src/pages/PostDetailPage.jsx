import { useEffect, useState } from 'react';
import { postsApi } from '../lib/api.js';
import { timeAgo } from '../lib/format.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PostCard from '../components/PostCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

export default function PostDetailPage({ params }) {
  const { me } = useAuth();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    postsApi.detail(params.id).then(setPost).catch((e) => setError(e.message));
    postsApi.comments(params.id).then(setComments).catch(() => {});
  }, [params.id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!me) return navigate('/login');
    if (!text.trim()) return;
    try {
      const c = await postsApi.addComment(params.id, text);
      setComments((prev) => [...prev, c]);
      setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
      setText('');
    } catch (err) { toast(err.message); }
  };

  const removeComment = async (id) => {
    await postsApi.removeComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const removePost = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    await postsApi.remove(post.id);
    navigate('/');
  };

  if (error) return <div className="narrow"><div className="card empty">{error}</div></div>;
  return (
    <div className="narrow">
      {post ? <PostCard post={post} onChange={(_, patch) => setPost((p) => ({ ...p, ...patch }))} /> : <SkeletonCard />}
      {post?.mine && (
        <div className="row-end">
          <a className="btn btn-line btn-sm" href={`#/write?id=${post.id}`}>수정</a>
          <button className="btn btn-line btn-sm" onClick={removePost}>삭제</button>
        </div>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">댓글 {comments.length}</h3>
        {comments.length === 0 && <p className="muted">첫 댓글을 남겨 보세요.</p>}
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <span className="who">{c.authorNickname}</span><span className="muted"> · {timeAgo(c.createdAt)}</span>
            {c.mine && <button className="btn btn-sm" style={{ float: 'right' }} onClick={() => removeComment(c.id)}>삭제</button>}
            <div>{c.content}</div>
          </div>
        ))}
        <form className="comment-form" onSubmit={addComment}>
          <input className="input" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="댓글을 입력하세요" />
          <button className="btn btn-primary" disabled={!text.trim()}>등록</button>
        </form>
      </div>
    </div>
  );
}
