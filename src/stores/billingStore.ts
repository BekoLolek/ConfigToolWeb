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

  // Actions
  fetchPricing: () => Promise<void>;
  fetchSubscription: (orgId: string) => Promise<void>;
  fetchInvoices: (orgId: string) => Promise<void>;
  fetchPaymentMethods: (orgId: string) => Promise<void>;
  fetchUsage: (orgId: string) => Promise<void>;
  fetchAll: (orgId: string) => Promise<void>;

  createSubscription: (orgId: string, plan: Plan, paymentMethodId: string, billingCycle: 'monthly' | 'yearly') => Promise<Subscription>;
  cancelSubscription: (orgId: string) => Promise<void>;
  resumeSubscription: (orgId: string) => Promise<void>;

  addPaymentMethod: (orgId: string, paymentMethodId: string, setAsDefault?: boolean) => Promise<PaymentMethod>;
  removePaymentMethod: (orgId: string, paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (orgId: string, paymentMethodId: string) => Promise<void>;

  openBillingPortal: (orgId: string) => Promise<void>;

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

  fetchSubscription: async (orgId: string) => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.getSubscription(orgId);
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      set({
        loadingSubscription: false,
        error: err.response?.data?.message || 'Failed to fetch subscription'
      });
    }
  },

  fetchInvoices: async (orgId: string) => {
    set({ loadingInvoices: true, error: null });
    try {
      const { data } = await billingApi.getInvoices(orgId);
      set({ invoices: data, loadingInvoices: false });
    } catch (err: any) {
      set({
        loadingInvoices: false,
        error: err.response?.data?.message || 'Failed to fetch invoices'
      });
    }
  },

  fetchPaymentMethods: async (orgId: string) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      const { data } = await billingApi.getPaymentMethods(orgId);
      set({ paymentMethods: data, loadingPaymentMethods: false });
    } catch (err: any) {
      set({
        loadingPaymentMethods: false,
        error: err.response?.data?.message || 'Failed to fetch payment methods'
      });
    }
  },

  fetchUsage: async (orgId: string) => {
    set({ loadingUsage: true, error: null });
    try {
      const { data } = await billingApi.getUsage(orgId);
      set({ usage: data, loadingUsage: false });
    } catch (err: any) {
      set({
        loadingUsage: false,
        error: err.response?.data?.message || 'Failed to fetch usage'
      });
    }
  },

  fetchAll: async (orgId: string) => {
    const { fetchPricing, fetchSubscription, fetchInvoices, fetchPaymentMethods, fetchUsage } = get();
    await Promise.all([
      fetchPricing(),
      fetchSubscription(orgId),
      fetchInvoices(orgId),
      fetchPaymentMethods(orgId),
      fetchUsage(orgId),
    ]);
  },

  createSubscription: async (orgId: string, plan: Plan, paymentMethodId: string, billingCycle: 'monthly' | 'yearly') => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.createSubscription(orgId, plan, paymentMethodId, billingCycle);
      set({ subscription: data, loadingSubscription: false });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  cancelSubscription: async (orgId: string) => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.cancelSubscription(orgId);
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  resumeSubscription: async (orgId: string) => {
    set({ loadingSubscription: true, error: null });
    try {
      const { data } = await billingApi.resumeSubscription(orgId);
      set({ subscription: data, loadingSubscription: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resume subscription';
      set({ loadingSubscription: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  addPaymentMethod: async (orgId: string, paymentMethodId: string, setAsDefault = true) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      const { data } = await billingApi.addPaymentMethod(orgId, paymentMethodId, setAsDefault);
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

  removePaymentMethod: async (orgId: string, paymentMethodId: string) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      await billingApi.removePaymentMethod(orgId, paymentMethodId);
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

  setDefaultPaymentMethod: async (orgId: string, paymentMethodId: string) => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      await billingApi.setDefaultPaymentMethod(orgId, paymentMethodId);
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

  openBillingPortal: async (orgId: string) => {
    try {
      const returnUrl = window.location.href;
      const { data } = await billingApi.createBillingPortal(orgId, returnUrl);
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
