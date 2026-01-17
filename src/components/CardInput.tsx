import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';

interface CardInputProps {
  onPaymentMethodCreated: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
  buttonText?: string;
  showSetDefault?: boolean;
  defaultSetAsDefault?: boolean;
  onSetAsDefaultChange?: (value: boolean) => void;
}

export default function CardInput({
  onPaymentMethodCreated,
  onError,
  loading = false,
  buttonText = 'Add Card',
  showSetDefault = false,
  defaultSetAsDefault = true,
  onSetAsDefaultChange,
}: CardInputProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(defaultSetAsDefault);

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message || 'An error occurred');
        onError(error.message || 'An error occurred');
      } else if (paymentMethod) {
        onPaymentMethodCreated(paymentMethod.id);
        // Clear the card input after successful creation
        cardElement.clear();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setCardError(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = !stripe || !cardComplete || isProcessing || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Card Details
        </label>
        <div className="relative">
          <div className={`p-4 border rounded-lg transition-colors ${
            cardError
              ? 'border-status-error bg-status-error/5'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
          }`}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e293b',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    '::placeholder': {
                      color: '#94a3b8',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
                hidePostalCode: false,
              }}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-status-error flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {cardError}
            </p>
          )}
        </div>
      </div>

      {/* Set as default checkbox */}
      {showSetDefault && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => {
                setSetAsDefault(e.target.checked);
                onSetAsDefaultChange?.(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:border-cyber-500 peer-checked:bg-cyber-500 transition-colors" />
            <svg
              className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            Set as default payment method
          </span>
        </label>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>
          Your payment information is encrypted and securely processed by Stripe. We never store your full card number.
        </span>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all ${
          isDisabled
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-cyber-600 text-white hover:bg-cyber-500 shadow-glow-sm hover:shadow-glow'
        }`}
      >
        {isProcessing || loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
}
