import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBillingStore } from '../stores/billingStore';
import ThemeToggle from './ThemeToggle';
import EmailVerificationBanner from './EmailVerificationBanner';
import TrialBanner from './TrialBanner';
import TrialExpiredModal from './TrialExpiredModal';
import clsx from 'clsx';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        ),
      },
      {
        label: 'Templates',
        path: '/templates',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        ),
      },
      {
        label: 'Marketplace',
        path: '/marketplace',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Billing',
        path: '/billing',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
      {
        label: 'API Keys',
        path: '/api-keys',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        ),
      },
      {
        label: 'Webhooks',
        path: '/webhooks',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        label: 'Backups',
        path: '/scheduled-backups',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Git Sync',
        path: '/git-configs',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      },
    ],
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshToken } = useAuthStore();
  const { subscription, fetchSubscription } = useBillingStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch subscription on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Dispatch trial-expired event when subscription status changes to TRIAL_EXPIRED
  useEffect(() => {
    if (subscription?.status === 'TRIAL_EXPIRED') {
      window.dispatchEvent(new CustomEvent('trial-expired'));
    }
  }, [subscription?.status]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link
        to="/"
        className={clsx(
          'flex items-center gap-3 h-16 border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors',
          sidebarOpen ? 'px-4' : 'justify-center'
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-lg border border-cyber-500/30 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyber-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        </div>
        {sidebarOpen && (
          <span className="font-display text-lg font-bold tracking-wide text-slate-900 dark:text-white whitespace-nowrap">
            CONFIG<span className="text-cyber-500">TOOL</span>
          </span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section title - transforms to line when collapsed */}
            {section.title && (
              <div className="relative h-5 mb-2 mx-1">
                <h3 className={clsx(
                  'absolute inset-0 flex items-center px-2 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 transition-all duration-300',
                  sidebarOpen ? 'opacity-100' : 'opacity-0'
                )}>
                  {section.title}
                </h3>
                <div className={clsx(
                  'absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700 transition-all duration-300',
                  sidebarOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                )} />
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={clsx(
                        'group flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200',
                        sidebarOpen ? 'px-3' : 'justify-center px-2',
                        active
                          ? 'bg-cyber-500/10 text-cyber-600 dark:text-cyber-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <span className={clsx(
                        'flex-shrink-0 transition-colors',
                        active ? 'text-cyber-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <>
                          <span className="font-medium text-sm whitespace-nowrap">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="ml-auto px-2 py-0.5 text-2xs font-mono font-semibold bg-cyber-500/20 text-cyber-600 dark:text-cyber-400 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-200 dark:border-slate-800/50 p-3 space-y-2">
        {/* Theme toggle */}
        <div className={clsx(
          'flex items-center gap-3 py-2 rounded-lg',
          sidebarOpen ? 'px-3' : 'justify-center'
        )}>
          <ThemeToggle />
          {sidebarOpen && (
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Theme
            </span>
          )}
        </div>

        {/* User section */}
        <Link
          to="/profile"
          className={clsx(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800/50',
            !sidebarOpen && 'justify-center'
          )}
          title={!sidebarOpen ? user?.email : undefined}
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-online rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate whitespace-nowrap">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-2xs text-slate-500 truncate font-mono uppercase tracking-wider whitespace-nowrap">
                Active
              </p>
            </div>
          )}
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={clsx(
            'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-500 hover:text-red-500 hover:bg-red-500/10',
            !sidebarOpen && 'justify-center'
          )}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {sidebarOpen && (
            <span className="text-sm font-medium whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex items-center justify-center h-10 border-t border-slate-200 dark:border-slate-800/50 text-cyber-500 dark:text-cyber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 drop-shadow-[0_0_3px_rgba(6,182,212,0.5)] hover:drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid flex flex-col">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg"
      >
        <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - width-based collapse keeps icons centered */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-[72px]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main
        className={clsx(
          'transition-all duration-300 ease-in-out h-screen flex flex-col',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]'
        )}
      >
        <EmailVerificationBanner />
        <TrialBanner />
        {children}
      </main>

      {/* Trial Expired Modal - shown when trial has ended */}
      <TrialExpiredModal />
    </div>
  );
}
