// Spring Boot REST API 호출 도우미. 실패하면 서버의 {message}를 담은 Error를 던진다.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, form, signal } = {}) {
  const opts = { method, headers: {}, credentials: 'include', signal };
  if (form) {
    opts.body = form;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message || '요청에 실패했습니다.');
  return data;
}

export const postsApi = {
  feed: (tab, region, page, signal) =>
    api(`/api/posts?${new URLSearchParams({ tab, page, ...(region ? { region } : {}) })}`, { signal }),
  detail: (id) => api(`/api/posts/${id}`),
  create: (body) => api('/api/posts', { method: 'POST', body }),
  update: (id, body) => api(`/api/posts/${id}`, { method: 'PUT', body }),
  remove: (id) => api(`/api/posts/${id}`, { method: 'DELETE' }),
  like: (id) => api(`/api/posts/${id}/like`, { method: 'POST' }),
  comments: (id) => api(`/api/posts/${id}/comments`),
  addComment: (id, content) => api(`/api/posts/${id}/comments`, { method: 'POST', body: { content } }),
  removeComment: (commentId) => api(`/api/comments/${commentId}`, { method: 'DELETE' }),
  popularTags: () => api('/api/tags/popular'),
};

export const storesApi = {
  search: (q = '') => api(`/api/stores?q=${encodeURIComponent(q)}`),
  mine: () => api('/api/stores/mine'),
  following: () => api('/api/stores/following'),
  detail: (id) => api(`/api/stores/${id}`),
  follow: (id) => api(`/api/stores/${id}/follow`, { method: 'POST' }),
  posts: (id) => api(`/api/stores/${id}/posts`),
  events: (id) => api(`/api/stores/${id}/events`),
  stats: (id) => api(`/api/stores/${id}/stats`),
  create: (body) => api('/api/stores', { method: 'POST', body }),
};

export const eventsApi = {
  ongoing: () => api('/api/events'),
  download: (id) => api(`/api/events/${id}/coupons`, { method: 'POST' }),
  myCoupons: () => api('/api/coupons/mine'),
  use: (couponId) => api(`/api/coupons/${couponId}/use`, { method: 'POST' }),
};

export function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  return api('/api/files', { method: 'POST', form });
}
