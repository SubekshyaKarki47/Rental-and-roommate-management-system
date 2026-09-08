import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { TenantOnboardingModal } from './components/auth/TenantOnboardingModal';

// Feature Components
import { TenantDashboard } from './features/dashboard/TenantDashboard';
import { RoommateDashboard } from './features/roommate-dashboard/RoommateDashboard';
import { SharedLivingDashboard } from './features/shared-living-dashboard/SharedLivingDashboard';
import { LandlordDashboard } from './features/landlord-dashboard/LandlordDashboard';
import { RoommateDiscoveryView } from './features/roommates/RoommateDiscoveryView';
import { RentLedgerDashboard } from './features/rentals/RentLedgerDashboard';
import { ExpenseSplittingDashboard } from './features/expenses/ExpenseSplittingDashboard';
import { MaintenanceDashboard } from './features/maintenance/MaintenanceDashboard';
import { AdminDashboard } from './features/moderation/AdminDashboard';
import { PropertyMarketplace } from './features/properties/PropertyMarketplace';

// Modals & Drawers
import { ApplicationsManagerModal } from './features/applications/ApplicationsManagerModal';
import { AgreementViewerModal } from './features/agreements/AgreementViewerModal';
import { ChatDrawer } from './features/messaging/ChatDrawer';
import { AIAssistantModal } from './features/ai/AIAssistantModal';
import { PropertyDetailModal } from './features/properties/PropertyDetailModal';
import type { Property } from './types/property';

export type DashboardType = 'tenant' | 'roommate' | 'shared-living' | 'landlord';

