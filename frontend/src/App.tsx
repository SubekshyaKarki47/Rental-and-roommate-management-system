import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { TenantOnboardingModal } from './components/auth/TenantOnboardingModal';

// Feature Components
import { RoommateDiscoveryView } from './features/roommates/RoommateDiscoveryView';
import { RentLedgerDashboard } from './features/rentals/RentLedgerDashboard';
import { ExpenseSplittingDashboard } from './features/expenses/ExpenseSplittingDashboard';
import { MaintenanceDashboard } from './features/maintenance/MaintenanceDashboard';
import { AdminDashboard } from './features/moderation/AdminDashboard';

// Modals & Drawers
import { ApplicationsManagerModal } from './features/applications/ApplicationsManagerModal';
import { AgreementViewerModal } from './features/agreements/AgreementViewerModal';
import { ChatDrawer } from './features/messaging/ChatDrawer';
import { AIAssistantModal } from './features/ai/AIAssistantModal';

import { PropertyMarketplace } from './features/properties/PropertyMarketplace';

function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals state
  const [showApplications, setShowApplications] = useState(false);
  const [showAgreements, setShowAgreements] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState<number | undefined>(undefined);

  const handleStartChat = (recipientId: number) => {
    setChatRecipientId(recipientId);
    setShowChat(true);
  };

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
