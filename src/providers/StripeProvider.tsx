import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';

// Load Stripe only if the publishable key is configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Custom appearance for Stripe Elements to match our theme
const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#06b6d4', // cyber-500
    colorBackground: '#ffffff',
    colorText: '#1e293b', // slate-800
    colorDanger: '#ef4444', // red-500
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e2e8f0', // slate-200
      boxShadow: 'none',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #06b6d4', // cyber-500
      boxShadow: '0 0 0 1px #06b6d4',
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '14px',
      marginBottom: '8px',
    },
  },
};

// Dark mode appearance
const darkAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#22d3ee', // cyber-400
    colorBackground: '#0f172a', // slate-900
    colorText: '#f1f5f9', // slate-100
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #334155', // slate-700
      boxShadow: 'none',
      padding: '12px',
      backgroundColor: '#1e293b', // slate-800
    },
    '.Input:focus': {
      border: '1px solid #22d3ee', // cyber-400
      boxShadow: '0 0 0 1px #22d3ee',
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '14px',
      marginBottom: '8px',
    },
  },
};

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  // Check if we're in dark mode
  const isDarkMode = typeof window !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
     window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Show configuration message if Stripe key is not set
  if (!stripePromise) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Stripe not configured</span>
        </div>
        <p className="mt-2 text-sm text-amber-600/80 dark:text-amber-400/80">
          Payment processing is unavailable. Set <code className="px-1 py-0.5 bg-amber-500/20 rounded font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> in your environment.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: isDarkMode ? darkAppearance : appearance,
        locale: 'en',
      }}
    >
      {children}
    </Elements>
  );
}

export default StripeProvider;
