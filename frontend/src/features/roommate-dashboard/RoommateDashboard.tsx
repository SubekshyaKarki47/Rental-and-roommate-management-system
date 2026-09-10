import React, { useState } from 'react';
import {
  Users,
  Search,
  Heart,
  UserCheck,
  Sliders,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Building,
  Home,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RoommateDiscoveryView } from '../roommates/RoommateDiscoveryView';
import { MessagesInboxSubview } from '../dashboard/subviews/MessagesInboxSubview';
import './RoommateDashboard.css';

interface RoommateDashboardProps {
  onSwitchDashboard: (dashboardKey: 'tenant' | 'roommate' | 'shared-living' | 'landlord') => void;
  onNavigateHome?: () => void;
  onOpenChatWithUser?: (recipientId?: number) => void;
}

export const RoommateDashboard: React.FC<RoommateDashboardProps> = ({
  onSwitchDashboard,
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeNav, setActiveNav] = useState<'discovery' | 'saved' | 'requests' | 'messages' | 'preferences' | 'settings'>('discovery');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switcherDropdownOpen, setSwitcherDropdownOpen] = useState(false);
  const [selectedChatRecipientId, setSelectedChatRecipientId] = useState<number | undefined>(undefined);

  // Saved Roommates State
  const [savedCandidates, setSavedCandidates] = useState<number[]>([101, 102]);

  // Incoming Match Requests State
  const [incomingRequests, setIncomingRequests] = useState([
    {
      id: 201,
      name: 'Nisha Gurung',
      age: 22,
      occupation: 'Graphic Designer',
      location: 'Jhamsikhel, Lalitpur',
      budget: 'Rs. 15,000 - 25,000',
      matchScore: 94,
      image: '/landing/nisha.jpg',
      tags: ['Non-Smoker', 'Quiet Nights', 'Creative'],
      message: 'Namaste! I saw your roommate profile and notice we have identical quiet hours and locations. Would love to connect!',
    },
    {
      id: 202,
      name: 'Anish Thapa',
      age: 24,
      occupation: 'Civil Engineer',
      location: 'Baneshwor, Kathmandu',
      budget: 'Rs. 12,000 - 20,000',
      matchScore: 89,
      image: '/landing/anish.jpg',
      tags: ['Early Riser', 'Clean Freak', 'Vegetarian'],
      message: 'Hi! Looking for someone to share a clean 2BHK flat near Baneshwor. Let me know if you are open to chat.',
    },
  ]);

  // Quiz / Preferences State
  const [lifestyleQuiz, setLifestyleQuiz] = useState({
    sleepSchedule: 'EARLY_BIRD',
    cleanliness: 'VERY_CLEAN',
    smoking: false,
    pets: false,
    diet: 'VEGETARIAN',
    socialHabits: 'MODERATE',
    guestPolicy: 'WEEKENDS_ONLY',
  });
  const [quizSaved, setQuizSaved] = useState(false);

  const userDisplayName =
    user?.full_name?.trim() ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'User';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleStartChatFromDiscovery = (recipientId: number) => {
    setSelectedChatRecipientId(recipientId);
    setActiveNav('messages');
  };

  const handleAcceptRequest = (requestId: number) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    setActiveNav('messages');
  };

  const handleDeclineRequest = (requestId: number) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSaved(true);
    setTimeout(() => setQuizSaved(false), 3000);
  };

  return (
    <div className="roommate-dash-container">
      {/* 1. SIDEBAR (Purple/Indigo Brand) */}
      <aside className="roommate-dash-sidebar">
        <div>
          {/* Brand Header */}
          <div className="roommate-dash-brand">
            <div className="roommate-dash-brand-icon">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="roommate-dash-brand-title">RoomMateHub</span>
              <span className="roommate-dash-brand-sub">Find Your Roommate</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="roommate-dash-nav">
            <button
              onClick={() => setActiveNav('discovery')}
              className={`roommate-dash-nav-item ${activeNav === 'discovery' ? 'active' : ''}`}
            >
              <div className="roommate-dash-nav-left">
                <Search className="w-4 h-4" />
                <span>Find Roommates</span>
              </div>
              <span className="roommate-dash-badge">New</span>
            </button>

            <button
              onClick={() => setActiveNav('saved')}
              className={`roommate-dash-nav-item ${activeNav === 'saved' ? 'active' : ''}`}
            >
              <div className="roommate-dash-nav-left">
                <Heart className="w-4 h-4" />
                <span>Saved Matches</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{savedCandidates.length}</span>
            </button>

            <button
              onClick={() => setActiveNav('requests')}
              className={`roommate-dash-nav-item ${activeNav === 'requests' ? 'active' : ''}`}
            >
              <div className="roommate-dash-nav-left">
                <UserCheck className="w-4 h-4" />
                <span>Match Requests</span>
              </div>
              {incomingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNav('messages')}
              className={`roommate-dash-nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            >
              <div className="roommate-dash-nav-left">
                <MessageSquare className="w-4 h-4" />
                <span>Roommate Chats</span>
              </div>
              <span className="roommate-dash-badge">3</span>
            </button>

            <button
              onClick={() => setActiveNav('preferences')}
              className={`roommate-dash-nav-item ${activeNav === 'preferences' ? 'active' : ''}`}
            >
              <div className="roommate-dash-nav-left">
                <Sliders className="w-4 h-4" />
                <span>Lifestyle Quiz</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Settings & Switcher */}
        <div>
          <button
            onClick={() => setActiveNav('settings')}
            className={`roommate-dash-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
          >
            <div className="roommate-dash-nav-left">
              <Settings className="w-4 h-4" />
              <span>Preferences & Settings</span>
            </div>
          </button>

          <button
            onClick={() => logout()}
            className="roommate-dash-nav-item !text-rose-400 hover:!text-rose-300 hover:!bg-rose-950/40 mt-1"
          >
            <div className="roommate-dash-nav-left">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </div>
          </button>

        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="roommate-dash-main">
        {/* Top Header */}
        <header className="roommate-dash-header">
          {/* Dashboard Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Roommate Dashboard
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">Kathmandu Valley</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Profile Chip */}
            <div className="relative">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="roommate-profile-chip"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(userDisplayName)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="roommate-profile-name">{userDisplayName}</span>
                  <span className="roommate-profile-role">Roommate Seeker</span>
                </div>
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{userDisplayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('preferences');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-500" />
                    <span>Compatibility Habits</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateHome?.();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-blue-500" />
                    <span>Back to Website Home</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE DASHBOARD BODY */}
        <div className="roommate-dash-body">
          {/* Subview 1: Roommate Discovery Engine */}
          {activeNav === 'discovery' && (
            <div className="animate-fadeIn">
              <RoommateDiscoveryView onStartChat={handleStartChatFromDiscovery} />
            </div>
          )}

          {/* Subview 2: Saved Matches */}
          {activeNav === 'saved' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  <span>Saved & Shortlisted Roommates</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Profiles you bookmarked for further discussion and shared lease coordination
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 101,
                    name: 'Aarav Sharma',
                    age: 23,
                    occupation: 'Software Engineer',
                    location: 'New Baneshwor, Kathmandu',
                    budget: 'Rs. 15,000 - 25,000',
                    matchScore: 92,
                    image: '/landing/aarav.jpg',
                    tags: ['Tech', 'Night Owl', 'Clean'],
                    synergyNote: '92% compatible with your sleep schedule and budget preferences.',
                  },
                  {
                    id: 102,
                    name: 'Priya Shrestha',
                    age: 22,
                    occupation: 'Business Analyst',
                    location: 'Sanepa, Lalitpur',
                    budget: 'Rs. 12,000 - 20,000',
                    matchScore: 87,
                    image: '/landing/priya.jpg',
                    tags: ['Non-Smoker', 'Early Bird', 'Quiet'],
                    synergyNote: 'Shares your preferred location and quiet evening lifestyle.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}, {item.age}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.occupation}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {item.location}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          {item.matchScore}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-[10px] font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        💡 {item.synergyNote}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleStartChatFromDiscovery(item.id)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Now</span>
                      </button>
                      <button
                        onClick={() => setSavedCandidates((prev) => prev.filter((id) => id !== item.id))}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Remove from saved"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subview 3: Match Requests */}
          {activeNav === 'requests' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <span>Incoming Match Requests ({incomingRequests.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Prospective roommates who matched with your habits and requested to connect
                </p>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No pending requests</h4>
                  <p className="text-xs text-slate-400 mt-1">Check back soon or browse active candidates in Discovery!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <img
                          src={req.image}
                          alt={req.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.name}, {req.age}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] font-bold">
                              {req.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{req.occupation} • {req.location}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl mt-2 italic border border-slate-100 dark:border-slate-800">
                            "{req.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Accept & Chat
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subview 4: Roommate Chats */}
          {activeNav === 'messages' && (
            <div className="h-[calc(100vh-9rem)] animate-fadeIn">
              <MessagesInboxSubview initialRecipientId={selectedChatRecipientId} />
            </div>
          )}

          {/* Subview 5: Lifestyle Quiz & Habits */}
          {activeNav === 'preferences' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  <span>Roommate Compatibility Quiz & Lifestyle Habits</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Our matching engine pairs you with candidates based on your day-to-day living preferences
                </p>
              </div>

              {quizSaved && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your lifestyle habits and compatibility preferences have been saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveQuiz} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sleep Schedule
                    </label>
                    <select
                      value={lifestyleQuiz.sleepSchedule}
                      onChange={(e) => setLifestyleQuiz({ ...lifestyleQuiz, sleepSchedule: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="EARLY_BIRD">🌅 Early Bird (Sleep before 10 PM)</option>
                      <option value="NIGHT_OWL">🌙 Night Owl (Sleep after 12 AM)</option>
                      <option value="FLEXIBLE">⚖️ Flexible / Balanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cleanliness Standards
                    </label>
                    <select
                      value={lifestyleQuiz.cleanliness}
                      onChange={(e) => setLifestyleQuiz({ ...lifestyleQuiz, cleanliness: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="VERY_CLEAN">✨ Very Clean (Dishes washed immediately)</option>
                      <option value="MODERATE">🧹 Moderately Clean (Tidy common areas)</option>
                      <option value="RELAXED">🛋️ Relaxed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Dietary Lifestyle
                    </label>
                    <select
                      value={lifestyleQuiz.diet}
                      onChange={(e) => setLifestyleQuiz({ ...lifestyleQuiz, diet: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="VEGETARIAN">🥗 Vegetarian / Vegan</option>
                      <option value="NON_VEG">🍗 Non-Vegetarian Friendly</option>
                      <option value="ANY">🍽️ Any / Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Guest & Overnight Policy
                    </label>
                    <select
                      value={lifestyleQuiz.guestPolicy}
                      onChange={(e) => setLifestyleQuiz({ ...lifestyleQuiz, guestPolicy: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="WEEKENDS_ONLY">☕ Weekends Only with advance notice</option>
                      <option value="OCCASIONAL">🚪 Occasional friends permitted</option>
                      <option value="STRICT_NO">🚫 Strictly no outside overnight guests</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Scores re-calculate instantly upon updating</span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Save & Update Compatibility Matches
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subview 6: Settings */}
          {activeNav === 'settings' && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Roommate Seeker Account Settings</h3>
              <p className="text-xs text-slate-400">Manage notifications, public profile visibility, and contact privacy.</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Make Profile Publicly Searchable</span>
                    <span className="text-[10px] text-slate-400">Allow compatible roommates to find and message you</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Instant Match Alerts</span>
                    <span className="text-[10px] text-slate-400">Receive email alerts when a 90%+ match signs up</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal Switcher Modal (Triggered by Sidebar Switch Dashboard card) */}
      {switcherDropdownOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSwitcherDropdownOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Switch Dashboard
              </p>
              <button
                onClick={() => setSwitcherDropdownOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onSwitchDashboard('tenant');
                  setSwitcherDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Tenant Dashboard</span>
                  <span className="text-[10px] text-slate-400">Rentals, rent ledger & leases</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchDashboard('roommate');
                  setSwitcherDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block">Roommate Dashboard</span>
                  <span className="text-[10px] text-purple-500 font-semibold">Active Mode</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchDashboard('shared-living');
                  setSwitcherDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Shared Living Dashboard</span>
                  <span className="text-[10px] text-slate-400">Place & Roommate co-living</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchDashboard('landlord');
                  setSwitcherDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Landlord Dashboard</span>
                  <span className="text-[10px] text-slate-400">Listings, approvals & rent</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
