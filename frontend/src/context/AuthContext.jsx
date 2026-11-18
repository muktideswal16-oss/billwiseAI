import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token or session exists
    const stored = localStorage.getItem('billwise_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('billwise_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    localStorage.setItem('billwise_user', JSON.stringify(res.user));
    localStorage.setItem('billwise_token', res.access_token);
    return res.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    setUser(res.user);
    localStorage.setItem('billwise_user', JSON.stringify(res.user));
    localStorage.setItem('billwise_token', res.access_token);
    return res.user;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setUser(res.user);
    localStorage.setItem('billwise_user', JSON.stringify(res.user));
    localStorage.setItem('billwise_token', res.access_token);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('billwise_user');
    localStorage.removeItem('billwise_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

