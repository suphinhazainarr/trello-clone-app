import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { InternalAxiosRequestConfig } from 'axios';
import env from '../env.js';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with base URL
const api = axios.create({
  baseURL: env.API_URL
});

// Add token to requests if it exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('trello-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('trello-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Fetch user profile
      api.get('/auth/profile')
        .then((response: { data: User }) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('trello-token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('trello-token', token);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('trello-token', token);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trello-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};