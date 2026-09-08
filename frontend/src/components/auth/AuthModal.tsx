import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import {
  X,
  Home,
  Users,
  Building2,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  KeyRound,
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

  // Forgot Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setStep(1);
    setError(null);
    setResetSuccess(false);
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  const handleTabChange = (tab: 'login' | 'register' | 'forgot-password') => {
    setAuthModalTab(tab);
    setStep(1);
    setError(null);
    setResetSuccess(false);
    setNewPassword('');
    setNewPasswordConfirm('');
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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(false);

    if (!email) {
      setError('Please enter your account email address.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({
        email,
        new_password: newPassword,
        confirm_password: newPasswordConfirm,
      });
      setResetSuccess(true);
      setPassword(newPassword);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please verify your email.';
      setError(errMsg);
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTabChange('forgot-password')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
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

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* FORGOT / RESET PASSWORD FLOW */}
          {authModalTab === 'forgot-password' && (
            <div className="w-full space-y-4 animate-fadeIn">
              <div>
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Account Recovery
                </span>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                  Reset your password
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter your email and set a new password anytime.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Password updated successfully!</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your password has been changed. You can now sign in with your new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition text-center shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Registered Email Address
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
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                >
                  Sign in
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
