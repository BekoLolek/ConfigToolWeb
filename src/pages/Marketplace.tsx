import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTemplateStore } from '../stores/templateStore';
import { useAuthStore } from '../stores/authStore';

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

function VerifiedIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

// Category icon mapping
const categoryIcons: Record<string, JSX.Element> = {
  'currency-dollar': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  'shield-check': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
  'lock-closed': <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
  'chat-bubble-left-right': <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />,
  'key': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />,
  'globe-alt': <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />,
  'puzzle-piece': <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />,
  'wrench': <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />,
  'fire': <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />,
  'arrow-path': <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
};

function CategoryIcon({ icon, className = '' }: { icon: string | null; className?: string }) {
  const path = icon ? categoryIcons[icon] : null;
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {path || <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />}
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

// Sort tabs
type SortOption = 'popular' | 'recent' | 'top-rated';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'recent', label: 'Recent' },
  { value: 'top-rated', label: 'Top Rated' },
];

export default function Marketplace() {
  const { user } = useAuthStore();
  const {
    templates,
    categories,
    loading,
    error,
    totalPages,
    currentPage,
    totalElements,
    searchQuery,
    selectedCategory,
    fetchMarketplace,
    fetchPopular,
    fetchRecent,
    fetchTopRated,
    fetchByCategory,
    searchTemplates,
    fetchCategories,
    setSelectedCategory,
    setSearchQuery,
  } = useTemplateStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [localSearch, setLocalSearch] = useState('');

  // Load categories and initial templates
  useEffect(() => {
    fetchCategories();
    fetchPopular();
  }, []);

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setSelectedCategory(null);
    setSearchQuery('');
    setLocalSearch('');

    switch (sort) {
      case 'popular':
        fetchPopular();
        break;
      case 'recent':
        fetchRecent();
        break;
      case 'top-rated':
        fetchTopRated();
        break;
    }
  };

  // Handle category filter
  const handleCategoryClick = (categoryId: string | null) => {
    setSearchQuery('');
    setLocalSearch('');
    if (categoryId) {
      fetchByCategory(categoryId);
    } else {
      setSelectedCategory(null);
      handleSortChange(sortBy);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSelectedCategory(null);
      searchTemplates(localSearch.trim());
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (searchQuery) {
      searchTemplates(searchQuery, page);
    } else if (selectedCategory) {
      fetchByCategory(selectedCategory, page);
    } else {
      switch (sortBy) {
        case 'popular':
          fetchPopular(page);
          break;
        case 'recent':
          fetchRecent(page);
          break;
        case 'top-rated':
          fetchTopRated(page);
          break;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center shadow-glow-sm">
              <GridIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
                Template Marketplace
              </h1>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">
                Community Config Templates
              </p>
            </div>
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
                    placeholder="Search templates by name, plugin, or description..."
                    className="input pl-12 pr-4"
                  />
                </div>
              </form>

              {/* Sort Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-4 py-2 text-xs font-display uppercase tracking-wider rounded-md transition-all ${
                      sortBy === option.value && !selectedCategory && !searchQuery
                        ? 'bg-cyber-500 text-white shadow-glow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Categories:</span>
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full transition-all ${
                    !selectedCategory
                      ? 'bg-cyber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full transition-all ${
                      selectedCategory === category.id
                        ? 'bg-cyber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CategoryIcon icon={category.icon} className="w-3.5 h-3.5" />
                    {category.name}
                    <span className="opacity-60">({category.templateCount})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div className="text-sm text-slate-500">
              {searchQuery && (
                <span>
                  Results for "<span className="text-cyber-500 font-medium">{searchQuery}</span>"
                </span>
              )}
              {selectedCategory && categories.find(c => c.id === selectedCategory) && (
                <span>
                  Browsing <span className="text-cyber-500 font-medium">{categories.find(c => c.id === selectedCategory)?.name}</span>
                </span>
              )}
              <span className="ml-2 text-slate-400">({totalElements} templates)</span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocalSearch('');
                setSelectedCategory(null);
                handleSortChange(sortBy);
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
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Link
                key={template.id}
                to={`/templates/${template.id}`}
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
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-cyber-500 transition-colors">
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
                    {template.isVerified && (
                      <div className="flex-shrink-0">
                        <VerifiedIcon className="w-5 h-5 text-cyber-500" />
                      </div>
                    )}
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

                  {/* Author */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center">
                        <span className="text-2xs font-bold text-white uppercase">
                          {template.authorEmail?.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono truncate">
                        {template.authorEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <GridIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Templates Found
            </h3>
            <p className="text-slate-500 text-center max-w-md">
              {searchQuery
                ? `No templates match your search for "${searchQuery}"`
                : selectedCategory
                ? 'No templates in this category yet'
                : 'No templates available at the moment'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocalSearch('');
                  setSelectedCategory(null);
                  handleSortChange('popular');
                }}
                className="btn btn-secondary mt-6"
              >
                Browse All Templates
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
      </div>
    </div>
  );
}
