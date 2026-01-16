import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANS, Plan, PlanDetails, formatPrice, formatLimit, TRIAL_DAYS } from '../../data/plans';

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PricingCard({
  planKey,
  plan,
  isYearly,
  index,
}: {
  planKey: Plan;
  plan: PlanDetails;
  isYearly: boolean;
  index: number;
}) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;

  return (
    <div
      className="relative group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-1 bg-cyber-500 text-white text-xs font-display font-bold uppercase tracking-wider rounded-full shadow-glow-sm">
            {plan.badge}
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`relative h-full bg-white dark:bg-slate-900/60 border rounded-xl overflow-hidden transition-all duration-300 ${
          plan.highlighted
            ? 'border-cyber-500/50'
            : 'border-slate-200 dark:border-slate-800'
        } hover:border-cyber-500/50 hover:shadow-lg dark:hover:shadow-glow-sm`}
      >
        {/* Top accent */}
        <div
          className={`h-1 ${
            plan.highlighted
              ? 'bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600'
              : 'bg-slate-200 dark:bg-slate-800'
          }`}
        />

        <div className="p-6">
          {/* Plan name */}
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
            {plan.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {plan.description}
          </p>

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
          <div className="space-y-2 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Servers</span>
              <span className="font-display font-bold text-slate-900 dark:text-white">
                {formatLimit(plan.maxServers)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Collaborators</span>
              <span className="font-display font-bold text-slate-900 dark:text-white">
                {plan.maxMembers === 1 ? 'Solo' : formatLimit(plan.maxMembers)}
              </span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {plan.features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    plan.highlighted
                      ? 'bg-cyber-500/20 text-cyber-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <CheckIcon className="w-3 h-3" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            to="/login"
            className={`block w-full py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wide text-center transition-all ${
              plan.highlighted
                ? 'bg-cyber-600 text-white hover:bg-cyber-500 shadow-glow-sm hover:shadow-glow'
                : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
            }`}
          >
            {planKey === 'ENTERPRISE' ? 'Contact Sales' : 'Start Free Trial'}
          </Link>
        </div>

        {/* Hover glow */}
        {plan.highlighted && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-500/5 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-32 bg-white dark:bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-500/10 border border-cyber-500/30 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-600 dark:text-cyber-400">
              Pricing
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-wide mb-4">
            Simple, Transparent <span className="text-cyber-500 dark:text-cyber-400">Pricing</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Start with a {TRIAL_DAYS}-day free trial. No credit card required.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(Object.entries(PLANS) as [Plan, PlanDetails][]).map(([key, plan], index) => (
            <PricingCard
              key={key}
              planKey={key}
              plan={plan}
              isYearly={isYearly}
              index={index}
            />
          ))}
        </div>

        {/* See all features link */}
        <div className="text-center mt-12">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-cyber-600 dark:text-cyber-400 hover:text-cyber-500 font-display font-semibold text-sm uppercase tracking-wide transition-colors"
          >
            Compare all features
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
