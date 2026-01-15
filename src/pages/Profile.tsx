import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../api/endpoints';
import ThemeToggle from '../components/ThemeToggle';

// Password validation
interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  matches: boolean;
}

function validatePassword(password: string, confirmPassword: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    matches: password === confirmPassword && password.length > 0,
  };
}

// Generate avatar from email
function generateAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Format date helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

// Hex decoration component
function HexPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon
        points="50,5 90,25 90,75 50,95 10,75 10,25"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
      <polygon
        points="50,20 75,35 75,65 50,80 25,65 25,35"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
}

// Scan line effect overlay
function ScanLineOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-500/10 to-transparent"
        style={{
          height: '200%',
          animation: 'scan 4s linear infinite',
        }}
      />
    </div>
  );
}

// Validation indicator component
function ValidationIndicator({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
        valid
          ? 'bg-status-online shadow-[0_0_6px_theme(colors.status.online)]'
          : 'bg-slate-500 dark:bg-slate-600'
      }`} />
      <span className={`text-2xs font-mono uppercase tracking-wider transition-colors ${
        valid ? 'text-status-online' : 'text-slate-500 dark:text-slate-600'
      }`}>
        {label}
      </span>
    </div>
  );
}

// Password strength meter
function PasswordStrengthMeter({ validation }: { validation: PasswordValidation }) {
  const passed = Object.values(validation).filter(Boolean).length - (validation.matches ? 1 : 0);
  const total = 4;
  const percentage = (passed / total) * 100;

  let color = 'bg-status-error';
  if (percentage >= 75) color = 'bg-status-online';
  else if (percentage >= 50) color = 'bg-status-warning';

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600">
          Password Strength
        </span>
        <span className={`text-2xs font-mono uppercase tracking-wider ${
          percentage >= 75 ? 'text-status-online' : percentage >= 50 ? 'text-status-warning' : 'text-status-error'
        }`}>
          {percentage >= 75 ? 'Strong' : percentage >= 50 ? 'Medium' : 'Weak'}
        </span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(percentage, 5)}%` }}
        />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    matches: false,
  });

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Animation states
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update password validation on change
  useEffect(() => {
    setPasswordValidation(validatePassword(newPassword, confirmPassword));
  }, [newPassword, confirmPassword]);

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate all requirements
    const validation = validatePassword(newPassword, confirmPassword);
    if (!Object.values(validation).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await userApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const avatarColor = user?.email ? generateAvatarColor(user.email) : '#525c73';
  const initials = user?.email ? getInitials(user.email) : '??';

  // Check if password form is valid
  const isPasswordFormValid =
    currentPassword.length > 0 &&
    Object.values(passwordValidation).every(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -left-32 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-32 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <HexPattern className="absolute top-60 right-20 w-40 h-40 text-cyber-500/20 hidden lg:block" />
        <HexPattern className="absolute bottom-40 left-20 w-32 h-32 text-cyber-500/20 hidden lg:block" />
        <HexPattern className="absolute top-1/3 left-1/4 w-24 h-24 text-slate-500/10 hidden lg:block" />
      </div>

      {/* Navigation */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-cyber-500/30 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-500 dark:text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-slate-900 dark:text-white">
                CONFIG<span className="text-cyber-500 dark:text-cyber-400">TOOL</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/" className="btn btn-ghost text-xs">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-ghost text-xs">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              User Profile
            </h1>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider ml-8">
            Account Settings & Security
          </p>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div
            className={`mb-6 p-4 rounded-lg border animate-fade-in ${
              error
                ? 'bg-status-error/10 border-status-error/30 text-status-error'
                : 'bg-status-online/10 border-status-online/30 text-status-online'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {error ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className="font-mono text-sm">{error || success}</span>
              <button
                onClick={() => { setError(null); setSuccess(null); }}
                className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div
          className={`relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {/* Top gradient stripe */}
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyber-500/50" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyber-500/50" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-xl flex items-center justify-center text-white font-display text-3xl font-bold shadow-lg transition-transform group-hover:scale-105"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity blur-xl"
                  style={{ backgroundColor: avatarColor }}
                />
                {/* Status ring */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${
                    user?.emailVerified
                      ? 'bg-status-online shadow-[0_0_8px_theme(colors.status.online)]'
                      : 'bg-status-warning shadow-[0_0_8px_theme(colors.status.warning)]'
                  }`} />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {user?.email?.split('@')[0] || 'User'}
                  </h2>
                  {user?.emailVerified && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-online/10 border border-status-online/30 rounded-full">
                      <svg className="w-3.5 h-3.5 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-2xs font-mono uppercase tracking-wider text-status-online">Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mb-3">
                  {user?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                      Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                    {user?.createdAt ? formatRelativeDate(user.createdAt) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div
          className={`relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Scan line effect (dark mode only) */}
          <div className="hidden dark:block">
            <ScanLineOverlay />
          </div>

          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse" />
              <span>Account Settings</span>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="p-6">
            {/* Email Display */}
            <div className="mb-8">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 font-mono text-slate-900 dark:text-white">{user?.email}</span>
                <div className="flex items-center gap-2">
                  <div className={`status-led ${user?.emailVerified ? 'status-led-online' : 'status-led-warning'}`} />
                  <span className={`text-2xs font-mono uppercase tracking-wider ${
                    user?.emailVerified ? 'text-status-online' : 'text-status-warning'
                  }`}>
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Change Password
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {newPassword.length > 0 && (
                    <PasswordStrengthMeter validation={passwordValidation} />
                  )}

                  {/* Validation requirements */}
                  {newPassword.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <ValidationIndicator valid={passwordValidation.minLength} label="8+ Characters" />
                      <ValidationIndicator valid={passwordValidation.hasUppercase} label="Uppercase" />
                      <ValidationIndicator valid={passwordValidation.hasLowercase} label="Lowercase" />
                      <ValidationIndicator valid={passwordValidation.hasNumber} label="Number" />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`input pr-12 ${
                        confirmPassword.length > 0 && !passwordValidation.matches
                          ? 'border-status-error focus:border-status-error focus:ring-status-error/50'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordValidation.matches && (
                    <p className="mt-2 text-2xs font-mono uppercase tracking-wider text-status-error">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isPasswordFormValid || isLoading}
                    className="btn btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Organization Section */}
        <div
          className={`relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyber-500" />
              <span>Organization</span>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                  Default Organization
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-500 to-cyber-700 flex items-center justify-center text-white font-display font-bold">
                    P
                  </div>
                  <div>
                    <p className="font-display font-semibold text-slate-900 dark:text-white">Personal</p>
                    <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600">
                      Free Plan
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/billing"
                className="btn btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div
          className={`relative bg-white dark:bg-slate-900/60 border border-status-error/30 rounded-xl overflow-hidden transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Warning stripe */}
          <div className="h-1 bg-gradient-to-r from-status-error via-status-error/70 to-status-error" />

          <div className="panel-header flex items-center justify-between border-status-error/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-error animate-pulse" />
              <span className="text-status-error">Danger Zone</span>
            </div>
            <svg className="w-5 h-5 text-status-error/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="relative w-full max-w-md animate-slide-up">
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-status-error" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-status-error" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-status-error" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-status-error" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden">
              <div className="h-1 bg-status-error" />

              <div className="p-6">
                {/* Warning Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                  Delete Your Account?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">
                  This will permanently delete your account, all servers, configurations, and version history.
                  This action is <span className="text-status-error font-semibold">irreversible</span>.
                </p>

                {/* Confirmation input */}
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600 mb-2">
                    Type <span className="text-status-error font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={e => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="input text-center font-mono uppercase tracking-widest"
                    autoFocus
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    className="flex-1 btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete Forever'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
