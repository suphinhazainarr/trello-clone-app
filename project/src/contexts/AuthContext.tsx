import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('trello-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        initials: email.split('@')[0].substring(0, 2).toUpperCase()
      };

      setUser(mockUser);
      localStorage.setItem('trello-user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      };

      setUser(mockUser);
      localStorage.setItem('trello-user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trello-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};