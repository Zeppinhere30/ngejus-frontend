import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ngejus_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ngejus_token');
    if (savedToken) {
      api
        .get('/me')
        .then((r) => {
          setUser(r.data);
        })
        .catch(() => {
          localStorage.removeItem('ngejus_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/login', { email, password });
    const t = r.data.token;
    localStorage.setItem('ngejus_token', t);
    setToken(t);
    setUser(r.data.user);
    return r.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {}
    localStorage.removeItem('ngejus_token');
    setToken(null);
    setUser(null);
  };

  if (loading) return null;

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
