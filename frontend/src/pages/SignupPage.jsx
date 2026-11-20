import { useState } from 'react';
import { api } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignupPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', nickname: '', role: 'USER' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pwOk = form.password.length >= 8;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/signup', { method: 'POST', body: form });
      await login(form.email, form.password);
      navigate(form.role === 'OWNER' ? '/mypage?tab=stores' : '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="narrow" style={{ maxWidth: 460 }}>
      <form className="card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>회원가입</h2>
        <div className="form-row">
          <label>회원 유형</label>
          <div className="radio-chips">
            {[['USER', '동네 주민'], ['OWNER', '사장님']].map(([v, l]) => (
              <button type="button" key={v} className={`chip-btn ${form.role === v ? 'on' : ''}`} onClick={() => setForm((f) => ({ ...f, role: v }))}>{l}</button>
            ))}
          </div>
        </div>
        <div className="form-row"><label>이메일</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="form-row">
          <label>비밀번호</label>
          <input className={`input ${form.password && !pwOk ? 'invalid' : ''}`} type="password" value={form.password} onChange={set('password')} required />
          {form.password && !pwOk && <p className="field-error">8자 이상 입력해 주세요.</p>}
        </div>
        <div className="form-row"><label>닉네임</label><input className="input" maxLength={30} value={form.nickname} onChange={set('nickname')} required /></div>
        {error && <p className="field-error">{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={!pwOk || !form.email || !form.nickname}>가입하기</button>
      </form>
    </div>
  );
}
