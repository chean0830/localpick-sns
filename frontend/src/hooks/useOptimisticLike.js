import { useRef } from 'react';
import { postsApi } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * 낙관적 업데이트 좋아요.
 * 1) 서버 응답을 기다리지 않고 화면을 먼저 바꾸고
 * 2) API 결과로 확정, 실패하면 이전 상태로 되돌린다.
 */
export function useOptimisticLike(post, onChange) {
  const { me } = useAuth();
  const toast = useToast();
  const pending = useRef(false);

  return async () => {
    if (!me) {
      navigate('/login');
      return;
    }
    if (pending.current) return; // 연타 방지
    pending.current = true;
    const prev = { liked: post.liked, likeCount: post.likeCount };
    onChange({ liked: !prev.liked, likeCount: prev.likeCount + (prev.liked ? -1 : 1) });
    try {
      const res = await postsApi.like(post.id);
      onChange({ liked: res.liked, likeCount: res.likeCount });
    } catch (e) {
      onChange(prev);
      toast(e.message);
    } finally {
      pending.current = false;
    }
  };
}
