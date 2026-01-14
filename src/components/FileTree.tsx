import { useState, useEffect } from 'react';
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
  useEffect(() => { loadDirectory('plugins/'); }, [serverId]);

  const toggle = async (path: string) => {
    const isExpanded = expanded.has(path);
    if (!isExpanded) {
      // Load directory contents when expanding
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
    return (
      <button
        key={file.path}
        onClick={() => editable && onSelect(file.path)}
        disabled={!editable}
        className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded ${selectedFile === file.path ? 'bg-blue-600/30 text-blue-300' : editable ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <span className="text-sm">📄</span>
        <span className="truncate text-sm">{file.name}</span>
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
          className="w-full flex items-center gap-2 px-2 py-1 text-left text-gray-300 hover:bg-gray-700 rounded"
          style={{ paddingLeft: depth * 16 + 8 }}
        >
          <span className={`text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          <span className="text-yellow-500">📁</span>
          <span className="truncate text-sm">{file.name}</span>
          {isLoading && <span className="text-xs text-gray-500 ml-auto">...</span>}
        </button>
        {isOpen && (
          <div>
            {children
              .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
              .map(c => c.isDirectory ? renderDir(c, depth + 1) : renderFile(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFiles = fileCache.get('plugins/') || [];
  const isRootLoading = loadingDirs.has('plugins/');

  if (isRootLoading && rootFiles.length === 0) {
    return <div className="p-4 text-sm text-gray-500 text-center">Loading...</div>;
  }

  if (rootFiles.length === 0) {
    return <div className="p-4 text-sm text-gray-500 text-center">No files</div>;
  }

  return (
    <div className="p-2">
      {rootFiles
        .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
        .map(f => f.isDirectory ? renderDir(f, 0) : renderFile(f, 0))}
    </div>
  );
}
