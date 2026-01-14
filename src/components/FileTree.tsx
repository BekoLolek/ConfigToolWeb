import { useState, useEffect } from 'react';
import clsx from 'clsx';
import type { FileInfo } from '../types';

interface Props {
  serverId: string;
  fileCache: Map<string, FileInfo[]>;
  loadingDirs: Set<string>;
  loadDirectory: (dir: string) => Promise<FileInfo[]>;
  selectedFile: string | null;
  onSelect: (path: string) => void;
}

export default function FileTree({ serverId, fileCache, loadingDirs, loadDirectory, selectedFile, onSelect }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Load root directory on mount
  useEffect(() => {
    loadDirectory('plugins/');
  }, [serverId]);

  const toggle = async (path: string) => {
    const isExpanded = expanded.has(path);
    if (!isExpanded) {
      await loadDirectory(path);
    }
    setExpanded(prev => {
      const n = new Set(prev);
      isExpanded ? n.delete(path) : n.add(path);
      return n;
    });
  };

  const renderFile = (file: FileInfo, depth: number): JSX.Element => {
    const editable = /\.(ya?ml|json)$/i.test(file.name);
    const isSelected = selectedFile === file.path;
    const isJson = file.name.endsWith('.json');
    const isYaml = /\.ya?ml$/i.test(file.name);

    return (
      <button
        key={file.path}
        onClick={() => editable && onSelect(file.path)}
        disabled={!editable}
        className={clsx(
          'w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md transition-all duration-150 group',
          isSelected
            ? 'bg-cyber-500/10 text-cyber-400 border border-cyber-500/30'
            : editable
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
              : 'text-slate-600 cursor-not-allowed border border-transparent opacity-50'
        )}
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        {/* File type icon */}
        <span className={clsx(
          'flex-shrink-0 w-4 h-4 flex items-center justify-center text-2xs font-mono font-bold rounded',
          isSelected
            ? 'bg-cyber-500/20 text-cyber-400'
            : isJson
              ? 'bg-amber-500/10 text-amber-500'
              : isYaml
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-slate-700 text-slate-500'
        )}>
          {isJson ? 'J' : isYaml ? 'Y' : '?'}
        </span>
        <span className="truncate text-sm font-mono">{file.name}</span>
        {isSelected && (
          <svg className="w-3 h-3 ml-auto text-cyber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </button>
    );
  };

  const renderDir = (file: FileInfo, depth: number): JSX.Element => {
    const isOpen = expanded.has(file.path);
    const isLoading = loadingDirs.has(file.path);
    const children = fileCache.get(file.path) || [];

    return (
      <div key={file.path}>
        <button
          onClick={() => toggle(file.path)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-all duration-150 group"
          style={{ paddingLeft: depth * 12 + 8 }}
        >
          {/* Chevron */}
          <svg
            className={clsx(
              'w-3 h-3 text-slate-600 transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-90'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {/* Folder icon */}
          <svg
            className={clsx(
              'w-4 h-4 flex-shrink-0 transition-colors',
              isOpen ? 'text-cyber-400' : 'text-slate-500 group-hover:text-slate-400'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            )}
          </svg>
          <span className="truncate text-sm font-medium">{file.name}</span>
          {isLoading && (
            <svg className="w-3 h-3 ml-auto text-slate-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </button>
        {isOpen && (
          <div className="animate-slide-up">
            {children
              .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
              .map(c => c.isDirectory ? renderDir(c, depth + 1) : renderFile(c, depth + 1))}
            {children.length === 0 && !isLoading && (
              <div
                className="px-2 py-1.5 text-slate-600 text-xs font-mono"
                style={{ paddingLeft: (depth + 1) * 12 + 8 }}
              >
                Empty folder
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const rootFiles = fileCache.get('plugins/') || [];
  const isRootLoading = loadingDirs.has('plugins/');

  if (isRootLoading && rootFiles.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  if (rootFiles.length === 0) {
    return (
      <div className="p-4 text-center">
        <svg className="w-8 h-8 mx-auto text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-slate-600 text-xs font-mono uppercase tracking-wider">No files found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {rootFiles
        .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
        .map(f => f.isDirectory ? renderDir(f, 0) : renderFile(f, 0))}
    </div>
  );
}
