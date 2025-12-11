import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, getMe, login as apiLogin, logout as apiLogout, register as apiRegister, LoginData, RegisterData } from '../services/dashboardApi';

interface AuthContextType {
  company: Company | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getMe();
      setCompany(data);
    } catch (error) {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await apiLogin(data);
    setCompany(response.company);
  };

  const register = async (data: RegisterData) => {
    const response = await apiRegister(data);
    setCompany(response.company);
  };

  const logout = async () => {
    await apiLogout();
    setCompany(null);
  };

  const refreshCompany = async () => {
    const data = await getMe();
    setCompany(data);
  };

  return (
    <AuthContext.Provider
      value={{
        company,
        loading,
        isAuthenticated: !!company,
        login,
        register,
        logout,
        refreshCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

