import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  User,
  Users,
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  SlidersHorizontal,
  X,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  roommateService,
  type RoommateCandidate,
} from '../../services/roommateService';
import { useAuth } from '../../context/AuthContext';
import './RoommateDashboard.css';

interface RoommateDiscoveryViewProps {
  onStartChat?: (userId: number) => void;
}

interface DisplayRoommate {
  id: number;
  name: string;
  age: number;
  role: string;
  location: string;
  min_budget: number;
  max_budget: number;
  move_in: string;
  matchScore: number;
  image: string;
  tags: string[];
  bio: string;
  synergyNote: string;
  isConnected?: boolean;
  isPending?: boolean;
}

export const RoommateDiscoveryView: React.FC<RoommateDiscoveryViewProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<RoommateCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedBudget, setSelectedBudget] = useState<string>('ALL');
  const [selectedMoveIn, setSelectedMoveIn] = useState<string>('ALL');
  const [selectedLifestyle, setSelectedLifestyle] = useState<string>('ALL');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Filter dropdown toggles
  const [openDropdown, setOpenDropdown] = useState<'LOCATION' | 'BUDGET' | 'MOVEIN' | 'LIFESTYLE' | null>(null);

  // Saved / Passed / Connected state
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([2])); // Priya saved by default
  const [passedIds, setPassedIds] = useState<Set<number>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<number>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  // Modals
  const [selectedProfile, setSelectedProfile] = useState<DisplayRoommate | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ALL_RECOMMENDED' | 'ALL_MATCHES' | 'SAVED'>('DASHBOARD');

  // Load live candidates and connections
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [disc, connData] = await Promise.all([
        roommateService.discoverRoommates(),
        roommateService.getConnections().catch(() => ({ connections: [], pending_received: [], pending_sent: [] })),
      ]);

      setCandidates(disc);

      // Track connected IDs
      const connSet = new Set<number>();
      if (connData?.connections) {
        for (const conn of connData.connections) {
          const other = conn.requester?.id === user?.id ? conn.target_user : conn.requester;
          if (other?.id) connSet.add(other.id);
        }
      }
      setConnectedIds(connSet);

      const pendSet = new Set<number>();
      if (connData?.pending_sent) {
        for (const req of connData.pending_sent) {
          if (req.target_user?.id) pendSet.add(req.target_user.id);
        }
      }
      setPendingIds(pendSet);
    } catch (err) {
      console.warn('Could not load live roommate candidates', err);
    } finally {
      setLoading(false);
    }
  };

  // Curated showcase pool matching the UI mockup
  const baseRecommended: DisplayRoommate[] = useMemo(() => [
    {
      id: 101,
      name: 'Aarav Sharma',
      age: 22,
      role: 'Student',
      location: 'Kathmandu',
      min_budget: 10000,
      max_budget: 15000,
      move_in: 'Oct 2026',
      matchScore: 92,
      image: '/landing/aarav.jpg',
      tags: ['Clean', 'Non-smoker', 'Early sleeper'],
      bio: 'BSc CSIT student at Tribhuvan University. Quiet on weekdays, enjoys coding and morning coffee.',
      synergyNote: 'You both enjoy outdoor activities and are students.',
    },
    {
      id: 102,
      name: 'Priya Shrestha',
      age: 21,
      role: 'Student',
      location: 'Lalitpur',
      min_budget: 12000,
      max_budget: 16000,
      move_in: 'Sep 2026',
      matchScore: 87,
      image: '/landing/priya.jpg',
      tags: ['Friendly', 'Clean', 'Non-smoker'],
      bio: 'Architecture student at Pulchowk Campus. Passionate about plant decor, minimal spaces and cooking.',
      synergyNote: 'You both prefer a quiet, clean living environment.',
    },
    {
      id: 103,
      name: 'Nisha Gurung',
      age: 23,
      role: 'Student',
      location: 'Kathmandu',
      min_budget: 10000,
      max_budget: 14000,
      move_in: 'Oct 2026',
      matchScore: 84,
      image: '/landing/nisha.jpg',
      tags: ['Clean', 'Social', 'Flexible'],
      bio: 'Media and communications major. Loves indie music, listening with headphones, and weekend brunches.',
      synergyNote: 'Both value respectful private space and neat shared kitchens.',
    },
    {
      id: 104,
      name: 'Anish Thapa',
      age: 24,
      role: 'Working',
      location: 'Bhaktapur',
      min_budget: 12000,
      max_budget: 18000,
      move_in: 'Nov 2026',
      matchScore: 81,
      image: '/landing/anish.jpg',
      tags: ['Clean', 'Non-smoker', 'Active'],
      bio: 'Junior software engineer in IT park. Organized, calm and respectful of study & work schedules.',
      synergyNote: 'Aligned sleep schedule and shared preference for furnished apartments.',
    },
  ], []);

  // Merge live candidates from database
  const allDisplayCandidates: DisplayRoommate[] = useMemo(() => {
    const list = [...baseRecommended];

    if (candidates && candidates.length > 0) {
      for (const c of candidates) {
        // Exclude current user
        if (c.id === user?.id || c.email.toLowerCase() === (user?.email || '').toLowerCase()) continue;

        // Skip if already in base
        if (list.some((r) => r.name.toLowerCase() === c.full_name.toLowerCase())) continue;

        const tp = c.tenant_profile;
        const tags: string[] = [];
        if (tp?.cleanliness_level) tags.push(tp.cleanliness_level === 'VERY_CLEAN' ? 'Clean' : 'Tidy');
        if (tp?.smoking_preference === false) tags.push('Non-smoker');
        if (tp?.sleep_schedule) tags.push(tp.sleep_schedule === 'EARLY_BIRD' ? 'Early sleeper' : 'Night owl');
        if (tags.length === 0) tags.push('Friendly', 'Respectful');

        list.push({
          id: c.id,
          name: c.full_name,
          age: tp?.age_range ? parseInt(tp.age_range, 10) || 22 : 22,
          role: tp?.occupation_status || 'Tenant',
          location: tp?.preferred_locations?.[0] || 'Kathmandu',
          min_budget: tp?.min_budget ? Number(tp.min_budget) : 12000,
          max_budget: tp?.max_budget ? Number(tp.max_budget) : 18000,
          move_in: tp?.preferred_move_in_date || 'Oct 2026',
          matchScore: c.compatibility?.score || 85,
          image: c.avatar || '/landing/aarav.jpg',
          tags: tags.slice(0, 3),
          bio: tp?.bio || c.bio || 'Looking for respectful, clean roommates to share a cozy apartment in Kathmandu valley.',
          synergyNote: c.compatibility?.summary || 'High mutual compatibility based on lifestyle and budget.',
          isConnected: c.connection_status === 'CONNECTED' || connectedIds.has(c.id),
          isPending: c.connection_status === 'SENT_PENDING' || pendingIds.has(c.id),
        });
      }
    }

    return list;
  }, [baseRecommended, candidates, user?.id, user?.email, connectedIds, pendingIds]);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return allDisplayCandidates.filter((r) => {
      if (passedIds.has(r.id)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Location filter
      if (selectedLocation !== 'ALL' && !r.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Budget filter
      if (selectedBudget === '<12K' && r.min_budget > 12000) return false;
      if (selectedBudget === '12K-15K' && (r.max_budget < 12000 || r.min_budget > 15000)) return false;
      if (selectedBudget === '>15K' && r.max_budget < 15000) return false;

      // Lifestyle filter
      if (selectedLifestyle !== 'ALL' && !r.tags.some((t) => t.toLowerCase().includes(selectedLifestyle.toLowerCase()))) {
        return false;
      }

      return true;
    });
  }, [allDisplayCandidates, passedIds, searchQuery, selectedLocation, selectedBudget, selectedLifestyle]);

  // Matches list (Mutual matches)
  const mutualMatches = useMemo(() => {
    return allDisplayCandidates.filter((r) => r.id === 102 || r.id === 101 || connectedIds.has(r.id));
  }, [allDisplayCandidates, connectedIds]);

  const handleConnect = async (id: number) => {
    setPendingIds((prev) => new Set([...prev, id]));
    try {
      if (id < 100) {
        await roommateService.sendRequest(id);
      }
    } catch (e) {
      console.warn('Connect request simulated', e);
    }
  };

  const handlePass = (id: number) => {
    setPassedIds((prev) => new Set([...prev, id]));
  };

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userDisplayName =
    user?.full_name?.trim() ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'User';

  const userName = user?.first_name?.trim() || userDisplayName.split(' ')[0] || 'User';

  return (
    <div className="roommate-dashboard-container animate-fadeIn pb-16 pt-2 sm:pt-4">
      {/* Main 2-Column Responsive Dashboard Layout */}
      <div className="roommate-dashboard-layout">
        {/* Left / Center Column (Main Content) */}
        <div className="space-y-6">
          {/* 1. Hero Welcome Banner (Matching Mockup with House Illustration) */}
          <div className="roommate-hero-card">
            <div className="relative z-10 max-w-md">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {greetingTime}, {userName}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Find your perfect roommate and make your next chapter even better.
              </p>
            </div>

            {/* Illustration on Right */}
            <div className="absolute -right-4 -bottom-6 w-56 sm:w-72 h-36 sm:h-44 pointer-events-none opacity-90 sm:opacity-100">
              <img
                src="/landing/hero_house.svg"
                alt="House illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 2. Search & Filter Bar (Matching Mockup with Pills) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-wrap items-center gap-2 relative">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by location, name, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            {/* Location Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'LOCATION' ? null : 'LOCATION')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedLocation !== 'ALL'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{selectedLocation === 'ALL' ? 'Location' : selectedLocation}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openDropdown === 'LOCATION' && (
                <div className="absolute top-full mt-1.5 left-0 z-40 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs space-y-0.5">
                  {['ALL', 'Kathmandu', 'Lalitpur', 'Bhaktapur'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                    >
                      {loc === 'ALL' ? 'All Locations' : loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'BUDGET' ? null : 'BUDGET')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedBudget !== 'ALL'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3 h-3 text-slate-400" />
                <span>{selectedBudget === 'ALL' ? 'Budget' : selectedBudget}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openDropdown === 'BUDGET' && (
                <div className="absolute top-full mt-1.5 left-0 z-40 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs space-y-0.5">
                  {[
                    { id: 'ALL', label: 'All Budgets' },
                    { id: '<12K', label: 'Under Rs. 12,000' },
                    { id: '12K-15K', label: 'Rs. 12,000 - 15,000' },
                    { id: '>15K', label: 'Above Rs. 15,000' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBudget(b.id);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Move-in Date Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'MOVEIN' ? null : 'MOVEIN')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedMoveIn !== 'ALL'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{selectedMoveIn === 'ALL' ? 'Move-in Date' : selectedMoveIn}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openDropdown === 'MOVEIN' && (
                <div className="absolute top-full mt-1.5 left-0 z-40 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs space-y-0.5">
                  {['ALL', 'Immediate', 'Sep 2026', 'Oct 2026', 'Nov 2026'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMoveIn(m);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                    >
                      {m === 'ALL' ? 'Any Time' : m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lifestyle Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'LIFESTYLE' ? null : 'LIFESTYLE')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedLifestyle !== 'ALL'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-3 h-3 text-slate-400" />
                <span>{selectedLifestyle === 'ALL' ? 'Lifestyle' : selectedLifestyle}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {openDropdown === 'LIFESTYLE' && (
                <div className="absolute top-full mt-1.5 left-0 z-40 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs space-y-0.5">
                  {['ALL', 'Clean', 'Non-smoker', 'Early sleeper', 'Social', 'Active'].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setSelectedLifestyle(l);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                    >
                      {l === 'ALL' ? 'Any Lifestyle' : l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition ml-auto"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>More Filters</span>
            </button>
          </div>

          {/* 4. Recommended Roommates Section (4-Card Responsive Grid) */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Recommended Roommates
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Based on your preferences and lifestyle.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab(activeTab === 'ALL_RECOMMENDED' ? 'DASHBOARD' : 'ALL_RECOMMENDED')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition"
              >
                {activeTab === 'ALL_RECOMMENDED' ? 'Show Less' : 'View all →'}
              </button>
            </div>

            {/* 4 Cards Grid */}
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs">Finding compatible flatmates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No candidates match current filters</p>
                <p className="text-xs">Try clearing filters or broadening your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('ALL');
                    setSelectedBudget('ALL');
                    setSelectedMoveIn('ALL');
                    setSelectedLifestyle('ALL');
                    setPassedIds(new Set());
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredCandidates.slice(0, activeTab === 'ALL_RECOMMENDED' ? 12 : 4).map((r) => {
                  const isSaved = savedIds.has(r.id);
                  const isConnected = connectedIds.has(r.id) || r.isConnected;
                  const isPending = pendingIds.has(r.id) || r.isPending;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedProfile(r)}
                      className="roommate-candidate-card group cursor-pointer"
                    >
                      {/* Photo with Overlay Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/landing/hero_roommates.jpg';
                          }}
                        />

                        {/* Top-Left: Match Score Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="match-score-badge">
                            {r.matchScore}% Match
                          </span>
                        </div>

                        {/* Top-Right: Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(r.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 transition shadow-xs"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        {/* Name & Role */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              {r.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {r.age} • {r.role}
                          </p>
                        </div>

                        {/* Meta items: Location, Budget, Move-in */}
                        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{r.location}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              Rs. {r.min_budget.toLocaleString()} - {r.max_budget.toLocaleString()}/month
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Move-in: {r.move_in}</span>
                          </div>
                        </div>

                        {/* Lifestyle Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {r.tags.map((tag, idx) => (
                            <span key={idx} className="lifestyle-tag-chip">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions (Pass / Connect) */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePass(r.id);
                            }}
                            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <X className="w-3 h-3" /> Pass
                          </button>

                          <button
                            type="button"
                            disabled={isConnected || isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(r.id);
                            }}
                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs ${
                              isConnected
                                ? 'bg-emerald-600 text-white'
                                : isPending
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <UserCheck className="w-3 h-3" /> Matched
                              </>
                            ) : isPending ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Sent
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" /> Connect
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 5. Your Matches Section (Bottom of Center, Horizontal Cards) */}
          <section className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Heart className="w-4 h-4 fill-blue-600 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Your Matches
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    People who have also liked you. Start a conversation!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab(activeTab === 'ALL_MATCHES' ? 'DASHBOARD' : 'ALL_MATCHES')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition"
              >
                {activeTab === 'ALL_MATCHES' ? 'Show Less' : 'View all →'}
              </button>
            </div>

            {/* Horizontal Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mutualMatches.slice(0, 2).map((match) => (
                <div key={match.id} className="mutual-match-card group">
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-slate-700 shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/landing/hero_roommates.jpg';
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {match.name}
                      </h3>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {match.matchScore}% compatibility
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {match.synergyNote}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onStartChat?.(match.id < 100 ? match.id : 3)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" /> Chat
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProfile(match)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column (Matches mini-list, Recent Activity, Promo) */}
        <div className="space-y-4">
          {/* Widget 1: Your Matches Mini-List */}
          <div className="sidebar-widget-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <Heart className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>Your Matches</span>
              </div>
              <button
                onClick={() => setActiveTab('ALL_MATCHES')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 102,
                  name: 'Priya Shrestha',
                  score: 87,
                  time: 'Matched 2 hours ago',
                  image: '/landing/priya.jpg',
                },
                {
                  id: 101,
                  name: 'Aarav Sharma',
                  score: 92,
                  time: 'Matched 1 day ago',
                  image: '/landing/aarav.jpg',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => onStartChat?.(m.id < 100 ? m.id : 3)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {m.name}
                      </h5>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        {m.score}% compatibility
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {m.time}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Recent Activity */}
          <div className="sidebar-widget-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Recent Activity</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                View all →
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: <Heart className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />,
                  bg: 'bg-blue-50 dark:bg-blue-950/50',
                  text: 'You matched with Priya',
                  time: '2 hours ago',
                },
                {
                  icon: <User className="w-3.5 h-3.5 text-blue-600" />,
                  bg: 'bg-blue-50 dark:bg-blue-950/50',
                  text: 'Aarav viewed your profile',
                  time: 'Yesterday',
                },
                {
                  icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
                  bg: 'bg-purple-50 dark:bg-purple-950/50',
                  text: '5 new roommate recommendations',
                  time: 'Yesterday',
                },
                {
                  icon: <MessageSquare className="w-3.5 h-3.5 text-purple-600" />,
                  bg: 'bg-purple-50 dark:bg-purple-950/50',
                  text: 'Nisha sent you a message',
                  time: '2 days ago',
                },
              ].map((act, idx) => (
                <div key={idx} className="activity-list-item">
                  <div className={`w-8 h-8 rounded-full ${act.bg} flex items-center justify-center shrink-0`}>
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.text}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {act.time}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Widget 4: Community Promo Card (Matching Mockup with Friends Illustration) */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 dark:from-slate-800 dark:to-slate-900 border border-blue-100/80 dark:border-slate-800 p-4 text-center space-y-3 shadow-xs">
            <div className="text-left space-y-0.5">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 italic">
                Good people.
              </h5>
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 italic">
                Great spaces.
              </h5>
              <h5 className="font-black text-xs text-blue-600 dark:text-blue-400">
                Better together.
              </h5>
            </div>

            <div className="w-full h-24 overflow-hidden flex items-center justify-center">
              <img
                src="/landing/community_friends.svg"
                alt="Friends community"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL_RECOMMENDED');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Find Your Match →
            </button>
          </div>
        </div>
      </div>

      {/* Profile Compatibility Breakdown Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedProfile.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedProfile.age} • {selectedProfile.role} • {selectedProfile.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Compatibility Score
                </span>
                <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {selectedProfile.matchScore}% Match
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                {selectedProfile.synergyNote}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Me</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                {selectedProfile.bio}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Preferences & Schedule
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Budget Range</span>
                  <strong className="text-slate-800 dark:text-white">
                    Rs. {selectedProfile.min_budget.toLocaleString()} - {selectedProfile.max_budget.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Move-In Target</span>
                  <strong className="text-slate-800 dark:text-white">{selectedProfile.move_in}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const pid = selectedProfile.id < 100 ? selectedProfile.id : 3;
                  setSelectedProfile(null);
                  onStartChat?.(pid);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" /> Message {selectedProfile.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
