
import React, { useState, useEffect, Suspense } from 'react';
import Sidebar, { MobileNavbar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal'; 
import { ViewState } from './types';
import { StudyProvider, TimerProvider, useStudy } from './context/StudyContext';
import { Loader2 } from 'lucide-react';

// Lazy Load Components for Performance Optimization
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const NewSession = React.lazy(() => import('./components/NewSession'));
const History = React.lazy(() => import('./components/History'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const Subjects = React.lazy(() => import('./components/Subjects'));
const Tasks = React.lazy(() => import('./components/Tasks'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 size={40} className="animate-spin text-primary opacity-50" />
  </div>
);

function MainContent() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleSettings, setInstallPrompt } = useStudy();

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log("PWA Install Prompt Captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [setInstallPrompt]);

  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    // Do not close mobile menu immediately if switching via bottom nav, 
    // but close it if it was open as a drawer
    setIsMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onChangeView={handleViewChange} />;
      case 'new-session': return <NewSession onChangeView={handleViewChange} />;
      case 'subjects': return <Subjects />;
      case 'tasks': return <Tasks />;
      case 'history': return <History />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard onChangeView={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-800 dark:text-slate-200 font-sans flex relative overflow-x-hidden selection:bg-primary selection:text-white transition-colors duration-300">
      <SettingsModal />

      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        onOpenSettings={toggleSettings} 
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Bottom Navigation */}
      <MobileNavbar 
        currentView={currentView}
        onChangeView={handleViewChange}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      {/* Main Content Area */}
      {/* Added pb-24 to prevent content from being hidden behind the bottom nav on mobile */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300 w-full pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto pt-4 md:pt-0">
          <Suspense fallback={<PageLoader />}>
            {renderView()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <StudyProvider>
      <TimerProvider>
        <MainContent />
      </TimerProvider>
    </StudyProvider>
  );
}

export default App;
