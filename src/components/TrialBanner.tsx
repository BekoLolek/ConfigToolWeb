import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBillingStore } from '../stores/billingStore';

export default function TrialBanner() {
  const { subscription, fetchSubscription } = useBillingStore();

  // Fetch subscription on mount if not already loaded
  useEffect(() => {
    if (!subscription) {
      fetchSubscription();
    }
  }, [subscription, fetchSubscription]);

  // Don't show if no subscription or not trialing
  if (!subscription || !subscription.isTrialing) {
    return null;
  }

  const daysRemaining = subscription.trialDaysRemaining ?? 0;
  const hoursRemaining = subscription.trialHoursRemaining ?? 0;

  // Determine urgency based on time remaining
  const isUrgent = hoursRemaining <= 24;
  const isCritical = hoursRemaining <= 6;

  // Format time remaining
  let timeText: string;
  if (daysRemaining >= 1) {
    timeText = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
  } else if (hoursRemaining >= 1) {
    timeText = `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} left`;
  } else {
    timeText = 'Less than 1 hour left';
  }

  // Choose colors based on urgency
  const bannerClass = isCritical
    ? 'bg-red-900/50 border-red-500/50'
    : isUrgent
    ? 'bg-amber-900/50 border-amber-500/50'
    : 'bg-cyber-900/30 border-cyber-500/30';

  const textClass = isCritical
    ? 'text-red-300'
    : isUrgent
    ? 'text-amber-300'
    : 'text-cyber-300';

  const badgeClass = isCritical
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : isUrgent
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-cyber-500/20 text-cyber-300 border-cyber-500/30';

  const buttonClass = isCritical
    ? 'bg-red-600 hover:bg-red-500'
    : isUrgent
    ? 'bg-amber-600 hover:bg-amber-500'
    : 'bg-cyber-600 hover:bg-cyber-500';

  return (
    <div className={`px-4 py-2.5 ${bannerClass} border-b flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        {/* Clock icon with animation for urgent states */}
        <div className={isCritical || isUrgent ? 'animate-pulse' : ''}>
          <svg className={`w-5 h-5 ${textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span className={`text-sm font-medium ${textClass}`}>
          <span className="hidden sm:inline">Free trial: </span>
          <span className={`px-2 py-0.5 rounded border ${badgeClass} font-mono text-xs`}>
            {timeText}
          </span>
        </span>

        {isCritical && (
          <span className="hidden md:inline text-xs text-red-400">
            Subscribe now to avoid service interruption
          </span>
        )}
      </div>

      <Link
        to="/pricing"
        className={`text-sm font-display font-semibold uppercase tracking-wide text-white ${buttonClass} px-4 py-1.5 rounded transition-colors`}
      >
        Subscribe
      </Link>
    </div>
  );
}
