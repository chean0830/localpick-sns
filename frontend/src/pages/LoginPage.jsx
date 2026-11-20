import { useState } from 'react';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="narrow" style={{ maxWidth: 420 }}>
      <form className="card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>로그인</h2>
        <div className="form-row"><label>이메일</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-row"><label>비밀번호</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p className="field-error">{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }}>로그인</button>
        <p className="muted" style={{ textAlign: 'center' }}>아직 회원이 아니신가요? <a href="#/signup" style={{ color: 'var(--coral)' }}>회원가입</a></p>
        <p className="muted" style={{ fontSize: 12 }}>시연 계정 · user@localpick.kr / user1234 · owner@localpick.kr / owner1234</p>
      </form>
    </div>
  );
}
