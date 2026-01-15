import { useRef, useState } from 'react';
import { fileApi } from '../api/endpoints';
import { useServerStore } from '../stores/serverStore';

interface FileUploadProps {
  serverId: string;
  currentDirectory: string;
  onUploadComplete: () => void;
}

export default function FileUpload({ serverId, currentDirectory, onUploadComplete }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { invalidateDirectory } = useServerStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        // Validate file extension
        const ext = file.name.toLowerCase();
        if (!ext.endsWith('.yml') && !ext.endsWith('.yaml') && !ext.endsWith('.json')) {
          setError('Only .yml, .yaml, and .json files are allowed');
          continue;
        }

        // Validate file size (1MB limit)
        if (file.size > 1024 * 1024) {
          setError('File size must be under 1MB');
          continue;
        }

        // Read file content
        const content = await file.text();

        // Construct path
        const path = currentDirectory
          ? `${currentDirectory}/${file.name}`
          : `plugins/${file.name}`;

        // Upload using save endpoint
        await fileApi.save(serverId, path, content, `Uploaded ${file.name}`, false);
      }

      // Refresh directory listing
      invalidateDirectory(currentDirectory || 'plugins');
      onUploadComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".yml,.yaml,.json"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-2 py-1 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all disabled:opacity-50"
        title="Upload config file"
      >
        {uploading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        <span className="hidden sm:inline">Upload</span>
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
