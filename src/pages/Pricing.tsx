import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/ThemeToggle';
import { PLANS, Plan, PlanDetails, formatPrice, formatLimit, TRIAL_DAYS } from '../data/plans';

// Animated check icon
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Hexagon decoration
function HexDecoration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon
        points="50,2 95,25 95,75 50,98 5,75 5,25"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <polygon
        points="50,15 82,32 82,68 50,85 18,68 18,32"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
}

export default function Pricing() {
  const { user, logout, refreshToken } = useAuthStore();
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan] = useState<Plan | null>(null); // TODO: Get from subscription
  const [hoveredPlan, setHoveredPlan] = useState<Plan | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan === currentPlan) return;
    if (plan === 'ENTERPRISE') {
      // Contact sales
      window.location.href = 'mailto:sales@configtool.dev?subject=Enterprise%20Plan%20Inquiry';
      return;
    }
    // TODO: Navigate to checkout or call billing API
    console.log('Selected plan:', plan);
  };

  const getButtonText = (plan: Plan): string => {
    if (plan === currentPlan) return 'Current Plan';
    if (plan === 'ENTERPRISE') return 'Contact Sales';
    if (!currentPlan) return 'Start Free Trial';
    const planOrder: Plan[] = ['PRO', 'TEAM', 'ENTERPRISE'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(plan);
    return targetIndex > currentIndex ? 'Upgrade' : 'Downgrade';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <HexDecoration className="absolute top-40 right-10 w-32 h-32 text-cyber-500/20" />
        <HexDecoration className="absolute bottom-40 left-10 w-24 h-24 text-cyber-500/20" />
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
              {user ? (
                <>
                  <Link to="/" className="btn btn-ghost text-xs">Dashboard</Link>
                  <button onClick={handleLogout} className="btn btn-ghost text-xs">Logout</button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-500/10 border border-cyber-500/30 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-600 dark:text-cyber-400">
              Pricing Plans
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-wide mb-4">
            Choose Your <span className="text-cyber-500 dark:text-cyber-400">Plan</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Scale your server management with the right tools. All plans include real-time config sync and version history.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2.5 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all ${
                !isYearly
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2.5 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all flex items-center gap-2 ${
                isYearly
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-status-online/20 text-status-online text-2xs rounded-full font-mono">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          {(Object.entries(PLANS) as [Plan, PlanDetails][]).map(([key, plan], index) => {
            const isCurrentPlan = key === currentPlan;
            const isHighlighted = plan.highlighted;
            const isHovered = hoveredPlan === key;
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;

            return (
              <div
                key={key}
                className={`relative group animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredPlan(key)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Highlighted badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 bg-cyber-500 text-white text-xs font-display font-bold uppercase tracking-wider rounded-full shadow-glow-sm">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 z-10">
                    <div className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white text-2xs font-mono uppercase tracking-wider rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse" />
                      Active
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full bg-white dark:bg-slate-900/60 border rounded-xl overflow-hidden transition-all duration-300 ${
                    isHighlighted
                      ? 'border-cyber-500/50 dark:border-cyber-500/50'
                      : isCurrentPlan
                      ? 'border-status-online/50'
                      : 'border-slate-200 dark:border-slate-800'
                  } ${
                    isHovered && !isCurrentPlan
                      ? 'transform -translate-y-1 shadow-xl dark:shadow-glow-sm'
                      : 'shadow-sm dark:shadow-none'
                  }`}
                >
                  {/* Top accent line */}
                  <div
                    className={`h-1 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600'
                        : isCurrentPlan
                        ? 'bg-status-online'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />

                  <div className="p-6">
                    {/* Plan name */}
                    <div className="mb-6">
                      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">
                          {formatPrice(price, isYearly)}
                        </span>
                        {price > 0 && (
                          <span className="text-slate-500 text-sm font-mono">
                            /{isYearly ? 'yr' : 'mo'}
                          </span>
                        )}
                      </div>
                      {isYearly && price > 0 && (
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          ${(price / 100 / 12).toFixed(2)}/mo billed annually
                        </p>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                          Servers
                        </span>
                        <span className="font-display font-bold text-slate-900 dark:text-white">
                          {formatLimit(plan.maxServers)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                          Team Members
                        </span>
                        <span className="font-display font-bold text-slate-900 dark:text-white">
                          {formatLimit(plan.maxMembers)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                          History
                        </span>
                        <span className="font-display font-bold text-slate-900 dark:text-white">
                          {plan.versionRetentionDays === Infinity ? 'Forever' : `${plan.versionRetentionDays} days`}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            isHighlighted
                              ? 'bg-cyber-500/20 text-cyber-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            <CheckIcon className="w-3 h-3" />
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(key)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all ${
                        isCurrentPlan
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : isHighlighted
                          ? 'bg-cyber-600 text-white hover:bg-cyber-500 shadow-glow-sm hover:shadow-glow'
                          : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
                      }`}
                    >
                      {getButtonText(key)}
                    </button>
                  </div>

                  {/* Hover glow effect for highlighted card */}
                  {isHighlighted && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-cyber-500/5 to-transparent" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mb-20">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Feature <span className="text-cyber-500 dark:text-cyber-400">Comparison</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 font-display font-semibold text-sm uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    Feature
                  </th>
                  {(Object.entries(PLANS) as [Plan, PlanDetails][]).map(([key, plan]) => (
                    <th
                      key={key}
                      className={`text-center py-4 px-4 font-display font-semibold text-sm uppercase tracking-wider border-b ${
                        plan.highlighted
                          ? 'text-cyber-500 dark:text-cyber-400 border-cyber-500/30'
                          : 'text-slate-500 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Max Servers', key: 'maxServers' },
                  { label: 'Team Members', key: 'maxMembers' },
                  { label: 'Version Retention', key: 'versionRetentionDays', suffix: ' days' },
                  { label: 'Versions per File', key: 'maxVersionsPerFile' },
                ].map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/30' : ''}>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300 font-mono uppercase tracking-wider">
                      {row.label}
                    </td>
                    {(Object.entries(PLANS) as [Plan, PlanDetails][]).map(([key, plan]) => {
                      const value = plan[row.key as keyof PlanDetails];
                      return (
                        <td key={key} className="text-center py-4 px-4">
                          <span className={`font-display font-bold ${
                            plan.highlighted
                              ? 'text-cyber-500 dark:text-cyber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {typeof value === 'number'
                              ? value === Infinity || value === 2147483647
                                ? row.key === 'versionRetentionDays'
                                  ? 'Forever'
                                  : 'Unlimited'
                                : `${value.toLocaleString()}${row.suffix || ''}`
                              : value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Frequently Asked <span className="text-cyber-500 dark:text-cyber-400">Questions</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Is there a free trial?',
                a: `Yes! All new accounts get a ${TRIAL_DAYS}-day free trial with full access to Team plan features. No credit card required to start.`,
              },
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, the change takes effect at the end of your billing cycle.',
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: 'Your data is safe. However, if you exceed the limits of your new plan (e.g., automation features on Pro), those features will be disabled until you upgrade.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us within 14 days of your purchase for a full refund.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 font-display font-semibold text-slate-900 dark:text-white">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-slate-600 dark:text-slate-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="relative inline-block">
            {/* Corner accents */}
            <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg px-12 py-10">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Ready to level up?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start your {TRIAL_DAYS}-day free trial with full Team features. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login" className="btn btn-primary px-8">
                  Start Free Trial
                </Link>
                <a
                  href="mailto:sales@configtool.dev"
                  className="btn btn-secondary px-8"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-sm font-mono uppercase tracking-wider">
            &copy; {new Date().getFullYear()} ConfigTool. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
