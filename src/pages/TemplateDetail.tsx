import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { templateApi } from '../api/endpoints';
import { Template, TemplateVariable, TemplateRating, CreateRatingRequest } from '../types';
import { useAuthStore } from '../stores/authStore';

// Icon components
function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

function VerifiedIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

// Star rating display
function StarRating({ rating, count, size = 'md' }: { rating: number | null; count: number; size?: 'sm' | 'md' | 'lg' }) {
  const stars = rating ? Math.round(rating) : 0;
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClasses[size]} ${star <= stars ? 'text-amber-400' : 'text-slate-600'}`}
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

// Interactive star rating input
function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
          className="p-1 transition-transform hover:scale-110"
        >
          <StarIcon
            className={`w-7 h-7 transition-colors ${
              star <= (hoverValue || value)
                ? 'text-amber-400'
                : 'text-slate-600 hover:text-slate-500'
            }`}
            filled={star <= (hoverValue || value)}
          />
        </button>
      ))}
    </div>
  );
}

// Variable input component based on type
function VariableInput({
  variable,
  value,
  onChange,
}: {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = variable.displayName || variable.name;
  const commonClasses = "input";

  switch (variable.type) {
    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(value === 'true' ? 'false' : 'true')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              value === 'true' ? 'bg-cyber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                value === 'true' ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm text-slate-300">{label}</span>
        </div>
      );

    case 'SELECT':
      const options = variable.options?.split(',').map((o) => o.trim()) || [];
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
          required={variable.isRequired}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'NUMBER':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.placeholder || `Enter ${label}`}
          className={commonClasses}
          required={variable.isRequired}
        />
      );

    case 'MULTILINE':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.placeholder || `Enter ${label}`}
          rows={4}
          className={`${commonClasses} resize-none`}
          required={variable.isRequired}
        />
      );

    case 'STRING':
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.placeholder || `Enter ${label}`}
          className={commonClasses}
          required={variable.isRequired}
        />
      );
  }
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TemplateDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const { user, isAuthenticated } = useAuthStore();

  // Template data
  const [template, setTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [ratings, setRatings] = useState<TemplateRating[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedContent, setAppliedContent] = useState<string | null>(null);
  const [showAppliedContent, setShowAppliedContent] = useState(false);

  // Rating form state
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // Ratings pagination
  const [ratingsPage, setRatingsPage] = useState(0);
  const [totalRatingsPages, setTotalRatingsPages] = useState(0);
  const [loadingMoreRatings, setLoadingMoreRatings] = useState(false);

  // Fetch template data
  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch template (this will increment view count)
      const { data: templateData } = await templateApi.get(templateId);
      setTemplate(templateData);

      // Fetch variables
      const { data: variablesData } = await templateApi.getVariables(templateId);
      setVariables(variablesData.sort((a, b) => a.displayOrder - b.displayOrder));

      // Initialize variable values with defaults
      const defaultValues: Record<string, string> = {};
      variablesData.forEach((v) => {
        defaultValues[v.name] = v.defaultValue || '';
      });
      setVariableValues(defaultValues);

      // Fetch ratings
      const { data: ratingsData } = await templateApi.getRatings(templateId, 0, 10);
      setRatings(ratingsData.content);
      setTotalRatingsPages(ratingsData.totalPages);
      setRatingsPage(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // Load more ratings
  const loadMoreRatings = async () => {
    if (!templateId || loadingMoreRatings || ratingsPage >= totalRatingsPages - 1) return;

    setLoadingMoreRatings(true);
    try {
      const nextPage = ratingsPage + 1;
      const { data } = await templateApi.getRatings(templateId, nextPage, 10);
      setRatings((prev) => [...prev, ...data.content]);
      setRatingsPage(nextPage);
    } catch (err) {
      console.error('Failed to load more ratings:', err);
    } finally {
      setLoadingMoreRatings(false);
    }
  };

  // Handle variable change
  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
    // Reset applied content when variables change
    setAppliedContent(null);
    setShowAppliedContent(false);
  };

  // Apply variables and get transformed content
  const handleApplyVariables = async () => {
    if (!templateId || !template) return;

    setApplying(true);
    setError(null);

    try {
      const { data } = await templateApi.applyVariables(templateId, variableValues);
      setAppliedContent(data.content);
      setShowAppliedContent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply variables');
    } finally {
      setApplying(false);
    }
  };

  // Copy content to clipboard
  const handleCopyContent = async () => {
    const contentToCopy = showAppliedContent && appliedContent ? appliedContent : template?.content;
    if (!contentToCopy) return;

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download content as file
  const handleDownload = () => {
    if (!template) return;

    const contentToDownload = showAppliedContent && appliedContent ? appliedContent : template.content;
    if (!contentToDownload) return;

    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.fileName || 'config.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Submit rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || ratingScore === 0) return;

    setSubmittingRating(true);
    setRatingError(null);
    setRatingSuccess(false);

    try {
      const data: CreateRatingRequest = {
        score: ratingScore,
        review: ratingReview.trim() || undefined,
      };
      await templateApi.rate(templateId, data);
      setRatingSuccess(true);
      setRatingScore(0);
      setRatingReview('');

      // Refresh ratings and template data
      const [ratingsRes, templateRes] = await Promise.all([
        templateApi.getRatings(templateId, 0, 10),
        templateApi.get(templateId),
      ]);
      setRatings(ratingsRes.data.content);
      setTotalRatingsPages(ratingsRes.data.totalPages);
      setRatingsPage(0);
      setTemplate(templateRes.data);
    } catch (err: any) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-cyber-500 rounded-full animate-spin" />
          <span className="text-slate-500 font-mono text-sm uppercase tracking-wider">Loading template...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !template) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Template Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/marketplace" className="btn btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!template) return null;

  const displayContent = showAppliedContent && appliedContent ? appliedContent : template.content;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyber-500 font-mono uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up">
              {/* Gradient Top Bar */}
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyber-500/30" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyber-500/30" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyber-500/30" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyber-500/30" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
                        {template.name}
                      </h1>
                      {template.isVerified && (
                        <VerifiedIcon className="w-6 h-6 text-cyber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="tech-label text-sm">
                        {template.pluginName}
                      </span>
                      {template.pluginVersion && (
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          v{template.pluginVersion}
                        </span>
                      )}
                      {template.categoryName && (
                        <span className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                          {template.categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {template.description && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {template.description}
                  </p>
                )}

                {/* Tags */}
                {template.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-500 dark:text-cyber-400 rounded border border-cyber-500/20"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <StarRating rating={template.averageRating} count={template.ratingCount} size="lg" />
                    {template.averageRating && (
                      <span className="text-sm font-mono text-slate-500">
                        {template.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <DownloadIcon className="w-4 h-4" />
                    <span className="text-sm font-mono">{template.downloadCount.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm font-mono">{template.viewCount.toLocaleString()} views</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white uppercase">
                      {template.authorEmail?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                      Created by
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {template.authorEmail}
                    </p>
                  </div>
                  {template.minServerVersion && (
                    <div className="ml-auto">
                      <p className="text-xs text-slate-500 font-mono uppercase">Min Version</p>
                      <p className="text-sm font-mono text-slate-900 dark:text-white">{template.minServerVersion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Preview Card */}
            <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyber-500/30" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyber-500/30" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyber-500/30" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyber-500/30" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {showAppliedContent ? 'Customized Content' : 'Content Preview'}
                  </h2>
                  <div className="flex items-center gap-2">
                    {showAppliedContent && (
                      <button
                        onClick={() => setShowAppliedContent(false)}
                        className="text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-cyber-500 transition-colors"
                      >
                        Show Original
                      </button>
                    )}
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyber-500 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-cyber-500 hover:bg-cyber-400 text-white rounded-lg transition-colors shadow-glow-sm"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* File Name Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-xs font-mono bg-slate-800 text-slate-300 rounded">
                    {template.fileName}
                  </span>
                  {showAppliedContent && (
                    <span className="px-2.5 py-1 text-xs font-mono bg-green-500/10 text-green-400 rounded border border-green-500/20">
                      Variables Applied
                    </span>
                  )}
                </div>

                {/* Code Block */}
                <div className="relative rounded-lg overflow-hidden border border-slate-700/50">
                  <pre className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
                    <code className="text-sm font-mono text-slate-300 whitespace-pre">
                      {displayContent || '# No content'}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Ratings Section */}
            <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyber-500/30" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyber-500/30" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyber-500/30" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyber-500/30" />

              <div className="p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">
                  Ratings & Reviews
                </h2>

                {/* Submit Rating Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitRating} className="mb-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-4">
                      Leave a Review
                    </h3>

                    {ratingError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{ratingError}</p>
                      </div>
                    )}

                    {ratingSuccess && (
                      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-400">Thank you for your review!</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Rating *
                      </label>
                      <StarRatingInput value={ratingScore} onChange={setRatingScore} />
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Review (Optional)
                      </label>
                      <textarea
                        value={ratingReview}
                        onChange={(e) => setRatingReview(e.target.value)}
                        placeholder="Share your experience with this template..."
                        rows={3}
                        className="input resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={ratingScore === 0 || submittingRating}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-500 mb-3">Sign in to leave a review</p>
                    <Link to="/login" className="btn btn-primary">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Ratings List */}
                {ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {rating.userEmail}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {formatDate(rating.createdAt)}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={rating.score} count={0} size="sm" />
                        </div>
                        {rating.review && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {rating.review}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Load More */}
                    {ratingsPage < totalRatingsPages - 1 && (
                      <button
                        onClick={loadMoreRatings}
                        disabled={loadingMoreRatings}
                        className="w-full py-3 text-sm font-mono uppercase tracking-wider text-cyber-500 hover:text-cyber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingMoreRatings ? 'Loading...' : 'Load More Reviews'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Variables Card */}
            {variables.length > 0 && (
              <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up sticky top-24">
                <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-500/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-500/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-500/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-500/30" />

                <div className="p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Customize Variables
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Customize the template by filling in the variables below, then apply to preview the changes.
                  </p>

                  <div className="space-y-5">
                    {variables.map((variable) => (
                      <div key={variable.id}>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                          {variable.displayName || variable.name}
                          {variable.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {variable.description && (
                          <p className="text-xs text-slate-500 mb-2">{variable.description}</p>
                        )}
                        <VariableInput
                          variable={variable}
                          value={variableValues[variable.name] || ''}
                          onChange={(value) => handleVariableChange(variable.name, value)}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleApplyVariables}
                    disabled={applying}
                    className="w-full mt-6 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Apply Variables
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Card (shown when no variables) */}
            {variables.length === 0 && (
              <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up sticky top-24">
                <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyber-500/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyber-500/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyber-500/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyber-500/30" />

                <div className="p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={handleCopyContent}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-5 h-5 text-green-500" />
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-5 h-5" />
                          Copy Content
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyber-500 hover:bg-cyber-400 text-white rounded-lg transition-colors shadow-glow-sm"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Download File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Template Info Card */}
            <div className="relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />

              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-slate-500/30" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-slate-500/30" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-slate-500/30" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-slate-500/30" />

              <div className="p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Template Info
                </h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">File Name</dt>
                    <dd className="text-slate-900 dark:text-white font-mono">{template.fileName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Plugin</dt>
                    <dd className="text-slate-900 dark:text-white">{template.pluginName}</dd>
                  </div>
                  {template.pluginVersion && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Version</dt>
                      <dd className="text-slate-900 dark:text-white font-mono">v{template.pluginVersion}</dd>
                    </div>
                  )}
                  {template.categoryName && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Category</dt>
                      <dd className="text-slate-900 dark:text-white">{template.categoryName}</dd>
                    </div>
                  )}
                  {template.minServerVersion && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Min Server</dt>
                      <dd className="text-slate-900 dark:text-white font-mono">{template.minServerVersion}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="text-slate-900 dark:text-white">{formatDate(template.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Updated</dt>
                    <dd className="text-slate-900 dark:text-white">{formatDate(template.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
