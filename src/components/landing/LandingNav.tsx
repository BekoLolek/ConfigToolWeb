import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import { useAuthStore } from '../../stores/authStore';

interface LandingNavProps {
  onScrollTo: (id: string) => void;
}

export default function LandingNav({ onScrollTo }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Docs', id: 'docs' },
  ];

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded border border-cyber-500/30 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center group-hover:border-cyber-500/60 transition-colors">
              <svg
                className="w-5 h-5 text-cyber-500 dark:text-cyber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-wide text-slate-900 dark:text-white">
              CONFIG<span className="text-cyber-500 dark:text-cyber-400">TOOL</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="px-4 py-2 font-display font-semibold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-cyber-600 dark:hover:text-cyber-400 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="hidden sm:inline-flex btn btn-primary"
            >
              {isAuthenticated ? 'Panel' : 'Get Started'}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="px-4 py-3 font-display font-semibold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-cyber-600 dark:hover:text-cyber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="btn btn-primary mt-2 text-center"
              >
                {isAuthenticated ? 'Panel' : 'Get Started'}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
