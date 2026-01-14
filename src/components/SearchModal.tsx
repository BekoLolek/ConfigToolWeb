import { useState, useEffect, useRef, useCallback } from 'react';
import { fileApi } from '../api/endpoints';
import { useEditorStore } from '../stores/editorStore';
import type { SearchResult } from '../types';

interface Props {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ serverId, isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { openTab } = useEditorStore();

  // Flatten results for keyboard navigation
  const flatResults = results.flatMap(r =>
    r.matches.map(m => ({ filePath: r.filePath, line: m.line, content: m.content }))
  );

  // Search with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fileApi.search(serverId, query);
        setResults(res.data);
        setSelectedIndex(0);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, serverId]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle result selection
  const handleSelect = useCallback((filePath: string, _line?: number) => {
    openTab(serverId, filePath);
    onClose();
  }, [serverId, openTab, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatResults[selectedIndex].filePath, flatResults[selectedIndex].line);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector('[data-selected="true"]');
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-cyber-400 bg-cyber-500/20 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl mx-4 animate-slide-up">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-panel overflow-hidden">
          {/* Header stripe */}
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {/* Search input */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across all config files..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 focus:shadow-glow-cyber transition-all"
              />
              {loading && (
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
                  Enter
                </kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[50vh] overflow-y-auto"
          >
            {error && (
              <div className="p-4 text-red-400 text-sm font-mono flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {!loading && !error && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-mono text-sm">No results found</p>
                <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {query.length < 2 && !loading && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-mono text-sm">Search config files</p>
                <p className="text-slate-600 text-xs mt-1">Type at least 2 characters to search</p>
              </div>
            )}

            {results.map(result => (
              <div key={result.filePath} className="border-b border-slate-800 last:border-b-0">
                {/* File header */}
                <div className="px-4 py-2 bg-slate-850 flex items-center gap-2 sticky top-0">
                  <svg className="w-4 h-4 text-cyber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-mono text-xs text-slate-400 truncate">{result.filePath}</span>
                  <span className="text-2xs text-slate-600 flex-shrink-0">
                    {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Matches */}
                {result.matches.map(match => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={`${result.filePath}:${match.line}`}
                      data-selected={isSelected}
                      onClick={() => handleSelect(result.filePath, match.line)}
                      className={`w-full px-4 py-2 text-left transition-colors flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-cyber-500/10 border-l-2 border-cyber-500'
                          : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                      }`}
                    >
                      <span className={`font-mono text-xs flex-shrink-0 w-8 text-right ${
                        isSelected ? 'text-cyber-400' : 'text-slate-600 group-hover:text-slate-500'
                      }`}>
                        {match.line}
                      </span>
                      <span className={`font-mono text-sm truncate ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}>
                        {highlightMatch(match.content.trim(), query)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                {flatResults.length} result{flatResults.length !== 1 ? 's' : ''} in {results.length} file{results.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 text-2xs">
                  Ctrl+Shift+F
                </kbd>
                to search
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
