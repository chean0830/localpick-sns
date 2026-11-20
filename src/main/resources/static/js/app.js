/* 로컬픽 공통 스크립트: API 호출, 헤더, 게시글 카드 렌더링 */
const LP = {
  me: null,

  async api(path, { method = 'GET', body, form } = {}) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (form) {
      opts.body = form;
    } else if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error((data && data.message) || '요청에 실패했습니다.');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async loadMe() {
    try {
      this.me = await this.api('/api/auth/me');
    } catch (e) {
      this.me = null;
    }
    return this.me;
  },

  async requireLogin() {
    const me = await this.loadMe();
    if (!me) {
      location.href = '/login.html?next=' + encodeURIComponent(location.pathname + location.search);
      throw new Error('login required');
    }
    return me;
  },

  async renderHeader() {
    const me = await this.loadMe();
    const el = document.getElementById('header');
    if (!el) return me;
    const q = this.param('q') || '';
    el.className = 'header';
    el.innerHTML = `
      <div class="header-inner">
        <a class="logo" href="/"><img src="/img/logo.svg" alt="">LocalPick</a>
        <form class="search" action="/search.html">
          <input name="q" value="${this.esc(q)}" placeholder="가게·해시태그·동네 검색">
        </form>
        <div class="header-actions">
          ${me ? `
            <a class="btn btn-primary btn-sm" href="/write.html">글쓰기</a>
            ${me.role === 'ADMIN' ? '<a class="btn btn-line btn-sm" href="/admin.html">관리자</a>' : ''}
            <a class="btn btn-line btn-sm" href="/mypage.html">${this.esc(me.nickname)}</a>
            <button class="btn btn-line btn-sm" id="logoutBtn">로그아웃</button>
          ` : `
            <a class="btn btn-line btn-sm" href="/signup.html">회원가입</a>
            <a class="btn btn-navy btn-sm" href="/login.html">로그인</a>
          `}
        </div>
      </div>`;
    const logout = document.getElementById('logoutBtn');
    if (logout) {
      logout.addEventListener('click', async () => {
        await this.api('/api/auth/logout', { method: 'POST' });
        location.href = '/';
      });
    }
    return me;
  },

  param(name) {
    return new URLSearchParams(location.search).get(name);
  },

  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + '일 전';
    return new Date(iso).toLocaleDateString('ko-KR');
  },

  typeLabel(type) {
    return { NORMAL: '일반', PROMO: '홍보', EVENT: '이벤트' }[type] || type;
  },

  toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  },

  postCard(p) {
    const who = p.storeName || p.authorNickname;
    const whoLink = p.storeId ? `/store.html?id=${p.storeId}` : '#';
    return `
      <article class="post" data-id="${p.id}">
        <div class="post-head">
          <div class="avatar">${this.esc(who.charAt(0))}</div>
          <div style="flex:1">
            <a class="name" href="${whoLink}">${this.esc(who)}</a>
            <div class="muted">${this.timeAgo(p.createdAt)} · 조회 ${p.viewCount}</div>
          </div>
          ${p.status === 'BLIND' ? '<span class="badge BLIND">블라인드</span>' : ''}
          <span class="badge ${p.type}">${this.typeLabel(p.type)}</span>
        </div>
        ${p.images.length ? `<a class="post-images" href="/post.html?id=${p.id}">${p.images.map(src => `<img src="${this.esc(src)}" alt="" loading="lazy">`).join('')}</a>` : ''}
        <a class="post-body" href="/post.html?id=${p.id}" style="display:block">${this.esc(p.content)}</a>
        ${p.tags.length ? `<div class="tags">${p.tags.map(t => `<a class="tag" href="/search.html?tag=${encodeURIComponent(t)}">#${this.esc(t)}</a>`).join('')}</div>` : ''}
        <div class="post-foot">
          <button class="like-btn ${p.liked ? 'on' : ''}" data-like="${p.id}">♥ <span>${p.likeCount}</span></button>
          <a href="/post.html?id=${p.id}#comments">댓글 ${p.commentCount}</a>
        </div>
      </article>`;
  },

  /** 좋아요 버튼 이벤트 위임 */
  bindLikes(root) {
    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-like]');
      if (!btn) return;
      e.preventDefault();
      if (!this.me) {
        location.href = '/login.html?next=' + encodeURIComponent(location.pathname + location.search);
        return;
      }
      try {
        const r = await this.api(`/api/posts/${btn.dataset.like}/like`, { method: 'POST' });
        btn.classList.toggle('on', r.liked);
        btn.querySelector('span').textContent = r.likeCount;
      } catch (err) {
        this.toast(err.message);
      }
    });
  },

  eventItem(ev) {
    const btn = ev.downloaded
      ? '<button class="btn btn-sm btn-line" disabled>받음</button>'
      : ev.remaining > 0
        ? `<button class="btn btn-sm btn-primary" data-coupon="${ev.id}">쿠폰 받기</button>`
        : '<button class="btn btn-sm btn-line" disabled>소진</button>';
    return `
      <div class="event-item">
        <div class="title">${this.esc(ev.title)}</div>
        <div class="muted"><a href="/store.html?id=${ev.storeId}">${this.esc(ev.storeName)}</a> · ~${ev.endDate} · 남은 ${ev.remaining}장</div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px">${this.esc(ev.benefit)}</span>${btn}
        </div>
      </div>`;
  },

  /** 쿠폰 받기 버튼 이벤트 위임 */
  bindCoupons(root, onDone) {
    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-coupon]');
      if (!btn) return;
      if (!this.me) {
        location.href = '/login.html?next=' + encodeURIComponent(location.pathname + location.search);
        return;
      }
      try {
        await this.api(`/api/events/${btn.dataset.coupon}/coupons`, { method: 'POST' });
        this.toast('쿠폰을 받았어요! 마이페이지 쿠폰함에서 확인하세요.');
        if (onDone) onDone();
      } catch (err) {
        this.toast(err.message);
      }
    });
  },
};
