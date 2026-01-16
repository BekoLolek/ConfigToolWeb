import { create } from 'zustand';
import { Template, TemplateCategory, PageResponse } from '../types';
import { templateApi, categoryApi } from '../api/endpoints';

interface TemplateState {
  // Data
  templates: Template[];
  categories: TemplateCategory[];
  currentTemplate: Template | null;

  // Pagination
  totalPages: number;
  currentPage: number;
  totalElements: number;

  // UI State
  loading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  selectedCategory: string | null;
  selectedPlugin: string | null;
  sortBy: 'downloadCount' | 'createdAt' | 'averageRating';

  // Actions
  fetchMarketplace: (page?: number) => Promise<void>;
  fetchPopular: (page?: number) => Promise<void>;
  fetchRecent: (page?: number) => Promise<void>;
  fetchTopRated: (page?: number) => Promise<void>;
  fetchByCategory: (categoryId: string, page?: number) => Promise<void>;
  fetchByPlugin: (pluginName: string, page?: number) => Promise<void>;
  searchTemplates: (query: string, page?: number) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;

  // Mutations
  createTemplate: (data: any) => Promise<Template>;
  updateTemplate: (id: string, data: any) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  rateTemplate: (id: string, score: number, review?: string) => Promise<void>;

  // Filters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedPlugin: (pluginName: string | null) => void;
  setSortBy: (sort: 'downloadCount' | 'createdAt' | 'averageRating') => void;

  // Reset
  reset: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  // Initial state
  templates: [],
  categories: [],
  currentTemplate: null,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedPlugin: null,
  sortBy: 'downloadCount',

  // Fetch marketplace templates with current sort
  fetchMarketplace: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { sortBy } = get();
      const { data } = await templateApi.getMarketplace(page, 20, sortBy, 'desc');
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  fetchPopular: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { data } = await templateApi.getPopular(page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  fetchRecent: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { data } = await templateApi.getRecent(page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  fetchTopRated: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { data } = await templateApi.getTopRated(page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  fetchByCategory: async (categoryId: string, page = 0) => {
    set({ loading: true, error: null, selectedCategory: categoryId });
    try {
      const { data } = await templateApi.getByCategory(categoryId, page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  fetchByPlugin: async (pluginName: string, page = 0) => {
    set({ loading: true, error: null, selectedPlugin: pluginName });
    try {
      const { data } = await templateApi.getByPlugin(pluginName, page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch templates', loading: false });
    }
  },

  searchTemplates: async (query: string, page = 0) => {
    set({ loading: true, error: null, searchQuery: query });
    try {
      const { data } = await templateApi.search(query, page, 20);
      set({
        templates: data.content,
        totalPages: data.totalPages,
        currentPage: data.number,
        totalElements: data.totalElements,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to search templates', loading: false });
    }
  },

  fetchTemplate: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await templateApi.get(id);
      set({ currentTemplate: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch template', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await categoryApi.getActive();
      set({ categories: data });
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  },

  createTemplate: async (data) => {
    const { data: template } = await templateApi.create(data);
    return template;
  },

  updateTemplate: async (id, data) => {
    const { data: template } = await templateApi.update(id, data);
    set({ currentTemplate: template });
    return template;
  },

  deleteTemplate: async (id) => {
    await templateApi.delete(id);
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
    }));
  },

  rateTemplate: async (id, score, review) => {
    await templateApi.rate(id, { score, review });
    // Refetch template to get updated rating
    const { data } = await templateApi.get(id);
    set({ currentTemplate: data });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSelectedPlugin: (pluginName) => set({ selectedPlugin: pluginName }),
  setSortBy: (sort) => set({ sortBy: sort }),

  reset: () => set({
    templates: [],
    currentTemplate: null,
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    selectedPlugin: null,
  }),
}));
