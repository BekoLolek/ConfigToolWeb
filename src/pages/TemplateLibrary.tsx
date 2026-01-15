import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTemplateStore } from '../stores/templateStore';
import { useAuthStore } from '../stores/authStore';
import { templateApi } from '../api/endpoints';
import { Template, CreateTemplateRequest } from '../types';
import ThemeToggle from '../components/ThemeToggle';

// Icon components
function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function DownloadIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function StarIcon({ className = '', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function FolderIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function GlobeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function XMarkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Star rating display
function StarRating({ rating, count }: { rating: number | null; count: number }) {
  const stars = rating ? Math.round(rating) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-3.5 h-3.5 ${star <= stars ? 'text-amber-400' : 'text-slate-600'}`}
            filled={star <= stars}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-xs text-slate-500 font-mono">({count})</span>
      )}
    </div>
  );
}

// Filter tabs
type StatusFilter = 'all' | 'public' | 'private';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

// Template form modal
interface TemplateFormProps {
  template?: Template | null;
  onClose: () => void;
  onSave: (data: CreateTemplateRequest) => Promise<void>;
  categories: { id: string; name: string }[];
}

function TemplateFormModal({ template, onClose, onSave, categories }: TemplateFormProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: template?.name || '',
    description: template?.description || '',
    pluginName: template?.pluginName || '',
    pluginVersion: template?.pluginVersion || '',
    content: template?.content || '',
    fileName: template?.fileName || 'config.yml',
    categoryId: template?.categoryId || '',
    isPublic: template?.isPublic ?? false,
    tags: template?.tags || '',
    minServerVersion: template?.minServerVersion || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.pluginName.trim() || !formData.content.trim()) {
      setError('Name, plugin name, and content are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-slide-up">
        {/* Gradient Top Bar */}
        <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-display text-xl font-bold text-white">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome Template"
              className="input"
              required
            />
          </div>

          {/* Plugin Name & Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Plugin Name *
              </label>
              <input
                type="text"
                value={formData.pluginName}
                onChange={(e) => setFormData({ ...formData, pluginName: e.target.value })}
                placeholder="EssentialsX"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Plugin Version
              </label>
              <input
                type="text"
                value={formData.pluginVersion}
                onChange={(e) => setFormData({ ...formData, pluginVersion: e.target.value })}
                placeholder="2.20.0"
                className="input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of what this template does..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="# Your config content here..."
              rows={10}
              className="input font-mono text-sm resize-none"
              required
            />
          </div>

          {/* File Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                placeholder="config.yml"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Min Server Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="economy, spawn, permissions"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Min Server Version
              </label>
              <input
                type="text"
                value={formData.minServerVersion}
                onChange={(e) => setFormData({ ...formData, minServerVersion: e.target.value })}
                placeholder="1.19"
                className="input"
              />
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isPublic ? 'bg-cyber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.isPublic ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <div>
              <span className="text-sm font-medium text-white">
                {formData.isPublic ? 'Public' : 'Private'}
              </span>
              <p className="text-xs text-slate-400">
                {formData.isPublic
                  ? 'Visible in the marketplace to all users'
                  : 'Only visible to you'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteConfirmModal({
  template,
  onClose,
  onConfirm
}: {
  template: Template;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Delete Template</h3>
              <p className="text-sm text-slate-400">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-slate-300 mb-6">
            Are you sure you want to delete <span className="font-semibold text-white">{template.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn btn-ghost" disabled={deleting}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateLibrary() {
  const { user, logout, refreshToken } = useAuthStore();
  const { categories, fetchCategories, deleteTemplate } = useTemplateStore();
  const navigate = useNavigate();

  // Local state for user templates (separate from marketplace store)
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // UI state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState<Template | null>(null);

  // Fetch user templates
  const fetchUserTemplates = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await templateApi.getUserTemplates(page, 20);
      setTemplates(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCategories();
    fetchUserTemplates();
  }, []);

  // Filter templates based on status and search
  const filteredTemplates = templates.filter((template) => {
    // Status filter
    if (statusFilter === 'public' && !template.isPublic) return false;
    if (statusFilter === 'private' && template.isPublic) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.pluginName.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  // Handle create template
  const handleCreateTemplate = async (data: CreateTemplateRequest) => {
    await templateApi.create(data);
    await fetchUserTemplates(currentPage);
  };

  // Handle update template
  const handleUpdateTemplate = async (data: CreateTemplateRequest) => {
    if (!editTemplate) return;
    await templateApi.update(editTemplate.id, data);
    await fetchUserTemplates(currentPage);
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    if (!deleteConfirmTemplate) return;
    await deleteTemplate(deleteConfirmTemplate.id);
    setDeleteConfirmTemplate(null);
    await fetchUserTemplates(currentPage);
  };

  // Handle toggle public/private
  const handleTogglePublic = async (template: Template) => {
    try {
      await templateApi.update(template.id, { isPublic: !template.isPublic });
      await fetchUserTemplates(currentPage);
    } catch (err: any) {
      console.error('Failed to toggle template visibility:', err);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchUserTemplates(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid">
      {/* Navigation Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded border border-cyber-500/30 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-500 dark:text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-slate-900 dark:text-white">
                CONFIG<span className="text-cyber-500 dark:text-cyber-400">TOOL</span>
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <>
                  <Link to="/" className="btn btn-ghost text-xs">Dashboard</Link>
                  <Link to="/marketplace" className="btn btn-ghost text-xs">Marketplace</Link>
                  <button onClick={handleLogout} className="btn btn-ghost text-xs">Logout</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center shadow-glow-sm">
                <FolderIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
                  My Templates
                </h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">
                  Manage Your Config Templates
                </p>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 animate-slide-up">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search your templates..."
                    className="input pl-12 pr-4"
                  />
                </div>
              </form>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setSearchQuery('');
                      setLocalSearch('');
                    }}
                    className={`px-4 py-2 text-xs font-display uppercase tracking-wider rounded-md transition-all ${
                      statusFilter === filter.value
                        ? 'bg-cyber-500 text-white shadow-glow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div className="text-sm text-slate-500">
              {searchQuery && (
                <span>
                  Results for "<span className="text-cyber-500 font-medium">{searchQuery}</span>"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span>
                  Showing <span className="text-cyber-500 font-medium capitalize">{statusFilter}</span> templates
                </span>
              )}
              <span className="ml-2 text-slate-400">({filteredTemplates.length} templates)</span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocalSearch('');
                setStatusFilter('all');
              }}
              className="text-xs text-cyber-500 hover:text-cyber-400 font-mono uppercase tracking-wider"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-cyber-500 rounded-full animate-spin" />
              <span className="text-slate-500 font-mono text-sm uppercase tracking-wider">Loading templates...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-cyber-500/50 transition-all duration-300 hover:shadow-glow-sm animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Top Bar */}
                <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600 opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyber-500/30 group-hover:border-cyber-500 transition-colors" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyber-500/30 group-hover:border-cyber-500 transition-colors" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyber-500/30 group-hover:border-cyber-500 transition-colors" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyber-500/30 group-hover:border-cyber-500 transition-colors" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="tech-label">
                          {template.pluginName}
                        </span>
                        {template.pluginVersion && (
                          <span className="text-2xs font-mono text-slate-400">
                            v{template.pluginVersion}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Status Badge */}
                    <button
                      onClick={() => handleTogglePublic(template)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                        template.isPublic
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30 hover:bg-slate-500/20'
                      }`}
                      title={template.isPublic ? 'Click to make private' : 'Click to publish'}
                    >
                      {template.isPublic ? (
                        <GlobeIcon className="w-3 h-3" />
                      ) : (
                        <LockIcon className="w-3 h-3" />
                      )}
                      {template.isPublic ? 'Public' : 'Private'}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {template.description || 'No description provided'}
                  </p>

                  {/* Tags */}
                  {template.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.tags.split(',').slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <StarRating rating={template.averageRating} count={template.ratingCount} />
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <DownloadIcon className="w-4 h-4" />
                      <span className="text-xs font-mono">{template.downloadCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setEditTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-cyber-500 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTemplate(template)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <FolderIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No Templates Found' : 'No Templates Yet'}
            </h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              {searchQuery
                ? `No templates match your search for "${searchQuery}"`
                : statusFilter !== 'all'
                ? `You don't have any ${statusFilter} templates`
                : 'Create your first template to share or keep for personal use'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocalSearch('');
                  setStatusFilter('all');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create Your First Template
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 7) {
                  if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-mono text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-cyber-500 text-white shadow-glow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 font-mono">
            ConfigTool Template Library
          </p>
        </div>
      </footer>

      {/* Create/Edit Modal */}
      {(showCreateModal || editTemplate) && (
        <TemplateFormModal
          template={editTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setEditTemplate(null);
          }}
          onSave={editTemplate ? handleUpdateTemplate : handleCreateTemplate}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTemplate && (
        <DeleteConfirmModal
          template={deleteConfirmTemplate}
          onClose={() => setDeleteConfirmTemplate(null)}
          onConfirm={handleDeleteTemplate}
        />
      )}
    </div>
  );
}
