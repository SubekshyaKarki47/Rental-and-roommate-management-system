import React, { useState } from 'react';
import {
  Users,
  Home,
  Building2,
  Building,
  Calculator,
  ClipboardList,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Layers,
  MapPin,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MessagesInboxSubview } from '../dashboard/subviews/MessagesInboxSubview';
import { RoommateDiscoveryView } from '../roommates/RoommateDiscoveryView';
import type { Property } from '../../types/property';
import './SharedLivingDashboard.css';

interface SharedLivingDashboardProps {
  onSwitchDashboard: (dashboardKey: 'tenant' | 'roommate' | 'shared-living' | 'landlord') => void;
  onNavigateHome?: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const SharedLivingDashboard: React.FC<SharedLivingDashboardProps> = ({
  onSwitchDashboard,
  onNavigateHome,
  onSelectProperty,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeNav, setActiveNav] = useState<'group' | 'apartments' | 'roommates' | 'calculator' | 'applications' | 'messages' | 'settings'>('group');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switcherDropdownOpen, setSwitcherDropdownOpen] = useState(false);

  // Group Hub State
  const [groupMembers] = useState([
    {
      id: 1,
      name: user?.full_name || 'You',
      role: 'Group Organizer',
      budget: 18000,
      roomPreference: 'Master Bedroom',
      isMe: true,
      avatar: user?.avatar,
    },
    {
      id: 2,
      name: 'Aarav Sharma',
      role: 'Co-Applicant',
      budget: 16000,
      roomPreference: 'Secondary Bedroom',
      isMe: false,
      avatar: '/landing/aarav.jpg',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Calculator State
  const [calcRent, setCalcRent] = useState(32000);
  const [calcUtilities, setCalcUtilities] = useState(4000);
  const [masterRatio, setMasterRatio] = useState(55); // 55% master bedroom, 45% standard

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

  const totalGroupBudget = groupMembers.reduce((acc, m) => acc + m.budget, 0);

  const sharedApartments: Property[] = [
    {
      id: 1,
      title: 'Modern 2BHK Apartment in Shantinagar',
      slug: 'modern-2bhk-shantinagar',
      description: 'Ideal for 2 roommates with 2 independent master bedrooms, large living hall, and 24h water.',
      property_type: 'APARTMENT',
      status: 'ACTIVE',
      address: 'Shantinagar Gate No. 2',
      area: 'Baneshwor',
      city: 'Kathmandu',
      latitude: 27.6915,
      longitude: 85.3415,
      monthly_rent: 25000,
      security_deposit: 25000,
      bedrooms: 2,
      bathrooms: 2,
      floor: 3,
      area_sqft: 850,
      furnishing: 'FURNISHED',
      has_wifi: true,
      has_parking: true,
      has_24h_water: true,
      has_electricity_backup: true,
      has_kitchen: true,
      has_washing_machine: true,
      has_balcony: true,
      has_elevator: false,
      pets_allowed: false,
      smoking_allowed: false,
      is_verified: true,
      is_featured: true,
      rating: 4.8,
      total_reviews: 24,
      primary_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      images: [],
      created_at: '2026-01-01',
    },
    {
      id: 2,
      title: 'Spacious 3BHK Flat near Sanepa Chowk',
      slug: 'spacious-3bhk-sanepa',
      description: 'Perfect for 2-3 young professionals or students. Separate balconies for each bedroom.',
      property_type: 'APARTMENT',
      status: 'ACTIVE',
      address: 'Sanepa Heights',
      area: 'Sanepa',
      city: 'Lalitpur',
      latitude: 27.6845,
      longitude: 85.3095,
      monthly_rent: 36000,
      security_deposit: 36000,
      bedrooms: 3,
      bathrooms: 2,
      floor: 2,
      area_sqft: 1200,
      furnishing: 'SEMI_FURNISHED',
      has_wifi: true,
      has_parking: true,
      has_24h_water: true,
      has_electricity_backup: true,
      has_kitchen: true,
      has_washing_machine: true,
      has_balcony: true,
      has_elevator: true,
      pets_allowed: true,
      smoking_allowed: false,
      is_verified: true,
      is_featured: true,
      rating: 4.9,
      total_reviews: 18,
      primary_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      images: [],
      created_at: '2026-01-15',
    },
  ];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setInviteEmail('');
    setTimeout(() => setInviteSent(false), 3000);
  };

  // Split calculation
  const totalCost = calcRent + calcUtilities;
  const person1Rent = Math.round((calcRent * (masterRatio / 100)) + (calcUtilities / 2));
  const person2Rent = totalCost - person1Rent;

  return (
    <div className="shared-dash-container">
      {/* 1. SIDEBAR (Emerald Brand) */}
      <aside className="shared-dash-sidebar">
        <div>
          {/* Brand Header */}
          <div className="shared-dash-brand">
            <div className="shared-dash-brand-icon">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="shared-dash-brand-title">RoomMateHub</span>
              <span className="shared-dash-brand-sub">Co-Living & Shared Housing</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="shared-dash-nav">
            <button
              onClick={() => setActiveNav('group')}
              className={`shared-dash-nav-item ${activeNav === 'group' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <Users className="w-4 h-4" />
                <span>Living Group Hub</span>
              </div>
              <span className="shared-dash-badge">{groupMembers.length} Members</span>
            </button>

            <button
              onClick={() => setActiveNav('apartments')}
              className={`shared-dash-nav-item ${activeNav === 'apartments' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <Home className="w-4 h-4" />
                <span>Multi-BHK Apartments</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('roommates')}
              className={`shared-dash-nav-item ${activeNav === 'roommates' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <Users className="w-4 h-4" />
                <span>Recommended Roommates</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('calculator')}
              className={`shared-dash-nav-item ${activeNav === 'calculator' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <Calculator className="w-4 h-4" />
                <span>Rent & Bill Splitter</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav('applications')}
              className={`shared-dash-nav-item ${activeNav === 'applications' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <ClipboardList className="w-4 h-4" />
                <span>Joint Applications</span>
              </div>
              <span className="shared-dash-badge">1 Active</span>
            </button>

            <button
              onClick={() => setActiveNav('messages')}
              className={`shared-dash-nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            >
              <div className="shared-dash-nav-left">
                <MessageSquare className="w-4 h-4" />
                <span>Group Discussions</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Switcher & Sign Out */}
        <div>
          <button
            onClick={() => setActiveNav('settings')}
            className={`shared-dash-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
          >
            <div className="shared-dash-nav-left">
              <Settings className="w-4 h-4" />
              <span>Co-Living Settings</span>
            </div>
          </button>

          <button
            onClick={() => logout()}
            className="shared-dash-nav-item !text-rose-400 hover:!text-rose-300 hover:!bg-rose-950/40 mt-1"
          >
            <div className="shared-dash-nav-left">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </div>
          </button>

          {/* Switcher Card */}
          <div
            onClick={() => setSwitcherDropdownOpen(true)}
            className="shared-switcher-card"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Switch Dashboard
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-400">
              Easily toggle into Tenant, Roommate, or Landlord mode.
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="shared-dash-main">
        {/* Header */}
        <header className="shared-dash-header">
          {/* Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setSwitcherDropdownOpen(!switcherDropdownOpen)}
              className="dash-switcher-btn hover:border-emerald-500"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Shared Living Dashboard</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Switcher Dropdown */}
            {switcherDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn"
                onMouseLeave={() => setSwitcherDropdownOpen(false)}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  Available Dashboards
                </p>
                <button
                  onClick={() => {
                    onSwitchDashboard('tenant');
                    setSwitcherDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
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
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Roommate Dashboard</span>
                    <span className="text-[10px] text-slate-400">Find compatible roommates</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSwitchDashboard('shared-living');
                    setSwitcherDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">Shared Living Dashboard</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">Active Mode</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSwitchDashboard('landlord');
                    setSwitcherDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Landlord Dashboard</span>
                    <span className="text-[10px] text-slate-400">Listings, approvals & rent</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
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
                className="shared-profile-chip"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(userDisplayName)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="shared-profile-name">{userDisplayName}</span>
                  <span className="shared-profile-role">Tenant & Roommate</span>
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

        {/* 3. SCROLLABLE BODY */}
        <div className="shared-dash-body">
          {/* Subview 1: Group Hub */}
          {activeNav === 'group' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              {/* Group Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold inline-block mb-3 backdrop-blur-xs">
                    🤝 Active Co-Living Group
                  </span>
                  <h2 className="text-2xl font-black tracking-tight">
                    Looking for a home with your roommates
                  </h2>
                  <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                    By teaming up with a roommate before applying, your group offers landlords a combined income of Rs. 80,000+ with 2x faster lease approvals.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-200">Combined Budget</span>
                    <p className="text-lg font-black">Rs. {totalGroupBudget.toLocaleString()} /mo</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-200">Target Bedrooms</span>
                    <p className="text-lg font-black">2 BHK Flat</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-200">Target Locations</span>
                    <p className="text-lg font-black truncate">Baneshwor, Sanepa</p>
                  </div>
                </div>
              </div>

              {/* Members & Invite */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Group Members */}
                <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Current Group Members ({groupMembers.length}/3)</span>
                  </h3>

                  <div className="space-y-3">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                              {getInitials(member.name)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              {member.name} {member.isMe && <span className="text-[10px] text-emerald-600 font-normal">(You)</span>}
                            </h4>
                            <p className="text-[11px] text-slate-400">{member.role} • {member.roomPreference}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Rs. {member.budget.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Budget share</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Invite Co-Renter */}
                <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Invite Co-Renter</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invite another roommate to your search group so you can track houses and calculate rent splits together.
                  </p>

                  {inviteSent && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Invitation sent successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInvite} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter roommate's email..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Send Group Invite
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Subview 2: Multi-BHK Apartments */}
          {activeNav === 'apartments' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-600" />
                  <span>Recommended Multi-BHK Shared Apartments</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Apartments fitting your group budget of Rs. {totalGroupBudget.toLocaleString()}/mo with separate bedrooms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sharedApartments.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty?.(prop)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <img
                      src={prop.primary_image}
                      alt={prop.title}
                      className="w-full h-48 rounded-xl object-cover mb-3.5"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-[11px]">
                          {prop.bedrooms} Bedrooms • {prop.bathrooms} Baths
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Rs. {prop.monthly_rent.toLocaleString()} /mo
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prop.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {prop.address}, {prop.area}, {prop.city}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between mt-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Per Roommate:</span>
                        <span className="font-bold text-emerald-600">Rs. {Math.round(prop.monthly_rent / prop.bedrooms).toLocaleString()} /person</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'roommates' && (
            <div className="max-w-6xl mx-auto animate-fadeIn">
              <RoommateDiscoveryView />
            </div>
          )}

          {/* Subview 3: Rent & Utility Split Calculator */}
          {activeNav === 'calculator' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  <span>Fair Rent & Utility Split Calculator</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Accurately divide rent based on bedroom square footage, attached balcony/bath, and utilities
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Total Apartment Monthly Rent (Rs.)
                    </label>
                    <input
                      type="number"
                      value={calcRent}
                      onChange={(e) => setCalcRent(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Monthly Utilities (Wi-Fi, Water, Power)
                    </label>
                    <input
                      type="number"
                      value={calcUtilities}
                      onChange={(e) => setCalcUtilities(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Room Weight / Master Bedroom Premium</span>
                    <span className="text-emerald-600">{masterRatio}% Master / {100 - masterRatio}% Standard</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="65"
                    value={masterRatio}
                    onChange={(e) => setMasterRatio(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50% (Equal Split)</span>
                    <span>55% (Balcony & Attached Bath)</span>
                    <span>65% (Large Master Suite)</span>
                  </div>
                </div>

                {/* Results Card */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Roommate 1 (Master Bedroom)</span>
                    <p className="text-xl font-black text-emerald-600 mt-1">
                      Rs. {person1Rent.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Includes Rs. {Math.round(calcUtilities / 2).toLocaleString()} utility share</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Roommate 2 (Standard Bedroom)</span>
                    <p className="text-xl font-black text-teal-600 mt-1">
                      Rs. {person2Rent.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Includes Rs. {Math.round(calcUtilities / 2).toLocaleString()} utility share</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subview 4: Joint Applications */}
          {activeNav === 'applications' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  <span>Joint Rental Applications Tracker</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Applications submitted together as a group to landlords
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Modern 2BHK Apartment in Shantinagar
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      Under Review by Landlord
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Applicants: {userDisplayName} & Aarav Sharma (Combined Income: Rs. 95,000/mo)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submitted on Sep 5, 2026</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">Rs. 25,000 /mo</span>
                  <span className="text-[10px] text-slate-400">Total rent</span>
                </div>
              </div>
            </div>
          )}

          {/* Subview 5: Messages */}
          {activeNav === 'messages' && (
            <div className="h-[calc(100vh-9rem)] animate-fadeIn">
              <MessagesInboxSubview />
            </div>
          )}

          {/* Subview 6: Settings */}
          {activeNav === 'settings' && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Co-Living Group Settings</h3>
              <p className="text-xs text-slate-400">Manage co-renter permissions and group search alerts.</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Group Privacy</span>
                <span className="text-[10px] text-slate-400">Only invited members can view shortlisted properties</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
