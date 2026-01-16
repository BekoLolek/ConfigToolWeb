import { Link } from 'react-router-dom';
import type { Subscription } from '../types';

interface TrialBannerProps {
  subscription: Subscription | null;
}

export default function TrialBanner({ subscription }: TrialBannerProps) {
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
    ? 'bg-red-900/50 border-red-500'
    : isUrgent
    ? 'bg-amber-900/50 border-amber-500'
    : 'bg-cyber-900/50 border-cyber-500';

  const textClass = isCritical
    ? 'text-red-300'
    : isUrgent
    ? 'text-amber-300'
    : 'text-cyber-300';

  const badgeClass = isCritical
    ? 'bg-red-500/20 text-red-300'
    : isUrgent
    ? 'bg-amber-500/20 text-amber-300'
    : 'bg-cyber-500/20 text-cyber-300';

  return (
    <div className={`px-4 py-2 ${bannerClass} border-b flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        {/* Clock icon */}
        <svg className={`w-5 h-5 ${textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <span className={`text-sm font-medium ${textClass}`}>
          Trial period: <span className={`px-2 py-0.5 rounded ${badgeClass} font-mono`}>{timeText}</span>
        </span>
      </div>

      <Link
        to="/settings/billing"
        className="text-sm font-medium text-white bg-cyber-600 hover:bg-cyber-500 px-3 py-1 rounded transition-colors"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
