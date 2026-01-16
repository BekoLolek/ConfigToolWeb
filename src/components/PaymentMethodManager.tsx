import { useState } from 'react';
import CardInput from './CardInput';
import { StripeProvider } from '../providers/StripeProvider';

interface PaymentMethod {
  id: string;
  type: string;
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  isDefault: boolean;
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (paymentMethodId: string, setAsDefault: boolean) => Promise<void>;
  onRemovePaymentMethod: (id: string) => Promise<void>;
  onSetDefaultPaymentMethod: (id: string) => Promise<void>;
  loading?: boolean;
}

const CARD_BRANDS: Record<string, { name: string; color: string }> = {
  visa: { name: 'Visa', color: 'text-blue-500' },
  mastercard: { name: 'Mastercard', color: 'text-orange-500' },
  amex: { name: 'Amex', color: 'text-cyan-500' },
  discover: { name: 'Discover', color: 'text-amber-500' },
  diners: { name: 'Diners', color: 'text-slate-500' },
  jcb: { name: 'JCB', color: 'text-green-500' },
  unionpay: { name: 'UnionPay', color: 'text-red-500' },
};

function CardBrandLogo({ brand }: { brand: string }) {
  const brandInfo = CARD_BRANDS[brand.toLowerCase()] || { name: brand, color: 'text-slate-500' };

  return (
    <div className={`w-12 h-8 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center ${brandInfo.color}`}>
      <span className="text-xs font-bold uppercase tracking-wider">
        {brandInfo.name.slice(0, 4)}
      </span>
    </div>
  );
}

export default function PaymentMethodManager({
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
  loading = false,
}: PaymentMethodManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    setRemovingId(id);
    try {
      await onRemovePaymentMethod(id);
    } finally {
      setRemovingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      await onSetDefaultPaymentMethod(id);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleAddCard = async (paymentMethodId: string) => {
    setAddingCard(true);
    setAddError(null);
    try {
      await onAddPaymentMethod(paymentMethodId, setAsDefault);
      setShowAddModal(false);
      setSetAsDefault(true);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setAddingCard(false);
    }
  };

  const handleOpenModal = () => {
    setShowAddModal(true);
    setAddError(null);
    setSetAsDefault(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setAddError(null);
  };

  const isExpiringSoon = (month: number, year: number) => {
    const now = new Date();
    const expiry = new Date(year, month - 1); // month is 1-indexed
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  const isExpired = (month: number, year: number) => {
    const now = new Date();
    const expiry = new Date(year, month); // end of expiry month
    return expiry < now;
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Payment Methods
          </h2>
          <p className="text-sm text-slate-500">
            Manage your saved payment methods
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Card
        </button>
      </div>

      {/* Payment methods list */}
      {paymentMethods.length > 0 ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {paymentMethods.map((method) => {
            const expired = isExpired(method.cardExpMonth, method.cardExpYear);
            const expiringSoon = !expired && isExpiringSoon(method.cardExpMonth, method.cardExpYear);

            return (
              <div
                key={method.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  expired ? 'bg-status-error/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <CardBrandLogo brand={method.cardBrand} />

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-900 dark:text-white">
                        •••• •••• •••• {method.cardLast4}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30 rounded">
                          Default
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-status-error/10 text-status-error border border-status-error/30 rounded">
                          Expired
                        </span>
                      )}
                      {expiringSoon && (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-status-warning/10 text-status-warning border border-status-warning/30 rounded">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${expired ? 'text-status-error' : 'text-slate-500'}`}>
                      Expires {method.cardExpMonth.toString().padStart(2, '0')}/{method.cardExpYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && !expired && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      disabled={settingDefaultId === method.id}
                      className="px-3 py-1.5 text-xs font-display font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 hover:bg-cyber-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      {settingDefaultId === method.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Set Default'
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(method.id)}
                    disabled={removingId === method.id || (method.isDefault && paymentMethods.length > 1)}
                    className="p-2 text-slate-400 hover:text-status-error hover:bg-status-error/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={method.isDefault && paymentMethods.length > 1 ? 'Cannot remove default payment method' : 'Remove payment method'}
                  >
                    {removingId === method.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">
            No payment methods saved
          </p>
          <button
            onClick={handleOpenModal}
            className="btn btn-primary"
          >
            Add Your First Card
          </button>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <StripeProvider>
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[70] animate-fade-in">
            <div className="relative w-full max-w-md mx-4 animate-slide-up">
              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                        Add Payment Method
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Secure card entry powered by Stripe
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Error display */}
                  {addError && (
                    <div className="mb-4 p-3 bg-status-error/10 border border-status-error/30 rounded-lg flex items-center gap-2">
                      <svg className="w-4 h-4 text-status-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-status-error text-sm">{addError}</p>
                    </div>
                  )}

                  {/* Card Input */}
                  <CardInput
                    onPaymentMethodCreated={handleAddCard}
                    onError={(err) => setAddError(err)}
                    loading={addingCard}
                    buttonText="Add Card"
                    showSetDefault={true}
                    defaultSetAsDefault={setAsDefault}
                    onSetAsDefaultChange={setSetAsDefault}
                  />

                  {/* Cancel button */}
                  <button
                    onClick={handleCloseModal}
                    disabled={addingCard}
                    className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </StripeProvider>
      )}
    </div>
  );
}
