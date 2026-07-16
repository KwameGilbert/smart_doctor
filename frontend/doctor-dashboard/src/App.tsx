import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyOtp } from './pages/VerifyOtp';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Chat } from './pages/Chat';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Navigation tabs: 'dashboard', 'bookings', 'chat'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Auth screen sub-routing: 'login', 'signup', 'verify'
  const [authScreen, setAuthScreen] = useState<'login' | 'signup' | 'verify'>('login');
  const [verifyEmail, setVerifyEmail] = useState<string>('');
  
  // Cross-page navigation details
  const [initialConsultationId, setInitialConsultationId] = useState<string | null>(null);

  const handleNavigateToVerify = (email: string) => {
    setVerifyEmail(email);
    setAuthScreen('verify');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Unauthenticated Routing View
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'signup':
        return (
          <Signup 
            onNavigateToLogin={() => setAuthScreen('login')} 
          />
        );
      case 'verify':
        return (
          <VerifyOtp 
            email={verifyEmail} 
            onNavigateToLogin={() => setAuthScreen('login')}
          />
        );
      case 'login':
      default:
        return (
          <Login 
            onNavigateToSignup={() => setAuthScreen('signup')} 
            onNavigateToVerify={handleNavigateToVerify}
          />
        );
    }
  }

  // 2. Authenticated Dashboard Layout
  const renderTabContent = () => {
    switch (currentTab) {
      case 'bookings':
        return (
          <Bookings 
            onNavigateToChat={(consultationId) => {
              setInitialConsultationId(consultationId);
              setCurrentTab('chat');
            }} 
          />
        );
      case 'chat':
        return (
          <Chat 
            initialConsultationId={initialConsultationId}
            onClearInitialId={() => setInitialConsultationId(null)}
          />
        );
      case 'dashboard':
      default:
        return <Dashboard onNavigateToTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Nav */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header title={currentTab} />
        
        {/* View content panel */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
