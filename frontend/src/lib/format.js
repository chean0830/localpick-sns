export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

export const TYPE_LABEL = { NORMAL: '일반', PROMO: '홍보', EVENT: '이벤트' };

export function parseTags(text) {
  return [...new Set(text.split(/[\s,]+/).map((t) => t.replace(/^#+/, '')).filter(Boolean))].slice(0, 10);
}
