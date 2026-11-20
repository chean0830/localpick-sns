import { useCallback, useEffect, useRef, useState } from 'react';
import { postsApi } from '../lib/api.js';

/**
 * 무한 스크롤 피드.
 * - page가 바뀔 때마다 다음 페이지를 불러와 이어 붙인다.
 * - 목록 끝의 sentinel 요소가 화면에 들어오면(IntersectionObserver) page + 1.
 * - 탭이 바뀌면 컴포넌트를 key로 다시 마운트해 상태를 초기화한다(FeedPage 참고).
 */
export function useInfiniteFeed(tab, region) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController(); // 탭 전환·언마운트 시 늦게 온 응답 무시
    setLoading(true);
    postsApi
      .feed(tab, region, page, ctrl.signal)
      .then((data) => {
        setItems((prev) => (page === 0 ? data.items : [...prev, ...data.items]));
        setHasNext(data.hasNext);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e.message);
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [tab, region, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNext || loading) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPage((p) => p + 1),
      { rootMargin: '300px' }, // 끝에 닿기 300px 전에 미리 요청
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, loading]);

  // 좋아요 등 카드 하나만 바뀔 때 목록 전체를 다시 받지 않고 해당 항목만 갱신
  const updateItem = useCallback(
    (id, patch) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [],
  );

  return { items, loading, hasNext, error, sentinelRef, updateItem };
}
