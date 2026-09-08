import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  const syncAuthData = (data: AuthResponse) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    setUser(data.user);

    // If user is tenant and has not completed onboarding, trigger onboarding modal
    if (data.user.role === 'TENANT' && !data.user.has_completed_onboarding) {
      setShowOnboardingModal(true);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));

      if (userData.role === 'TENANT' && !userData.tenant_profile?.is_onboarding_completed) {
        setShowOnboardingModal(true);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('current_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await authService.login(credentials);
    syncAuthData(data);
    setShowAuthModal(false);
  };

  const register = async (formData: Record<string, any>) => {
    const data = await authService.register(formData);
    syncAuthData(data);
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        setAuthModalTab,
        showOnboardingModal,
        setShowOnboardingModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
