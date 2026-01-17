import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function TrialExpiredModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleTrialExpired = () => {
      setIsVisible(true);
    };

    window.addEventListener('trial-expired', handleTrialExpired);
    return () => window.removeEventListener('trial-expired', handleTrialExpired);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header with warning icon */}
        <div className="bg-red-900/30 border-b border-red-800/50 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-full">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Trial Expired</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-slate-300 mb-4">
            Your 7-day trial has expired. To continue using ConfigTool and access your servers,
            please subscribe to one of our plans.
          </p>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-slate-400 mb-2">What happens now?</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>API access is locked</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your data is safe and will be restored when you subscribe</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>You can still access billing to subscribe</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
          <Link
            to="/pricing"
            className="px-4 py-2 text-sm font-medium text-white bg-cyber-600 hover:bg-cyber-500 rounded transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
