import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { Property } from '../../types/property';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Home,
  Building2,
  Building,
  Users,
  ClipboardList,
  CreditCard,
  Coins,
  Wrench,
  FileText,
  MessageSquare,
  Bell,
  BarChart3,
  Settings,
  User as UserIcon,
  Search,
  Sun,
  Moon,
  ChevronRight,
  ArrowRight,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Star,
  Sparkles,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import './TenantDashboard.css';

// Integrated Feature Views
import { PropertyMarketplace } from '../properties/PropertyMarketplace';
import { RoommateDiscoveryView } from '../roommates/RoommateDiscoveryView';
import { RentLedgerDashboard } from '../rentals/RentLedgerDashboard';
import { ExpenseSplittingDashboard } from '../expenses/ExpenseSplittingDashboard';
import { MaintenanceDashboard } from '../maintenance/MaintenanceDashboard';

// Dedicated In-Dashboard Subviews
import { ApplicationsSubview } from './subviews/ApplicationsSubview';
import { AgreementsSubview } from './subviews/AgreementsSubview';
import { MessagesInboxSubview } from './subviews/MessagesInboxSubview';
import { NotificationsSubview } from './subviews/NotificationsSubview';
import { AnalyticsSubview } from './subviews/AnalyticsSubview';
import { SettingsSubview } from './subviews/SettingsSubview';
import { ProfileSubview } from './subviews/ProfileSubview';

