import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart2, 
  Settings, 
  Target,
  BookMarked,
  Download,
  ListTodo,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { ViewState } from '../types';
import { useStudy } from '../context/StudyContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

// --- Desktop & Drawer Sidebar ---
const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onOpenSettings, isMobileOpen = false, onCloseMobile }) => {
  const { settings } = useStudy();
  
  const menuItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'new-session', label: 'Yeni Çalışma', icon: PlusCircle },
    { id: 'tasks', label: 'Görevler', icon: ListTodo },
    { id: 'subjects', label: 'Dersler', icon: BookMarked }, 
    { id: 'history', label: 'Geçmiş', icon: History },
    { id: 'analytics', label: 'Analizler', icon: BarChart2 },
  ];

  const handleNavClick = (id: string) => {
    onChangeView(id as ViewState);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
            onClick={onCloseMobile}
        ></div>
      )}

      {/* Main Sidebar (Acts as Drawer on Mobile) */}
      <div className={`
        fixed left-0 top-0 h-full w-64 glass flex-col z-[70] transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'} 
        md:flex md:translate-x-0
        border-r border-white/20 dark:border-white/5
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Target className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">StudyFlow</span>
          </div>
          {/* Close Button for Mobile Drawer */}
          <button onClick={onCloseMobile} className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'text-white shadow-lg shadow-primary/30 translate-x-1' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'
                }`}
              >
                {isActive && (
                    <div className="absolute inset-0 bg-primary opacity-100 z-[-1]"></div>
                )}
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
             <button 
                  onClick={() => { onOpenSettings(); if(onCloseMobile) onCloseMobile(); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all hover:translate-x-1"
              >
                <Settings size={20} className="hover:animate-spin" style={{animationDuration: '3s'}} />
                <span className="font-medium">Ayarlar</span>
              </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center space-x-3 border border-slate-200/50 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={onOpenSettings}>
             <img 
                 src={`https://ui-avatars.com/api/?name=${encodeURIComponent(settings.userName || 'U')}&background=3b82f6&color=fff`}
                 alt="Profile" 
                 className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
             />
             <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{settings.userName || 'Misafir'}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{settings.userTitle || 'Öğrenci'}</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Mobile Bottom Navigation ---
interface MobileNavbarProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    onToggleMobileMenu: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ currentView, onChangeView, onToggleMobileMenu }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-50 md:hidden pb-safe">
            
            {/* 1. Panel */}
            <NavButton 
                active={currentView === 'dashboard'} 
                onClick={() => onChangeView('dashboard')} 
                icon={LayoutDashboard} 
                label="Panel" 
            />

            {/* 2. Tasks */}
            <NavButton 
                active={currentView === 'tasks'} 
                onClick={() => onChangeView('tasks')} 
                icon={ListTodo} 
                label="Görevler" 
            />

            {/* 3. New Session (Central FAB) */}
            <div className="relative -top-6">
                <button 
                    onClick={() => onChangeView('new-session')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${
                        currentView === 'new-session' 
                        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 ring-4 ring-slate-100 dark:ring-slate-800' 
                        : 'bg-primary text-white ring-4 ring-slate-50 dark:ring-slate-900 shadow-primary/40'
                    }`}
                >
                    <PlusCircle size={32} />
                </button>
            </div>

            {/* 4. History */}
            <NavButton 
                active={currentView === 'history'} 
                onClick={() => onChangeView('history')} 
                icon={History} 
                label="Geçmiş" 
            />

            {/* 5. Menu (Opens Drawer) */}
            <button 
                onClick={onToggleMobileMenu}
                className="flex flex-col items-center justify-center w-16 space-y-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <MenuIcon size={22} />
                <span className="text-[10px] font-medium">Menü</span>
            </button>

        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 space-y-1 transition-colors ${
            active 
            ? 'text-primary' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
    >
        <Icon size={22} className={active ? 'animate-pulse' : ''} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default Sidebar;