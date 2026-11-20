import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMe(await api('/api/auth/me'));
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const member = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setMe(member);
    return member;
  };

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' });
    setMe(null);
  };

  return (
    <AuthContext.Provider value={{ me, ready, login, logout, refresh, setMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