interface TenantDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenApplications: () => void;
  onOpenAgreements: () => void;
  onOpenChat: (recipientId?: number) => void;
  onOpenMaintenance: () => void;
  onSelectProperty: (property: Property) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  onNavigateTab,
  onOpenApplications: _onOpenApplications,
  onOpenAgreements: _onOpenAgreements,
  onOpenChat: _onOpenChat,
  onOpenMaintenance: _onOpenMaintenance,
  onSelectProperty,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('section') || 'dashboard';
  });
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>(undefined);
  const [mapViewMode, setMapViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Filters state
  const [filterLocation, setFilterLocation] = useState('Kathmandu, Nepal');
  const [filterDate, setFilterDate] = useState('Any date');
  const [filterBudget, setFilterBudget] = useState('Rs. 10k - 50k');
  const [filterPropertyType, setFilterPropertyType] = useState('Any');
  const [filterPriceRange, setFilterPriceRange] = useState('Rs. 10,000 - 50,000');
  const [filterBedrooms, setFilterBedrooms] = useState('Any');

  // Favorites state
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3]));

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Fallback recommended properties matching mockup
  const recommendedProperties: Property[] = [
    {
      id: 1,
      title: 'Modern 2BHK Apartment',
      slug: 'modern-2bhk-apartment-baneshwor',
      description: 'Bright and airy 2BHK apartment in Shantinagar, New Baneshwor with balcony and water backup.',
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
      bathrooms: 1,
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
      landlord: {
        id: 1,
        first_name: 'Suresh',
        last_name: 'Shrestha',
        email: 'suresh@example.com',
        verification_status: 'VERIFIED',
        response_time_minutes: 15,
        rating: 4.8,
        total_reviews: 24,
      },
    },
    {
      id: 2,
      title: 'Cozy Room in Shared Apartment',
      slug: 'cozy-room-shared-apartment-sanepa',
      description: 'Sunny private room in quiet residential neighborhood in Lalitpur, close to transit.',
      property_type: 'ROOM',
      status: 'ACTIVE',
      address: 'Sanepa Chowk, Ward 2',
      area: 'Lalitpur',
      city: 'Lalitpur',
      latitude: 27.6845,
      longitude: 85.3125,
      monthly_rent: 12000,
      security_deposit: 12000,
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      area_sqft: 400,
      furnishing: 'FURNISHED',
      has_wifi: true,
      has_parking: true,
      has_24h_water: true,
      has_electricity_backup: true,
      has_kitchen: true,
      has_washing_machine: true,
      has_balcony: false,
      has_elevator: false,
      pets_allowed: true,
      smoking_allowed: false,
      is_verified: true,
      is_featured: false,
      rating: 4.5,
      total_reviews: 12,
      primary_image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
      images: [],
      created_at: '2026-01-05',
      landlord: {
        id: 2,
        first_name: 'Prakash',
        last_name: 'Maharjan',
        email: 'prakash@example.com',
        verification_status: 'VERIFIED',
        response_time_minutes: 20,
        rating: 4.5,
        total_reviews: 12,
      },
    },
    {
      id: 3,
      title: 'Studio Apartment',
      slug: 'studio-apartment-thamel',
      description: 'Charming studio flat in Thamel near top cafes with independent balcony and modern fixtures.',
      property_type: 'STUDIO',
      status: 'ACTIVE',
      address: 'Near Chhetrapati, Thamel Marg',
      area: 'Thamel',
      city: 'Kathmandu',
      latitude: 27.7152,
      longitude: 85.3123,
      monthly_rent: 18000,
      security_deposit: 18000,
      bedrooms: 1,
      bathrooms: 1,
      floor: 1,
      area_sqft: 900,
      furnishing: 'FURNISHED',
      has_wifi: true,
      has_parking: false,
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
      rating: 4.7,
      total_reviews: 18,
      primary_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      images: [],
      created_at: '2026-01-10',
      landlord: {
        id: 3,
        first_name: 'Anupama',
        last_name: 'Joshi',
        email: 'anupama@example.com',
        verification_status: 'VERIFIED',
        response_time_minutes: 10,
        rating: 4.7,
        total_reviews: 18,
      },
    },
  ];

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [27.7000, 85.3200],
        zoom: 12.5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Add pins matching mockup
      const pins = [
        { lat: 27.6915, lng: 85.3415, label: 'Baneshwor', price: 'Rs. 25k', id: 1 },
        { lat: 27.6845, lng: 85.3125, label: 'Lalitpur', price: 'Rs. 12k', id: 2 },
        { lat: 27.7152, lng: 85.3123, label: 'Thamel', price: 'Rs. 18k', id: 3 },
        { lat: 27.6930, lng: 85.3160, label: 'Kupondole', price: 'Rs. 20k', id: 1 },
        { lat: 27.7050, lng: 85.3300, label: 'Maitighar', price: 'Rs. 16k', id: 2 },
      ];

      pins.forEach((pin) => {
        const icon = L.divIcon({
          className: 'custom-map-pin-pill',
          html: `<div style="background-color: #2563eb; color: #ffffff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(37,99,235,0.4); border: 2px solid #ffffff; white-space: nowrap; cursor: pointer; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 3px;">📍 ${pin.price}</div>`,
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
        marker.on('click', () => {
          const prop = recommendedProperties.find((p) => p.id === pin.id) || recommendedProperties[0];
          onSelectProperty(prop);
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const toggleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNav = (tabKey: string, recipientId?: number) => {
    setActiveNav(tabKey);
    if (recipientId !== undefined) {
      setSelectedChatId(recipientId);
    }
    setProfileDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const userName = user?.first_name || user?.full_name?.split(' ')[0] || 'Subekshya';

  return (
    <div className="tenant-dashboard-container">
      {/* ========================================================================= */}
      {/* 1. DARK NAVY SIDEBAR (Exact Replica)                                      */}
      {/* ========================================================================= */}
      <aside className="tenant-sidebar">
        <div>
          {/* Brand Logo Header */}
          <div className="tenant-brand">
            <div className="tenant-brand-icon">
              <Home className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="tenant-brand-title">RoomMateHub</span>
              <span className="tenant-brand-subtext">Better Homes, Better Together.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="tenant-nav-group">
            <button
              onClick={() => handleNav('dashboard')}
              className={`tenant-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('properties')}
              className={`tenant-nav-item ${activeNav === 'properties' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Building className="w-4 h-4" />
                <span>Properties</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('roommates')}
              className={`tenant-nav-item ${activeNav === 'roommates' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Users className="w-4 h-4" />
                <span>Roommates</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('applications')}
              className={`tenant-nav-item ${activeNav === 'applications' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <ClipboardList className="w-4 h-4" />
                <span>Applications</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('rentals')}
              className={`tenant-nav-item ${activeNav === 'rentals' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <CreditCard className="w-4 h-4" />
                <span>Rent & Payments</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('expenses')}
              className={`tenant-nav-item ${activeNav === 'expenses' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Coins className="w-4 h-4" />
                <span>Expenses</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('maintenance')}
              className={`tenant-nav-item ${activeNav === 'maintenance' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Wrench className="w-4 h-4" />
                <span>Maintenance</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('agreements')}
              className={`tenant-nav-item ${activeNav === 'agreements' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <FileText className="w-4 h-4" />
                <span>Agreements</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('messages')}
              className={`tenant-nav-item ${activeNav === 'messages' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
              <span className="tenant-nav-badge">3</span>
            </button>

            <button
              onClick={() => handleNav('notifications')}
              className={`tenant-nav-item ${activeNav === 'notifications' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('analytics')}
              className={`tenant-nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
            >
              <div className="tenant-nav-left">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom Section */}
        <div className="tenant-sidebar-bottom">
          <button
            onClick={() => handleNav('settings')}
            className={`tenant-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
          >
            <div className="tenant-nav-left">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('profile')}
            className={`tenant-nav-item ${activeNav === 'profile' ? 'active' : ''}`}
          >
            <div className="tenant-nav-left">
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </button>

          {/* Branded Promo Box */}
          <div
            onClick={() => handleNav('properties')}
            className="sidebar-promo-card cursor-pointer hover:scale-[1.02] transition-transform"
            title="Browse available properties"
          >
            <div className="sidebar-promo-icon">
              <Home className="w-5 h-5 fill-blue-500 text-blue-500" />
            </div>
            <p className="sidebar-promo-text">
              Your next home is closer than you think.
              <span className="sidebar-promo-heart">❤️</span>
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA & TOP HEADER                                         */}
      {/* ========================================================================= */}
      <div className="tenant-main-area">
        {/* Top Header Bar */}
        <header className="tenant-header">
          {/* Global Search Bar with back to dashboard button if not on overview */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {activeNav !== 'dashboard' && (
              <button
                onClick={() => handleNav('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition flex-shrink-0"
                title="Back to Dashboard Overview"
              >
                <span>← Overview</span>
              </button>
            )}

            <div className="tenant-header-search flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNav('properties');
                }}
                placeholder="Search properties, neighborhoods, or locations... (Press Enter)"
              />
            </div>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="tenant-header-actions">
            {/* Notification Bell */}
            <button
              onClick={() => handleNav('notifications')}
              className={`tenant-header-icon-btn ${activeNav === 'notifications' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : ''}`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="tenant-header-badge">3</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="tenant-header-icon-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Profile Chip with Dropdown */}
            <div className="relative">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="tenant-profile-chip"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Subekshya Karki"
                  className="tenant-avatar-img"
                />
                <div className="tenant-profile-info">
                  <span className="tenant-profile-name">{user?.full_name || 'Subekshya Karki'}</span>
                  <span className="tenant-profile-role">Tenant</span>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.full_name || 'Subekshya Karki'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'subekshyakarki601@gmail.com'}</p>
                  </div>
                  <button
                    onClick={() => handleNav('profile')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => handleNav('settings')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-500" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => handleNav('applications')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                    <span>Rental Applications</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('home');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-blue-500" />
                    <span>View Public Landing Page</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
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

        {/* Scrollable Dashboard Body */}
        <div className="tenant-body-scrollable">
          {activeNav === 'dashboard' && (
            <div className="tenant-dashboard-grid">
            
            {/* LEFT / CENTER MAIN COLUMN */}
            <div className="tenant-left-content">
              
              {/* ================================================================= */}
              {/* 3. WELCOME BANNER WITH LIVING ROOM PHOTO & CURSIVE NOTE           */}
              {/* ================================================================= */}
              <div className="tenant-welcome-banner">
                <div className="tenant-welcome-text">
                  <h1 className="tenant-greeting-title">
                    Good morning, {userName} ☀️
                  </h1>
                  <p className="tenant-greeting-subtitle">
                    Find your next home, connect with great roommates, and manage your rental journey — all in one place.
                  </p>
                </div>

                <div className="tenant-banner-visual">
                  <img
                    src="/landing/hero_living_room.jpg"
                    alt="Sunny living room with panoramic view"
                    className="tenant-banner-img"
                  />
                  <div className="tenant-cursive-note">
                    Better homes<br />
                    Better together.
                    <span className="tenant-cursive-heart">♡</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 4. 4 KPI STATS CARDS                                              */}
              {/* ================================================================= */}
              <div className="tenant-kpi-grid">
                {/* 1. Saved Properties */}
                <div
                  onClick={() => handleNav('properties')}
                  className="tenant-kpi-card cursor-pointer"
                >
                  <div className="tenant-kpi-header">
                    <div className="tenant-kpi-icon bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="tenant-kpi-title">Saved Properties</span>
                      <h3 className="tenant-kpi-value">8</h3>
                    </div>
                  </div>
                  <div className="tenant-kpi-footer">
                    <span className="tenant-kpi-link">View all →</span>
                  </div>
                </div>

                {/* 2. Active Applications */}
                <div
                  onClick={() => handleNav('applications')}
                  className="tenant-kpi-card cursor-pointer"
                >
                  <div className="tenant-kpi-header">
                    <div className="tenant-kpi-icon bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="tenant-kpi-title">Active Applications</span>
                      <h3 className="tenant-kpi-value">2</h3>
                    </div>
                  </div>
                  <div className="tenant-kpi-footer">
                    <span className="tenant-kpi-link">View all →</span>
                  </div>
                </div>

                {/* 3. Upcoming Rent */}
                <div
                  onClick={() => handleNav('rentals')}
                  className="tenant-kpi-card cursor-pointer"
                >
                  <div className="tenant-kpi-header">
                    <div className="tenant-kpi-icon bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="tenant-kpi-title">Upcoming Rent</span>
                      <h3 className="tenant-kpi-value">Rs. 15,000</h3>
                    </div>
                  </div>
                  <div className="tenant-kpi-footer">
                    <span className="text-rose-500 font-semibold text-xs">Due in 5 days</span>
                  </div>
                </div>

                {/* 4. Shared Expenses */}
                <div
                  onClick={() => handleNav('expenses')}
                  className="tenant-kpi-card cursor-pointer"
                >
                  <div className="tenant-kpi-header">
                    <div className="tenant-kpi-icon bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                      <Coins className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="tenant-kpi-title">Shared Expenses</span>
                      <h3 className="tenant-kpi-value">Rs. 8,450</h3>
                    </div>
                  </div>
                  <div className="tenant-kpi-footer">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">You owe Rs. 1,200</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 5. MIDDLE ROW: EXPLORE PROPERTIES NEAR YOU & QUICK STATS          */}
              {/* ================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Card A: Explore Properties Near You (7 cols) */}
                <div className="lg:col-span-7 tenant-section-card">
                  <div className="tenant-card-header">
                    <h3 className="tenant-card-title">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Explore Properties Near You</span>
                    </h3>
                    <div className="map-view-toggle">
                      <button
                        onClick={() => setMapViewMode('map')}
                        className={`map-view-btn ${mapViewMode === 'map' ? 'active' : ''}`}
                      >
                        Map view
                      </button>
                      <button
                        onClick={() => setMapViewMode('list')}
                        className={`map-view-btn ${mapViewMode === 'list' ? 'active' : ''}`}
                      >
                        List view
                      </button>
                    </div>
                  </div>

                  {/* Top Search Controls Bar */}
                  <div className="explore-top-filters">
                    <div className="sm:col-span-4 explore-filter-input">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        placeholder="Location"
                      />
                    </div>
                    <div className="sm:col-span-3 explore-filter-input">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="Move-in Date"
                      />
                    </div>
                    <div className="sm:col-span-3 explore-filter-input">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={filterBudget}
                        onChange={(e) => setFilterBudget(e.target.value)}
                        placeholder="Budget"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        onClick={() => onNavigateTab('properties')}
                        className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-2 py-2 flex items-center justify-center gap-1 shadow-sm shadow-blue-500/30 transition cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </div>
                  </div>

                  {/* Split Layout: Leaflet Map on Left, Filters on Right */}
                  <div className="explore-map-layout">
                    {/* Leaflet Map Preview */}
                    <div className="explore-map-container">
                      <div ref={mapContainerRef} className="w-full h-full z-10" />
                    </div>

                    {/* Detailed Side Filters */}
                    <div className="explore-side-filters">
                      <div>
                        <label className="side-filter-label">Property Type</label>
                        <select
                          value={filterPropertyType}
                          onChange={(e) => setFilterPropertyType(e.target.value)}
                          className="side-filter-select"
                        >
                          <option value="Any">Any</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Shared Room">Shared Room</option>
                          <option value="Studio">Studio</option>
                        </select>
                      </div>

                      <div>
                        <label className="side-filter-label">Price Range</label>
                        <select
                          value={filterPriceRange}
                          onChange={(e) => setFilterPriceRange(e.target.value)}
                          className="side-filter-select"
                        >
                          <option value="Rs. 10,000 - 50,000">Rs. 10,000 - 50,000</option>
                          <option value="Under Rs. 15,000">Under Rs. 15,000</option>
                          <option value="Rs. 15,000 - 30,000">Rs. 15,000 - 30,000</option>
                          <option value="Above Rs. 30,000">Above Rs. 30,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="side-filter-label">Bedrooms</label>
                        <select
                          value={filterBedrooms}
                          onChange={(e) => setFilterBedrooms(e.target.value)}
                          className="side-filter-select"
                        >
                          <option value="Any">Any</option>
                          <option value="1">1 Bedroom</option>
                          <option value="2">2 Bedrooms</option>
                          <option value="3+">3+ Bedrooms</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleNav('properties')}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>More Filters</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card B: Quick Stats & Donut Chart (5 cols) */}
                <div id="quick-stats-box" className="lg:col-span-5 tenant-section-card flex flex-col justify-between">
                  <div>
                    <div className="tenant-card-header">
                      <h3 className="tenant-card-title">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span>Quick Stats</span>
                      </h3>
                      <button
                        onClick={() => handleNav('analytics')}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>View more</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 2 Mini KPI Chips */}
                    <div className="quick-stats-chips">
                      <div className="stats-chip-card">
                        <div className="stats-chip-icon">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">12</p>
                          <p className="text-[10px] text-slate-400">Total Listings</p>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ↑ 20%
                          </span>
                        </div>
                      </div>

                      <div className="stats-chip-card">
                        <div className="stats-chip-icon">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">6</p>
                          <p className="text-[10px] text-slate-400">New Applicants</p>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ↑ 50%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Donut Chart with Legend */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Property Type Distribution
                      </p>
                      <div className="donut-chart-container relative">
                        {/* SVG Donut */}
                        <div className="relative flex items-center justify-center">
                          <svg className="donut-chart-svg" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path
                              className="text-slate-100 dark:text-slate-800"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 1: Apartment 50% */}
                            <path
                              stroke="#2563eb"
                              strokeWidth="4"
                              strokeDasharray="50, 100"
                              strokeDashoffset="0"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 2: Shared Room 25% */}
                            <path
                              stroke="#38bdf8"
                              strokeWidth="4"
                              strokeDasharray="25, 100"
                              strokeDashoffset="-50"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 3: Studio 17% */}
                            <path
                              stroke="#818cf8"
                              strokeWidth="4"
                              strokeDasharray="17, 100"
                              strokeDashoffset="-75"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 4: Others 8% */}
                            <path
                              stroke="#f59e0b"
                              strokeWidth="4"
                              strokeDasharray="8, 100"
                              strokeDashoffset="-92"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="donut-center-label">
                            <span className="donut-center-value">12</span>
                            <span className="donut-center-subtitle block">Listings</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="donut-legend">
                          <div className="donut-legend-row">
                            <span><span className="donut-legend-dot" style={{ backgroundColor: '#2563eb' }} />Apartment</span>
                            <span className="font-bold">50%</span>
                          </div>
                          <div className="donut-legend-row">
                            <span><span className="donut-legend-dot" style={{ backgroundColor: '#38bdf8' }} />Shared Room</span>
                            <span className="font-bold">25%</span>
                          </div>
                          <div className="donut-legend-row">
                            <span><span className="donut-legend-dot" style={{ backgroundColor: '#818cf8' }} />Studio</span>
                            <span className="font-bold">17%</span>
                          </div>
                          <div className="donut-legend-row">
                            <span><span className="donut-legend-dot" style={{ backgroundColor: '#f59e0b' }} />Others</span>
                            <span className="font-bold">8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top tip for you Alert Box */}
                  <div className="stats-top-tip">
                    <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="font-bold block text-[11px]">Top tip for you</span>
                      <span className="text-[11px] opacity-90">
                        Properties near Thamel get 3x more applications. Check them out! →
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ================================================================= */}
              {/* 6. RECOMMENDED PROPERTIES (3 Cards Replica)                       */}
              {/* ================================================================= */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Recommended Properties</span>
                  </h3>
                  <button
                    onClick={() => handleNav('properties')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="recommended-grid">
                  {recommendedProperties.map((prop, idx) => (
                    <div
                      key={prop.id}
                      onClick={() => onSelectProperty(prop)}
                      className="rec-property-card group cursor-pointer"
                    >
                      <div className="rec-img-wrapper">
                        <img
                          src={prop.primary_image}
                          alt={prop.title}
                          className="rec-property-img"
                        />
                        {idx === 0 && (
                          <span className="rec-badge bg-emerald-500 text-white">✓ Verified</span>
                        )}
                        {idx === 1 && (
                          <span className="rec-badge bg-emerald-600 text-white">New</span>
                        )}
                        {idx === 2 && (
                          <span className="rec-badge bg-blue-600 text-white">Popular</span>
                        )}

                        <button
                          onClick={(e) => toggleFav(prop.id, e)}
                          className="rec-heart-btn"
                          aria-label="Save property"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              favorites.has(prop.id) ? 'text-rose-500 fill-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="rec-details-body">
                        <div>
                          <h4 className="rec-property-title group-hover:text-blue-600 transition-colors">
                            {prop.title}
                          </h4>
                          <p className="rec-property-loc">
                            📍 {prop.address}, {prop.area}
                          </p>
                        </div>

                        <div className="rec-specs-row">
                          <span>🛏 {prop.bedrooms} bed</span>
                          <span>🚿 {prop.bathrooms} bath</span>
                          <span>📐 {prop.area_sqft} sq.ft.</span>
                        </div>

                        <div className="rec-footer-row">
                          <div>
                            <span className="rec-price-tag">
                              Rs. {prop.monthly_rent.toLocaleString()}/month
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {prop.rating}
                              </span>
                              <span>({prop.total_reviews} reviews)</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProperty(prop);
                            }}
                            className="rec-view-details-btn"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================================================================= */}
              {/* 7. QUICK ACTIONS BAR (4 Action Buttons)                           */}
              {/* ================================================================= */}
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Quick Actions</span>
                </div>

                <div className="quick-actions-bar">
                  <div
                    onClick={() => handleNav('properties')}
                    className="quick-action-btn"
                  >
                    <div className="quick-action-icon bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="quick-action-title">Find a Property</h5>
                      <p className="quick-action-desc">Search rentals near you</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNav('roommates')}
                    className="quick-action-btn"
                  >
                    <div className="quick-action-icon bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="quick-action-title">Find a Roommate</h5>
                      <p className="quick-action-desc">Discover compatible people</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNav('maintenance')}
                    className="quick-action-btn"
                  >
                    <div className="quick-action-icon bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="quick-action-title">Report Maintenance</h5>
                      <p className="quick-action-desc">Get issues fixed</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleNav('agreements')}
                    className="quick-action-btn"
                  >
                    <div className="quick-action-icon bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="quick-action-title">View Agreements</h5>
                      <p className="quick-action-desc">Check your lease</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* =================================================================== */}
            {/* RIGHT WIDGETS COLUMN (Exact Replica)                               */}
            {/* =================================================================== */}
            <div className="tenant-right-widgets">
              
              {/* Widget 1: Upcoming Reminders */}
              <div className="tenant-widget-card">
                <div className="tenant-widget-header">
                  <h4 className="tenant-widget-title">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>Upcoming Reminders</span>
                  </h4>
                  <button
                    onClick={() => handleNav('rentals')}
                    className="tenant-widget-link"
                  >
                    View all →
                  </button>
                </div>

                <div className="reminders-list">
                  {/* Item 1 */}
                  <div
                    onClick={() => handleNav('rentals')}
                    className="reminder-item"
                  >
                    <div className="flex items-center">
                      <div className="reminder-date-block">
                        <span className="reminder-month">Sep</span>
                        <span className="reminder-day">10</span>
                      </div>
                      <div className="reminder-info">
                        <h5 className="reminder-title">Rent payment due</h5>
                        <p className="reminder-subtitle">Rs. 15,000 • 5 days left</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Item 2 */}
                  <div
                    onClick={() => handleNav('maintenance')}
                    className="reminder-item"
                  >
                    <div className="flex items-center">
                      <div className="reminder-date-block">
                        <span className="reminder-month">Sep</span>
                        <span className="reminder-day">12</span>
                      </div>
                      <div className="reminder-info">
                        <h5 className="reminder-title">Maintenance follow-up</h5>
                        <p className="reminder-subtitle">Kitchen sink repair</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Item 3 */}
                  <div
                    onClick={() => handleNav('applications')}
                    className="reminder-item"
                  >
                    <div className="flex items-center">
                      <div className="reminder-date-block">
                        <span className="reminder-month">Sep</span>
                        <span className="reminder-day">15</span>
                      </div>
                      <div className="reminder-info">
                        <h5 className="reminder-title">Application response</h5>
                        <p className="reminder-subtitle">Green Valley Apartment</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Item 4 */}
                  <div
                    onClick={() => handleNav('agreements')}
                    className="reminder-item"
                  >
                    <div className="flex items-center">
                      <div className="reminder-date-block">
                        <span className="reminder-month">Sep</span>
                        <span className="reminder-day">20</span>
                      </div>
                      <div className="reminder-info">
                        <h5 className="reminder-title">Lease agreement review</h5>
                        <p className="reminder-subtitle">3 months remaining</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Widget 2: Recent Messages */}
              <div className="tenant-widget-card">
                <div className="tenant-widget-header">
                  <h4 className="tenant-widget-title">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Recent Messages</span>
                  </h4>
                  <button
                    onClick={() => handleNav('messages')}
                    className="tenant-widget-link"
                  >
                    View all →
                  </button>
                </div>

                <div className="messages-list">
                  {/* Message 1: Aarav Sharma */}
                  <div
                    onClick={() => handleNav('messages', 1)}
                    className="message-item"
                  >
                    <div className="message-avatar-wrap">
                      <img
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                        alt="Aarav Sharma"
                        className="message-avatar-img"
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-top-row">
                        <span className="message-sender">Aarav Sharma</span>
                        <span className="message-time">10:24 AM</span>
                      </div>
                      <p className="message-snippet">Hey! Are you still interested in the room?</p>
                    </div>
                  </div>

                  {/* Message 2: Priya Shrestha */}
                  <div
                    onClick={() => handleNav('messages', 2)}
                    className="message-item"
                  >
                    <div className="message-avatar-wrap">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                        alt="Priya Shrestha"
                        className="message-avatar-img"
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-top-row">
                        <span className="message-sender">Priya Shrestha</span>
                        <span className="message-time">Yesterday</span>
                      </div>
                      <p className="message-snippet">Sure! Let's discuss tomorrow.</p>
                    </div>
                  </div>

                  {/* Message 3: Landlord */}
                  <div
                    onClick={() => handleNav('messages', 3)}
                    className="message-item"
                  >
                    <div className="message-avatar-wrap">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                        alt="Landlord"
                        className="message-avatar-img"
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-top-row">
                        <span className="message-sender">Landlord</span>
                        <span className="message-time">Sep 3</span>
                      </div>
                      <p className="message-snippet">Your application has been approved!</p>
                    </div>
                  </div>

                  {/* Message 4: Nisha Gurung */}
                  <div
                    onClick={() => handleNav('messages', 4)}
                    className="message-item"
                  >
                    <div className="message-avatar-wrap">
                      <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                        alt="Nisha Gurung"
                        className="message-avatar-img"
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-top-row">
                        <span className="message-sender">Nisha Gurung</span>
                        <span className="message-time">Sep 2</span>
                      </div>
                      <p className="message-snippet">I found a great place in Thamel</p>
                    </div>
                  </div>

                  {/* Message 5: Support Team */}
                  <div
                    onClick={() => handleNav('messages', 5)}
                    className="message-item"
                  >
                    <div className="message-avatar-wrap">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                        alt="Support Team"
                        className="message-avatar-img"
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-top-row">
                        <span className="message-sender">Support Team</span>
                        <span className="message-time">Sep 1</span>
                      </div>
                      <p className="message-snippet">Your maintenance request is updated.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3: Upgrade to Premium Card */}
              <div className="upgrade-premium-widget">
                <img
                  src="/signup_illustration.jpg"
                  alt="Scenic landscape"
                  className="upgrade-banner-img"
                />
                <h4 className="upgrade-title">Upgrade to Premium</h4>
                <p className="upgrade-desc">
                  Get more matches, advanced filters, priority support and more.
                </p>
                <button
                  onClick={() => onNavigateTab('pricing')}
                  className="upgrade-btn"
                >
                  <span>View Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
          )}

          {/* Subview 2: Properties Marketplace */}
          {activeNav === 'properties' && (
            <div className="tenant-subview-wrapper animate-fadeIn">
              <PropertyMarketplace />
            </div>
          )}

          {/* Subview 3: Roommate Discovery */}
          {activeNav === 'roommates' && (
            <div className="tenant-subview-wrapper animate-fadeIn">
              <RoommateDiscoveryView onStartChat={(id) => handleNav('messages', id)} />
            </div>
          )}

          {/* Subview 4: Rental Applications Tracker */}
          {activeNav === 'applications' && (
            <ApplicationsSubview
              onNavigateTab={handleNav}
              onSelectProperty={onSelectProperty}
              onOpenChatWithLandlord={() => handleNav('messages', 3)}
            />
          )}

          {/* Subview 5: Rent & Payments Ledger */}
          {activeNav === 'rentals' && (
            <div className="tenant-subview-wrapper animate-fadeIn">
              <RentLedgerDashboard />
            </div>
          )}

          {/* Subview 6: Expense Splitting */}
          {activeNav === 'expenses' && (
            <div className="tenant-subview-wrapper animate-fadeIn">
              <ExpenseSplittingDashboard />
            </div>
          )}

          {/* Subview 7: Maintenance Dashboard */}
          {activeNav === 'maintenance' && (
            <div className="tenant-subview-wrapper animate-fadeIn">
              <MaintenanceDashboard userRole="TENANT" />
            </div>
          )}

          {/* Subview 8: Lease Agreements Center */}
          {activeNav === 'agreements' && (
            <AgreementsSubview
              userName={userName}
              onNavigateTab={handleNav}
            />
          )}

          {/* Subview 9: Messages Inbox */}
          {activeNav === 'messages' && (
            <MessagesInboxSubview
              initialRecipientId={selectedChatId}
            />
          )}

          {/* Subview 10: Notifications Center */}
          {activeNav === 'notifications' && (
            <NotificationsSubview
              onNavigateTab={handleNav}
            />
          )}

          {/* Subview 11: Market Analytics */}
          {activeNav === 'analytics' && (
            <AnalyticsSubview />
          )}

          {/* Subview 12: Account Settings */}
          {activeNav === 'settings' && (
            <SettingsSubview />
          )}

          {/* Subview 13: Tenant Profile */}
          {activeNav === 'profile' && (
            <ProfileSubview />
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
