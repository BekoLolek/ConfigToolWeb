import { useState } from 'react';
import type { FileInfo } from '../types';

interface Props { files: FileInfo[]; selectedFile: string | null; onSelect: (path: string) => void; }

export default function FileTree({ files, selectedFile, onSelect }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['plugins/']));

  const toggle = (path: string) => setExpanded(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n; });

  const tree = new Map<string, FileInfo[]>();
  files.forEach(f => { const p = f.path.split('/').slice(0, -1).join('/') + '/'; if (!tree.has(p)) tree.set(p, []); tree.get(p)!.push(f); });

  const render = (file: FileInfo, depth = 0): JSX.Element => {
    const editable = /\.(ya?ml|json)$/i.test(file.name);
    if (file.isDirectory) {
      const open = expanded.has(file.path);
      const children = tree.get(file.path) || [];
      return (
        <div key={file.path}>
          <button onClick={() => toggle(file.path)} className="w-full flex items-center gap-2 px-2 py-1 text-left text-gray-300 hover:bg-gray-700 rounded" style={{ paddingLeft: depth * 12 + 8 }}>
            <span className={`text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
            <span className="text-yellow-500">📁</span>
            <span className="truncate text-sm">{file.name}</span>
          </button>
          {open && children.sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1).map(c => render(c, depth + 1))}
        </div>
      );
    }
    return (
      <button key={file.path} onClick={() => editable && onSelect(file.path)} disabled={!editable}
        className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded ${selectedFile === file.path ? 'bg-blue-600/30 text-blue-300' : editable ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
        style={{ paddingLeft: depth * 12 + 28 }}>
        <span className="text-sm">📄</span>
        <span className="truncate text-sm">{file.name}</span>
      </button>
    );
  };

  if (files.length === 0) return <div className="p-4 text-sm text-gray-500 text-center">No files</div>;
  const root = tree.get('plugins/') || files.filter(f => f.path.split('/').length === 2);
  return <div className="p-2">{root.sort((a, b) => a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1).map(f => render(f))}</div>;
}
