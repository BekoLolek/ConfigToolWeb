import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import type { FileInfo } from '../types';
import { fileApi } from '../api/endpoints';
import { toast } from '../stores/toastStore';
import { useServerStore } from '../stores/serverStore';

interface Props {
  serverId: string;
  fileCache: Map<string, FileInfo[]>;
  loadingDirs: Set<string>;
  loadDirectory: (dir: string) => Promise<FileInfo[]>;
  selectedFile: string | null;
  onSelect: (path: string) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  file: FileInfo;
  parentDir: string;
}

interface EditState {
  path: string;
  type: 'rename' | 'new-file' | 'new-folder';
  parentDir: string;
  originalName?: string;
}

// Icons as components
const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const RenameIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function FileTree({ serverId, fileCache, loadingDirs, loadDirectory, selectedFile, onSelect }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ file: FileInfo; parentDir: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const invalidateDirectory = useServerStore((state) => state.invalidateDirectory);

  // Load root directory on mount
  useEffect(() => {
    loadDirectory('plugins/');
  }, [serverId]);

  // Focus input when edit state changes
  useEffect(() => {
    if (editState && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editState]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setEditState(null);
        setDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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

  const handleContextMenu = (e: React.MouseEvent, file: FileInfo, parentDir: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file, parentDir });
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Name cannot be empty';
    if (/[<>:"/\\|?*]/.test(name)) return 'Name contains invalid characters';
    if (name.startsWith('.') || name.startsWith(' ')) return 'Name cannot start with dot or space';
    return null;
  };

  const getParentDir = (path: string): string => {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return parts.length > 0 ? parts.join('/') + '/' : 'plugins/';
  };

  const handleCreate = async (name: string, isDirectory: boolean, parentDir: string) => {
    const error = validateName(name);
    if (error) {
      toast.error(error);
      return;
    }

    const newPath = `${parentDir}${name}${isDirectory ? '/' : ''}`;

    try {
      await fileApi.createFile(serverId, newPath, isDirectory);
      toast.success(`${isDirectory ? 'Folder' : 'File'} created successfully`);
      invalidateDirectory(parentDir);
      await loadDirectory(parentDir);
      setEditState(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create';
      toast.error(message);
    }
  };

  const handleRename = async (oldPath: string, newName: string, parentDir: string) => {
    const error = validateName(newName);
    if (error) {
      toast.error(error);
      return;
    }

    const isDir = oldPath.endsWith('/');
    const newPath = `${parentDir}${newName}${isDir ? '/' : ''}`;

    if (oldPath === newPath) {
      setEditState(null);
      return;
    }

    try {
      await fileApi.renameFile(serverId, oldPath, newPath);
      toast.success('Renamed successfully');
      invalidateDirectory(parentDir);
      await loadDirectory(parentDir);
      setEditState(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to rename';
      toast.error(message);
    }
  };

  const handleDelete = async (file: FileInfo, parentDir: string) => {
    try {
      await fileApi.deleteFile(serverId, file.path);
      toast.success(`${file.isDirectory ? 'Folder' : 'File'} deleted successfully`);
      invalidateDirectory(parentDir);
      await loadDirectory(parentDir);
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(message);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: EditState['type'], parentDir: string, originalPath?: string) => {
    if (e.key === 'Enter') {
      const name = e.currentTarget.value.trim();
      if (type === 'rename' && originalPath) {
        handleRename(originalPath, name, parentDir);
      } else if (type === 'new-file') {
        handleCreate(name, false, parentDir);
      } else if (type === 'new-folder') {
        handleCreate(name, true, parentDir);
      }
    } else if (e.key === 'Escape') {
      setEditState(null);
    }
  };

  const startNewFile = useCallback((parentDir: string) => {
    setContextMenu(null);
    // Expand the parent directory
    setExpanded(prev => new Set(prev).add(parentDir));
    setEditState({ path: '', type: 'new-file', parentDir });
  }, []);

  const startNewFolder = useCallback((parentDir: string) => {
    setContextMenu(null);
    setExpanded(prev => new Set(prev).add(parentDir));
    setEditState({ path: '', type: 'new-folder', parentDir });
  }, []);

  const startRename = useCallback((file: FileInfo, parentDir: string) => {
    setContextMenu(null);
    const name = file.isDirectory ? file.name : file.name;
    setEditState({ path: file.path, type: 'rename', parentDir, originalName: name });
  }, []);

  const startDelete = useCallback((file: FileInfo, parentDir: string) => {
    setContextMenu(null);
    setDeleteConfirm({ file, parentDir });
  }, []);

  const renderEditInput = (parentDir: string, depth: number, defaultValue: string = '') => (
    <div
      className="flex items-center gap-2 px-2 py-1.5"
      style={{ paddingLeft: depth * 12 + 8 }}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {editState?.type === 'new-folder' ? (
          <FolderIcon className="w-4 h-4 text-cyber-400" />
        ) : editState?.type === 'rename' && editState.path.endsWith('/') ? (
          <FolderIcon className="w-4 h-4 text-cyber-400" />
        ) : (
          <FileIcon className="w-4 h-4 text-slate-400" />
        )}
      </span>
      <input
        ref={editInputRef}
        type="text"
        defaultValue={defaultValue}
        onKeyDown={(e) => handleEditKeyDown(e, editState!.type, parentDir, editState?.path)}
        onBlur={() => setEditState(null)}
        className="flex-1 bg-slate-800 border border-cyber-500/50 rounded px-2 py-0.5 text-sm font-mono text-white focus:outline-none focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50"
        placeholder={editState?.type === 'new-folder' ? 'folder name' : 'filename.yml'}
      />
    </div>
  );

  const renderFile = (file: FileInfo, depth: number, parentDir: string): JSX.Element => {
    const editable = /\.(ya?ml|json)$/i.test(file.name);
    const isSelected = selectedFile === file.path;
    const isJson = file.name.endsWith('.json');
    const isYaml = /\.ya?ml$/i.test(file.name);
    const isEditing = editState?.path === file.path && editState?.type === 'rename';

    if (isEditing) {
      return (
        <div key={file.path}>
          {renderEditInput(parentDir, depth, editState.originalName)}
        </div>
      );
    }

    return (
      <button
        key={file.path}
        onClick={() => editable && onSelect(file.path)}
        onContextMenu={(e) => handleContextMenu(e, file, parentDir)}
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

  const renderDir = (file: FileInfo, depth: number, parentDir: string): JSX.Element => {
    const isOpen = expanded.has(file.path);
    const isLoading = loadingDirs.has(file.path);
    const children = fileCache.get(file.path) || [];
    const isEditing = editState?.path === file.path && editState?.type === 'rename';
    const isCreatingInThisDir = editState && editState.parentDir === file.path && (editState.type === 'new-file' || editState.type === 'new-folder');

    if (isEditing) {
      return (
        <div key={file.path}>
          {renderEditInput(parentDir, depth, editState.originalName)}
        </div>
      );
    }

    return (
      <div key={file.path}>
        <button
          onClick={() => toggle(file.path)}
          onContextMenu={(e) => handleContextMenu(e, file, parentDir)}
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
            {/* Show new file/folder input at top if creating in this directory */}
            {isCreatingInThisDir && renderEditInput(file.path, depth + 1, '')}
            {children
              .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
              .map(c => c.isDirectory ? renderDir(c, depth + 1, file.path) : renderFile(c, depth + 1, file.path))}
            {children.length === 0 && !isLoading && !isCreatingInThisDir && (
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
  const isCreatingInRoot = editState && editState.parentDir === 'plugins/' && (editState.type === 'new-file' || editState.type === 'new-folder');

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

  if (rootFiles.length === 0 && !isCreatingInRoot) {
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
    <div className="p-2 relative">
      {/* Show new file/folder input at top of root if creating there */}
      {isCreatingInRoot && renderEditInput('plugins/', 0, '')}

      {rootFiles
        .sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1)
        .map(f => f.isDirectory ? renderDir(f, 0, 'plugins/') : renderFile(f, 0, 'plugins/'))}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[160px] bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 py-1 animate-fade-in"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {contextMenu.file.isDirectory && (
            <>
              <button
                onClick={() => startNewFile(contextMenu.file.path)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <FileIcon className="w-4 h-4 text-slate-500" />
                <span>New File</span>
              </button>
              <button
                onClick={() => startNewFolder(contextMenu.file.path)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <FolderIcon className="w-4 h-4 text-slate-500" />
                <span>New Folder</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
            </>
          )}
          <button
            onClick={() => startRename(contextMenu.file, contextMenu.parentDir)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RenameIcon className="w-4 h-4 text-slate-500" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => startDelete(contextMenu.file, contextMenu.parentDir)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <DeleteIcon className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 p-4 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <DeleteIcon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Delete {deleteConfirm.file.isDirectory ? 'Folder' : 'File'}</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Are you sure you want to delete <span className="font-mono text-cyber-400">{deleteConfirm.file.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.file, deleteConfirm.parentDir)}
                className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded transition-colors border border-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
