import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: Record<string, any>) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot-password';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot-password') => void;
  initialIntent: 'place' | 'roommate' | 'both' | 'landlord';
  setInitialIntent: (intent: 'place' | 'roommate' | 'both' | 'landlord') => void;
  openAuthModal: (tab: 'login' | 'register' | 'forgot-password', intent?: 'place' | 'roommate' | 'both' | 'landlord') => void;
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
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [initialIntent, setInitialIntent] = useState<'place' | 'roommate' | 'both' | 'landlord'>(() => {
    return (localStorage.getItem('user_intent') as any) || 'place';
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  const openAuthModal = (
    tab: 'login' | 'register' | 'forgot-password',
    intent?: 'place' | 'roommate' | 'both' | 'landlord'
  ) => {
    if (intent) {
      setInitialIntent(intent);
      localStorage.setItem('user_intent', intent);
    }
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const syncAuthData = (data: AuthResponse): User => {
    const savedIntent = localStorage.getItem('user_intent') || initialIntent;
    const userWithIntent: User = {
      ...data.user,
      intent: (savedIntent as any) || data.user.intent,
    };
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('current_user', JSON.stringify(userWithIntent));
    setUser(userWithIntent);
    return userWithIntent;
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
      const savedIntent = localStorage.getItem('user_intent') || initialIntent;
      const userWithIntent = {
        ...userData,
        intent: (savedIntent as any) || userData.intent,
      };
      setUser(userWithIntent);
      localStorage.setItem('current_user', JSON.stringify(userWithIntent));
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

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const data = await authService.login(credentials);
    const userWithIntent = syncAuthData(data);
    setShowAuthModal(false);
    return userWithIntent;
  };

  const register = async (formData: Record<string, any>): Promise<User> => {
    const data = await authService.register(formData);
    const userWithIntent = syncAuthData(data);
    setShowAuthModal(false);
    return userWithIntent;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_intent');
    setUser(null);
    window.dispatchEvent(new Event('auth:logout'));
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
        initialIntent,
        setInitialIntent,
        openAuthModal,
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
