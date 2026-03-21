import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Memoized navigation item component - reads location internally
const NavigationItem = memo(({ item, onNavigate }: {
  item: { name: string; path: string; icon: React.ReactNode };
  onNavigate: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={`
        group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden
        ${isActive
          ? 'bg-white/5 text-white shadow-[0_0_20px_rgba(34,211,238,0.1)] border border-white/10'
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'
        }
      `}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50"></div>
      )}

      <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
        {item.icon}
      </span>
      <span className="relative z-10 font-medium">{item.name}</span>

      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Memoized sidebar content component with custom comparison
const SidebarContent = memo(({
  navigation,
  companyName,
  companyEmail,
  companyPlan,
  companyQuota,
  onLogout,
  onMobileMenuClose
}: {
  navigation: Array<{ name: string; path: string; icon: React.ReactNode }>;
  companyName: string | null;
  companyEmail: string | null;
  companyPlan: string | null;
  companyQuota: number | null;
  onLogout: () => void;
  onMobileMenuClose: () => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] border-r border-white/10">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl">P</span>
          </div>
          <div>
            <span className="block text-lg font-black text-white tracking-tight leading-none group-hover:text-cyan-400 transition-colors">COGNIVIA</span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">DASHBOARD</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Ana Menü</p>
        {navigation.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            onNavigate={onMobileMenuClose}
          />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5 bg-[#020617]/30">
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-white/10">
              {companyName ? companyName.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {companyName || 'Kullanıcı'}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {companyEmail || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-4 px-1 bg-black/20 py-2 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="text-slate-500 mb-0.5">Plan</span>
              <span className="font-bold text-cyan-400">{companyPlan ? companyPlan.toUpperCase() : '-'}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 mb-0.5">Kredi</span>
              <span className="font-bold text-white">{companyQuota ?? '-'}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if company data or handlers changed
  // Note: currentPath is read inside via useLocation, so it doesn't trigger re-render
  return (
    prevProps.companyName === nextProps.companyName &&
    prevProps.companyEmail === nextProps.companyEmail &&
    prevProps.companyPlan === nextProps.companyPlan &&
    prevProps.companyQuota === nextProps.companyQuota &&
    prevProps.navigation === nextProps.navigation &&
    prevProps.onLogout === nextProps.onLogout &&
    prevProps.onMobileMenuClose === nextProps.onMobileMenuClose
  );
});

SidebarContent.displayName = 'SidebarContent';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Extract company values to prevent unnecessary re-renders
  const companyName = company?.company_name || null;
  const companyEmail = company?.email || null;
  const companyPlan = company?.plan || null;
  const companyQuota = company?.quota_remaining ?? null;

  // Memoize navigation array - only recreate if needed
  const navigation = useMemo(() => [
    {
      name: 'Genel Bakış', path: '/dashboard', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Mülakatlar', path: '/dashboard/sessions', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Ayarlar', path: '/dashboard/settings', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ], []);

  return (
    <div className="h-screen bg-[#020617] flex font-sans text-sm overflow-hidden text-slate-300 selection:bg-cyan-500 selection:text-black">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* Desktop Sidebar - Always render to prevent layout shift, CSS handles visibility */}
      <aside className="hidden lg:block w-72 flex-shrink-0 z-20 h-screen relative">
        <SidebarContent
          navigation={navigation}
          companyName={companyName}
          companyEmail={companyEmail}
          companyPlan={companyPlan}
          companyQuota={companyQuota}
          onLogout={handleLogout}
          onMobileMenuClose={handleMobileMenuClose}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent
          navigation={navigation}
          companyName={companyName}
          companyEmail={companyEmail}
          companyPlan={companyPlan}
          companyQuota={companyQuota}
          onLogout={handleLogout}
          onMobileMenuClose={handleMobileMenuClose}
        />
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 px-4 flex items-center justify-between border-b border-white/10 bg-[#0a0f1e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
            <span className="font-bold text-white">COGNIVIA AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
