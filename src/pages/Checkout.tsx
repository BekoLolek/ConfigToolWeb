import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useBillingStore } from '../stores/billingStore';
import CardInput from '../components/CardInput';
import { StripeProvider } from '../providers/StripeProvider';
import { PLANS, Plan, formatPrice } from '../data/plans';

// Hexagon decoration for visual interest
function HexPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon
        points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
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

// Animated scanning line effect
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-500/50 to-transparent animate-scan" />
    </div>
  );
}

// Feature check item
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      <div className="w-4 h-4 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-2.5 h-2.5 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {children}
    </li>
  );
}

// Payment method card
function PaymentMethodOption({
  method,
  selected,
  onSelect,
}: {
  method: { id: string; cardBrand: string; cardLast4: string; cardExpMonth: number; cardExpYear: number; isDefault: boolean };
  selected: boolean;
  onSelect: () => void;
}) {
  const brandColors: Record<string, string> = {
    visa: 'text-blue-500',
    mastercard: 'text-orange-500',
    amex: 'text-cyan-500',
    discover: 'text-amber-500',
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
        selected
          ? 'border-cyber-500 bg-cyber-500/5 dark:bg-cyber-500/10'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-7 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center ${brandColors[method.cardBrand.toLowerCase()] || 'text-slate-500'}`}>
          <span className="text-2xs font-mono font-bold uppercase">
            {method.cardBrand.slice(0, 4)}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-mono text-slate-900 dark:text-white text-sm">
            •••• {method.cardLast4}
          </p>
          <p className="text-xs text-slate-500">
            Expires {method.cardExpMonth.toString().padStart(2, '0')}/{method.cardExpYear}
          </p>
        </div>
        {method.isDefault && (
          <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30 rounded">
            Default
          </span>
        )}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected
            ? 'border-cyber-500 bg-cyber-500'
            : 'border-slate-300 dark:border-slate-600'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function CheckoutContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planKey = (searchParams.get('plan') || 'TEAM') as Plan;
  const billingCycle = (searchParams.get('billing') || 'monthly') as 'monthly' | 'yearly';

  const {
    subscription,
    paymentMethods,
    loadingSubscription,
    loadingPaymentMethods,
    error,
    fetchPaymentMethods,
    fetchSubscription,
    createSubscription,
    addPaymentMethod,
    clearError,
  } = useBillingStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchPaymentMethods();
    fetchSubscription();
  }, [fetchPaymentMethods, fetchSubscription]);

  // Auto-select default payment method
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod && !useNewCard) {
      const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [paymentMethods, selectedPaymentMethod, useNewCard]);

  // Get plan details
  const plan = PLANS[planKey];
  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Invalid Plan
          </h1>
          <p className="text-slate-500 mb-6">The requested plan does not exist.</p>
          <Link to="/pricing" className="btn btn-primary">
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;

  // Handle checkout with existing payment method
  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setLocalError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setLocalError(null);
    clearError();

    try {
      await createSubscription(planKey, selectedPaymentMethod, billingCycle);
      navigate('/billing?success=true');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle new card submission
  const handleNewCard = async (paymentMethodId: string) => {
    setIsProcessing(true);
    setLocalError(null);
    clearError();

    try {
      // Add the payment method first
      await addPaymentMethod(paymentMethodId, true);
      // Then create the subscription
      await createSubscription(planKey, paymentMethodId, billingCycle);
      navigate('/billing?success=true');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <HexPattern className="absolute top-40 right-20 w-32 h-32 text-cyber-500/20" />
        <HexPattern className="absolute bottom-60 left-20 w-24 h-24 text-cyber-500/20" />
      </div>

      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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

            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-slate-500 font-mono text-xs uppercase tracking-wider">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Back link */}
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to plans
        </Link>

        {/* Error banner */}
        {displayError && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-status-error text-sm">{displayError}</p>
            </div>
            <button
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              className="text-status-error hover:text-status-error/80"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment section */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="relative">
              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500/50" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500/50" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500/50" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500/50" />

              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

                <div className="p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Payment Method
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Select a payment method or add a new card
                  </p>

                  {/* Existing payment methods */}
                  {loadingPaymentMethods ? (
                    <div className="space-y-3 mb-6">
                      <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </div>
                  ) : paymentMethods.length > 0 && !useNewCard ? (
                    <div className="space-y-3 mb-6">
                      {paymentMethods.map((method) => (
                        <PaymentMethodOption
                          key={method.id}
                          method={method}
                          selected={selectedPaymentMethod === method.id}
                          onSelect={() => setSelectedPaymentMethod(method.id)}
                        />
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setUseNewCard(true);
                          setSelectedPaymentMethod(null);
                        }}
                        className="w-full p-4 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cyber-500/50 dark:hover:border-cyber-500/50 transition-colors text-slate-500 hover:text-cyber-500 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium text-sm">Add new card</span>
                      </button>
                    </div>
                  ) : null}

                  {/* New card form */}
                  {(useNewCard || paymentMethods.length === 0) && !loadingPaymentMethods && (
                    <div className="mb-6">
                      {paymentMethods.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseNewCard(false);
                            const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
                            setSelectedPaymentMethod(defaultMethod.id);
                          }}
                          className="text-sm text-cyber-500 hover:text-cyber-400 mb-4 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Use existing card
                        </button>
                      )}

                      <CardInput
                        onPaymentMethodCreated={handleNewCard}
                        onError={(err) => setLocalError(err)}
                        loading={isProcessing}
                        buttonText={`Pay ${formatPrice(price, billingCycle === 'yearly')}`}
                      />
                    </div>
                  )}

                  {/* Pay button for existing card */}
                  {!useNewCard && paymentMethods.length > 0 && (
                    <button
                      onClick={handleCheckout}
                      disabled={!selectedPaymentMethod || isProcessing || loadingSubscription}
                      className={`w-full py-4 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all ${
                        !selectedPaymentMethod || isProcessing || loadingSubscription
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-cyber-600 text-white hover:bg-cyber-500 shadow-glow-sm hover:shadow-glow'
                      }`}
                    >
                      {isProcessing || loadingSubscription ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Pay ${formatPrice(price, billingCycle === 'yearly')}`
                      )}
                    </button>
                  )}

                  {/* Security badges */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-6 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs font-mono uppercase tracking-wider">SSL Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                        </svg>
                        <span className="text-xs font-mono uppercase tracking-wider">Stripe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="relative">
                <ScanLine />

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Order Summary</span>
                      <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30 rounded">
                        {billingCycle}
                      </span>
                    </div>

                    {/* Plan details */}
                    <div className="mb-6">
                      <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {plan.name} Plan
                      </h3>
                      <p className="text-slate-500 text-sm">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                      <FeatureItem>Up to {plan.maxServers === Infinity ? 'unlimited' : plan.maxServers} servers</FeatureItem>
                      <FeatureItem>{plan.maxMembers === Infinity ? 'Unlimited' : plan.maxMembers} team members</FeatureItem>
                      <FeatureItem>{plan.versionRetentionDays === Infinity ? 'Unlimited' : `${plan.versionRetentionDays} days`} version history</FeatureItem>
                      <FeatureItem>All {plan.name} features included</FeatureItem>
                    </ul>

                    {/* Pricing breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {plan.name} ({billingCycle})
                        </span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {formatPrice(price, billingCycle === 'yearly')}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="flex items-center justify-between text-status-online">
                          <span className="text-sm">Annual discount (20%)</span>
                          <span className="font-mono">
                            -{formatPrice(Math.round(plan.priceMonthly * 12 - price), true)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-semibold text-slate-900 dark:text-white">
                          Total
                        </span>
                        <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                          {formatPrice(price, billingCycle === 'yearly')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 text-right">
                        {billingCycle === 'yearly'
                          ? `$${(monthlyEquivalent / 100).toFixed(2)}/mo billed annually`
                          : 'Billed monthly'}
                      </p>
                    </div>

                    {/* Upgrade info */}
                    {subscription && subscription.plan !== 'FREE' && subscription.plan !== planKey && (
                      <div className="mt-4 p-3 bg-cyber-500/10 border border-cyber-500/30 rounded-lg">
                        <p className="text-xs text-cyber-600 dark:text-cyber-400">
                          <strong>Plan Change:</strong> You'll be charged the prorated difference. Your new plan features will be available immediately.
                        </p>
                      </div>
                    )}

                    {/* Money-back guarantee */}
                    <div className="mt-6 text-center">
                      <p className="text-xs text-slate-500">
                        14-day money-back guarantee
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap with StripeProvider
export default function Checkout() {
  return (
    <StripeProvider>
      <CheckoutContent />
    </StripeProvider>
  );
}
