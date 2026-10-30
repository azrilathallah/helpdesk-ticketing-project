import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    storage.setAuth(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    storage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}