function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    if (window.location.hash) return window.location.hash.replace('#', '');
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? 'dashboard' : 'home';
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Multi-Dashboard support
  const getInitialDashboard = (): DashboardType => {
    const params = new URLSearchParams(window.location.search);
    const dashParam = params.get('dashboard') as DashboardType | null;
    if (dashParam && ['tenant', 'roommate', 'shared-living', 'landlord'].includes(dashParam)) {
      return dashParam;
    }

    const savedUserStr = localStorage.getItem('current_user');
    let parsedRole: string | null = null;
    let parsedIntent: string | null = null;
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        parsedRole = parsed.role;
        parsedIntent = parsed.intent;
      } catch (e) {}
    }

    if (parsedRole === 'LANDLORD') {
      return 'landlord';
    }

    const saved = localStorage.getItem('active_dashboard') as DashboardType | null;
    if (saved && ['tenant', 'roommate', 'shared-living'].includes(saved)) {
      return saved;
    }

    const userIntent = parsedIntent || localStorage.getItem('user_intent');
    if (userIntent === 'roommate') return 'roommate';
    if (userIntent === 'both') return 'shared-living';
    if (userIntent === 'landlord') return 'landlord';
    return 'tenant';
  };

  const [dashboardType, setDashboardType] = useState<DashboardType>(getInitialDashboard);

  // Sync dashboard type with user state
  useEffect(() => {
    if (user) {
      let targetDashboard: DashboardType = 'tenant';
      if (user.role === 'LANDLORD') {
        targetDashboard = 'landlord';
      } else {
        const saved = localStorage.getItem('active_dashboard') as DashboardType | null;
        const intent = (user as any)?.intent || localStorage.getItem('user_intent');
        if (saved && ['tenant', 'roommate', 'shared-living'].includes(saved)) {
          targetDashboard = saved;
        } else if (intent === 'roommate') {
          targetDashboard = 'roommate';
        } else if (intent === 'both') {
          targetDashboard = 'shared-living';
        } else {
          targetDashboard = 'tenant';
        }
      }

      setDashboardType(targetDashboard);
      localStorage.setItem('active_dashboard', targetDashboard);
      if (activeTab === 'home') {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Listen for explicit signup/login redirect events
  useEffect(() => {
    const handleRedirect = (e: Event) => {
      const customEvent = e as CustomEvent<{ dashboard: DashboardType; role?: string }>;
      const target = customEvent.detail?.dashboard;
      if (target && ['tenant', 'roommate', 'shared-living', 'landlord'].includes(target)) {
        setDashboardType(target);
        localStorage.setItem('active_dashboard', target);
        const url = new URL(window.location.href);
        url.searchParams.set('dashboard', target);
        window.history.replaceState({}, '', url.toString());
      }
      setActiveTab('dashboard');
    };

    window.addEventListener('auth:redirect-dashboard', handleRedirect);
    return () => window.removeEventListener('auth:redirect-dashboard', handleRedirect);
  }, []);

  const handleSwitchDashboard = (newType: DashboardType) => {
    setDashboardType(newType);
    localStorage.setItem('active_dashboard', newType);
    const url = new URL(window.location.href);
    url.searchParams.set('dashboard', newType);
    window.history.replaceState({}, '', url.toString());
  };

  // Modals state
  const [showApplications, setShowApplications] = useState(false);
  const [showAgreements, setShowAgreements] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState<number | undefined>(undefined);

  // Sync with window hash changes and query params for modals
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHash);

    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'chat') setShowChat(true);
    if (params.get('modal') === 'applications') setShowApplications(true);
    if (params.get('modal') === 'agreements') setShowAgreements(true);
    if (params.get('property') === '1') {
      setSelectedProperty({
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
      });
    }

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // If user logs in or is already logged in as a tenant, default to dashboard if currently on home
  useEffect(() => {
    if (user && activeTab === 'home') {
      setActiveTab('dashboard');
    }
  }, [user]);

  // If user logs out, immediately return to home and clean up URL
  useEffect(() => {
    if (!user && (activeTab === 'dashboard' || activeTab === 'admin')) {
      setActiveTab('home');
      if (window.location.hash || window.location.search) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleLogout = () => {
      setActiveTab('home');
      if (window.location.hash || window.location.search) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const handleStartChat = (recipientId?: number) => {
    setChatRecipientId(recipientId);
    setShowChat(true);
  };

  // If activeTab is 'dashboard', render the active dedicated dashboard layout
  if (activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {dashboardType === 'roommate' && (
          <RoommateDashboard
            onSwitchDashboard={handleSwitchDashboard}
            onNavigateHome={() => setActiveTab('home')}
            onOpenChatWithUser={handleStartChat}
          />
        )}
        {dashboardType === 'shared-living' && (
          <SharedLivingDashboard
            onSwitchDashboard={handleSwitchDashboard}
            onNavigateHome={() => setActiveTab('home')}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        )}
        {dashboardType === 'landlord' && (
          <LandlordDashboard
            onSwitchDashboard={handleSwitchDashboard}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
        {dashboardType === 'tenant' && (
          <TenantDashboard
            onNavigateTab={setActiveTab}
            onOpenApplications={() => setShowApplications(true)}
            onOpenAgreements={() => setShowAgreements(true)}
            onOpenChat={handleStartChat}
            onOpenMaintenance={() => setActiveTab('maintenance')}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onSwitchDashboard={handleSwitchDashboard}
          />
        )}

        {/* Global Portals & Modals */}
        <AuthModal />
        <TenantOnboardingModal />

        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onToggleFavorite={(id) => {
            console.log('Toggled favorite for', id);
          }}
          isFavorited={false}
          onApply={() => {
            setSelectedProperty(null);
            setShowApplications(true);
          }}
        />

        <ApplicationsManagerModal
          isOpen={showApplications}
          onClose={() => setShowApplications(false)}
          userRole={user?.role}
        />

        <AgreementViewerModal
          isOpen={showAgreements}
          onClose={() => setShowAgreements(false)}
          userRole={user?.role}
        />

        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          initialRecipientId={chatRecipientId}
        />

        <AIAssistantModal
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          userRole={user?.role}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChat={() => setShowChat(true)}
        onOpenAI={() => setShowAI(true)}
        onOpenApplications={() => setShowApplications(true)}
        onOpenAgreements={() => setShowAgreements(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && <LandingPage onNavigateTab={setActiveTab} />}
        {activeTab === 'properties' && <PropertyMarketplace />}
        {activeTab === 'roommates' && <RoommateDiscoveryView onStartChat={handleStartChat} />}
        {activeTab === 'rentals' && <RentLedgerDashboard />}
        {activeTab === 'expenses' && <ExpenseSplittingDashboard />}
        {activeTab === 'maintenance' && <MaintenanceDashboard userRole={user?.role} />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Global Portals & Modals */}
      <AuthModal />
      <TenantOnboardingModal />

      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onToggleFavorite={(id) => {
          console.log('Toggled favorite for', id);
        }}
        isFavorited={false}
        onApply={() => {
          setSelectedProperty(null);
          setShowApplications(true);
        }}
      />

      <ApplicationsManagerModal
        isOpen={showApplications}
        onClose={() => setShowApplications(false)}
        userRole={user?.role}
      />

      <AgreementViewerModal
        isOpen={showAgreements}
        onClose={() => setShowAgreements(false)}
        userRole={user?.role}
      />

      <ChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        initialRecipientId={chatRecipientId}
      />

      <AIAssistantModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        userRole={user?.role}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
