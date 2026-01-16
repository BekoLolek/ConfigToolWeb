import { create } from 'zustand';
import { billingApi } from '../api/endpoints';
import type { PlanPricing, Subscription, Invoice, PaymentMethod, Usage, Plan } from '../types';

interface BillingState {
  // Data
  pricing: PlanPricing[];
  subscription: Subscription | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  usage: Usage | null;

  // Loading states
  loadingPricing: boolean;
  loadingSubscription: boolean;
  loadingInvoices: boolean;
  loadingPaymentMethods: boolean;
  loadingUsage: boolean;

  // Error state
  error: string | null;

  // Actions (no orgId parameters)
  fetchPricing: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createSubscription: (plan: Plan, paymentMethodId: string, billingCycle: 'monthly' | 'yearly') => Promise<Subscription>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;

  addPaymentMethod: (paymentMethodId: string, setAsDefault?: boolean) => Promise<PaymentMethod>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;

  openBillingPortal: (returnUrl: string) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

const initialState = {
  pricing: [],
  subscription: null,
  invoices: [],
  paymentMethods: [],
  usage: null,
  loadingPricing: false,
  loadingSubscription: false,
  loadingInvoices: false,
  loadingPaymentMethods: false,
  loadingUsage: false,
  error: null,
};

export const useBillingStore = create<BillingState>((set, get) => ({
  ...initialState,

  fetchPricing: async () => {
    set({ loadingPricing: true, error: null });
    try {
      const { data } = await billingApi.getPricing();
      set({ pricing: data, loadingPricing: false });
    } catch (err: any) {
      set({
        loadingPricing: false,
        error: err.response?.data?.message || 'Failed to fetch pricing'
      });
    }
  },

  fetchSubscription: async () => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.getSubscription();
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      set({
        loadingSubscription: false,
        error: err.response?.data?.message || 'Failed to fetch subscription'
      });
    }
  },

  fetchInvoices: async () => {
    set({ loadingInvoices: true, error: null });
    try {
      const { data } = await billingApi.getInvoices();
      set({ invoices: data, loadingInvoices: false });
    } catch (err: any) {
      set({
        loadingInvoices: false,
        error: err.response?.data?.message || 'Failed to fetch invoices'
      });
    }
  },

  fetchPaymentMethods: async () => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      const { data } = await billingApi.getPaymentMethods();
      set({ paymentMethods: data, loadingPaymentMethods: false });
    } catch (err: any) {
      set({
        loadingPaymentMethods: false,
        error: err.response?.data?.message || 'Failed to fetch payment methods'
      });
    }
  },

  fetchUsage: async () => {
    set({ loadingUsage: true, error: null });
    try {
      const { data } = await billingApi.getUsage();
      set({ usage: data, loadingUsage: false });
    } catch (err: any) {
      set({
        loadingUsage: false,
        error: err.response?.data?.message || 'Failed to fetch usage'
      });
    }
  },

  fetchAll: async () => {
    const { fetchPricing, fetchSubscription, fetchInvoices, fetchPaymentMethods, fetchUsage } = get();
    await Promise.all([
      fetchPricing(),
      fetchSubscription(),
      fetchInvoices(),
      fetchPaymentMethods(),
      fetchUsage(),
    ]);
  },

  createSubscription: async (plan: Plan, paymentMethodId: string, billingCycle: 'monthly' | 'yearly') => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.createSubscription({ plan, paymentMethodId, billingCycle });
      set({ subscription: data, loadingSubscription: false });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  cancelSubscription: async () => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.cancelSubscription();
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  resumeSubscription: async () => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.resumeSubscription();
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resume subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  addPaymentMethod: async (paymentMethodId: string, setAsDefault = true) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      const { data } = await billingApi.addPaymentMethod({ paymentMethodId, setAsDefault });
      const currentMethods = get().paymentMethods;
      // If set as default, mark others as not default
      const updatedMethods = setAsDefault
        ? currentMethods.map(m => ({ ...m, isDefault: false }))
        : currentMethods;
      set({
        paymentMethods: [...updatedMethods, data],
        loadingPaymentMethods: false
      });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add payment method';
      set({ loadingPaymentMethods: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  removePaymentMethod: async (paymentMethodId: string) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      await billingApi.removePaymentMethod(paymentMethodId);
      const currentMethods = get().paymentMethods;
      set({
        paymentMethods: currentMethods.filter(m => m.id !== paymentMethodId),
        loadingPaymentMethods: false
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove payment method';
      set({ loadingPaymentMethods: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  setDefaultPaymentMethod: async (paymentMethodId: string) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      await billingApi.setDefaultPaymentMethod(paymentMethodId);
      const currentMethods = get().paymentMethods;
      set({
        paymentMethods: currentMethods.map(m => ({
          ...m,
          isDefault: m.id === paymentMethodId
        })),
        loadingPaymentMethods: false
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to set default payment method';
      set({ loadingPaymentMethods: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  openBillingPortal: async (returnUrl: string) => {
    try {
      const { data } = await billingApi.createPortalSession(returnUrl);
      window.location.href = data.url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to open billing portal';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
