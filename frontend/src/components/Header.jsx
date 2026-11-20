import { useState } from 'react';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { me, logout } = useAuth();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="#/"><img src="/logo.svg" alt="" />LocalPick</a>
        <form className="search" onSubmit={onSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="가게·해시태그·동네 검색" />
        </form>
        <div className="header-actions">
          {me ? (
            <>
              <a className="btn btn-primary btn-sm" href="#/write">글쓰기</a>
              <a className="btn btn-line btn-sm" href="#/mypage">{me.nickname}</a>
              <button className="btn btn-line btn-sm" onClick={async () => { await logout(); navigate('/'); }}>로그아웃</button>
            </>
          ) : (
            <>
              <a className="btn btn-line btn-sm" href="#/signup">회원가입</a>
              <a className="btn btn-navy btn-sm" href="#/login">로그인</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
