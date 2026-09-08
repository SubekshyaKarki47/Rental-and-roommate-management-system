import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Home,
  Users,
  Building2,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import './AuthModal.css';

type UserIntentType = 'place' | 'roommate' | 'both' | 'landlord';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authModalTab, setAuthModalTab, login, register } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [userIntent, setUserIntent] = useState<UserIntentType>('place');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setStep(1);
    setError(null);
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login({ email, password });
        handleClose();
      } else {
        if (password !== passwordConfirm) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const role = userIntent === 'landlord' ? 'LANDLORD' : 'TENANT';
        await register({
          email,
          password,
          password_confirm: passwordConfirm,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role,
        });
        handleClose();
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please check your credentials.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = async (type: 'tenant' | 'landlord' | 'admin') => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (type === 'tenant') {
        await login({ email: 'anuj.dahal@gmail.com', password: 'Password123!' });
      } else if (type === 'landlord') {
        await login({ email: 'suresh.shrestha@nepalrent.com', password: 'Password123!' });
      } else if (type === 'admin') {
        await login({ email: 'admin@roommatehub.com', password: 'AdminPassword123!' });
      }
      handleClose();
    } catch (err: any) {
      setError('Could not log in with demo account. Ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const intentOptions = [
    {
      id: 'place' as UserIntentType,
      title: 'Find a place',
      description: 'I need a rental property.',
      icon: Home,
      iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'roommate' as UserIntentType,
      title: 'Find a roommate',
      description: 'I want someone to share with.',
      icon: Users,
      iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'both' as UserIntentType,
      title: 'Find a place & roommate',
      description: 'I need both.',
      icon: Building2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'landlord' as UserIntentType,
      title: "I'm a landlord",
      description: 'I want to list properties.',
      icon: Building,
      iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT BRAND PANEL */}
        <div className="auth-brand-panel p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Home className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                RoomMateHub
              </span>
            </div>

            {/* Heading */}
            <div className="mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white leading-[1.25]">
                Find your perfect <br />
                home and the right <br />
                <span className="text-blue-600 dark:text-blue-400">roommate</span>
              </h2>

              <p className="mt-3 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Discover verified rentals, find compatible roommates, and manage your entire rental journey in one place.
              </p>
            </div>

            {/* Handwritten note */}
            <div className="mt-6 mb-2">
              <div className="auth-handwriting">
                Better homes<br />
                Better together
                <span className="auth-handwriting-heart">♡</span>
              </div>
            </div>
          </div>

          {/* Town Illustration */}
          <div className="mt-6 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 overflow-hidden rounded-b-2xl md:rounded-bl-2xl md:rounded-br-none">
            <img
              src="/signup_illustration.jpg"
              alt="Town Illustration"
              className="w-full h-36 sm:h-44 object-cover object-center"
            />
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="auth-form-panel p-6 sm:p-10 flex flex-col justify-between">
          {/* REGISTER FLOW */}
          {authModalTab === 'register' && (
            <div className="w-full">
              {/* STEP 1: INTENT SELECTION */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Step 1 of 2
                    </span>
                    <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      Create your account
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      What are you looking for?
                    </p>
                  </div>

                  {/* 2x2 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {intentOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = userIntent === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setUserIntent(opt.id)}
                          className={`auth-intent-card ${isSelected ? 'selected' : ''}`}
                        >
                          {/* Radio / Checkmark Indicator */}
                          <div
                            className={`auth-check-indicator ${
                              isSelected ? 'selected' : 'unselected'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Icon */}
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${opt.iconBg}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Text */}
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {opt.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Continue Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Bottom Login Link */}
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}

              {/* STEP 2: USER DETAILS */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Step 2 of 2
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                        Your information
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Signing up for:{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {intentOptions.find((o) => o.id === userIntent)?.title}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Aarav"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Shrestha"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+977 98XXXXXXXX"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* LOGIN FLOW */}
          {authModalTab === 'login' && (
            <div className="w-full space-y-4 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Welcome Back
                </span>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                  Log in to your account
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Access your properties, applications & roommate matches.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Demo Logins */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Quick Demo Logins</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('tenant')}
                    disabled={isSubmitting}
                    className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
                  >
                    🧑 Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('landlord')}
                    disabled={isSubmitting}
                    className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
                  >
                    🏢 Landlord
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    disabled={isSubmitting}
                    className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
