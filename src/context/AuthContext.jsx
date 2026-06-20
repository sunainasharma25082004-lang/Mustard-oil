import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await authApi.getMe();
    setUser(res.data.user);
    return res.data.user;
  };

  useEffect(() => {
    const token = localStorage.getItem('karyor_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('karyor_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('karyor_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    localStorage.setItem('karyor_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const loginWithGoogle = async (credential) => {
    const res = await authApi.googleLogin(credential);
    localStorage.setItem('karyor_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const updateProfile = async (payload) => {
    const res = await authApi.updateProfile(payload);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('karyor_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, updateProfile, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}