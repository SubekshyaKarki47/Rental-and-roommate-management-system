import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/api';
import {
  Home,
  Search,
  LogOut,
  Shield,
  Layers,
  Menu,
  X,
  CreditCard,
  Receipt,
  Wrench,
  ClipboardList,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenChat?: () => void;
  onOpenAI?: () => void;
  onOpenApplications?: () => void;
  onOpenAgreements?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'home',
  onTabChange,
  onOpenApplications,
  onOpenAgreements,
}) => {
  const { user, isAuthenticated, logout, setShowAuthModal, setAuthModalTab, refreshUser, setShowOnboardingModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const handleRoleSwitch = async () => {
    if (!user) return;
    const targetRole = user.role === 'TENANT' ? 'LANDLORD' : 'TENANT';
    setIsSwitchingRole(true);
    try {
      await authService.switchRole(targetRole);
      await refreshUser();
      setDropdownOpen(false);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const openAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'home') {
      onTabChange?.('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'dashboard') {
      if (isAuthenticated) {
        onTabChange?.('dashboard');
      } else {
        openAuth('login');
      }
    } else if (sectionId === 'properties') {
      if (isAuthenticated) {
        onTabChange?.('properties');
      } else {
        openAuth('login');
      }
    } else if (sectionId === 'roommates') {
      if (isAuthenticated) {
        onTabChange?.('roommates');
      } else {
        openAuth('register');
      }
    } else if (sectionId === 'how-it-works' || sectionId === 'pricing' || sectionId === 'faq' || sectionId === 'contact') {
      if (activeTab !== 'home') {
        onTabChange?.('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Home className="w-4 h-4 fill-white" />
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white">
            RoomMateHub
          </span>
        </button>

        {/* Center Navigation Links: Home, Properties, Roommates, How It Works, Pricing, FAQ, Contact */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7">
          <button
            onClick={() => handleNavClick('home')}
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`nav-link font-semibold text-blue-600 dark:text-blue-400 ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => handleNavClick('properties')}
            className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
          >
            Properties
          </button>

          <button
            onClick={() => handleNavClick('roommates')}
            className={`nav-link ${activeTab === 'roommates' ? 'active' : ''}`}
          >
            Roommates
          </button>

          <button
            onClick={() => handleNavClick('how-it-works')}
            className="nav-link"
          >
            How It Works
          </button>

          <button
            onClick={() => handleNavClick('pricing')}
            className="nav-link"
          >
            Pricing
          </button>

          <button
            onClick={() => handleNavClick('faq')}
            className="nav-link"
          >
            FAQ
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className="nav-link"
          >
            Contact
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Icon Button */}
          <button
            onClick={() => handleNavClick('properties')}
            className="nav-search-btn"
            title="Search properties"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="nav-theme-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {/* Login Outlined Pill Button */}
              <button
                onClick={() => openAuth('login')}
                className="nav-login-btn"
              >
                Login
              </button>

              {/* Sign Up Solid Pill Button */}
              <button
                onClick={() => openAuth('register')}
                className="nav-signup-btn"
              >
                Sign Up
              </button>
            </div>
          ) : (
            /* Logged In User Avatar Dropdown */
            user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.full_name || user.email}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                        Active: {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onTabChange?.('dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold"
                      >
                        <Home className="w-4 h-4 text-blue-600" />
                        <span>Tenant Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange?.('rentals');
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        Rent Ledger & Leases
                      </button>

                      <button
                        onClick={() => {
                          onTabChange?.('expenses');
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4 text-cyan-500" />
                        Expense Splitting
                      </button>

                      <button
                        onClick={() => {
                          onTabChange?.('maintenance');
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Wrench className="w-4 h-4 text-purple-500" />
                        Maintenance Dashboard
                      </button>

                      <button
                        onClick={() => {
                          onOpenApplications?.();
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4 text-indigo-500" />
                        Applications Manager
                      </button>

                      <button
                        onClick={() => {
                          onOpenAgreements?.();
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Legal Lease Agreement
                      </button>

                      {user.role === 'TENANT' && (
                        <button
                          onClick={() => {
                            setShowOnboardingModal(true);
                            setDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Layers className="w-4 h-4 text-blue-500" />
                          Update Matching Preferences
                        </button>
                      )}

                      <button
                        onClick={handleRoleSwitch}
                        disabled={isSwitchingRole}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-500" />
                          Switch to {user.role === 'TENANT' ? 'Landlord' : 'Tenant'} Mode
                        </span>
                        {isSwitchingRole && <span className="text-[10px] text-blue-500 animate-spin">⟳</span>}
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => {
              handleNavClick('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Home
          </button>
          <button
            onClick={() => {
              handleNavClick('properties');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Properties
          </button>
          <button
            onClick={() => {
              handleNavClick('roommates');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Roommates
          </button>
          <button
            onClick={() => {
              handleNavClick('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              handleNavClick('pricing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Pricing
          </button>
          <button
            onClick={() => {
              handleNavClick('faq');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            FAQ
          </button>
          <button
            onClick={() => {
              handleNavClick('contact');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Contact
          </button>

          {/* Mobile Theme Toggle */}
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
