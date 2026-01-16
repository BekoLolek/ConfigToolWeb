import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';

// Load Stripe with the publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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
