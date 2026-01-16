import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../api/endpoints';

export default function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Don't show if user is verified or banner is dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setError('');
    try {
      await userApi.resendVerification();
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-amber-200 text-sm truncate">
            {sent ? (
              'Verification email sent! Check your inbox.'
            ) : (
              <>
                Please verify your email address.{' '}
                {error && <span className="text-red-400">{error}</span>}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-md transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend Email'}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-400/60 hover:text-amber-400 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
