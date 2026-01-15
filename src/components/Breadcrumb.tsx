interface BreadcrumbProps {
  filePath: string | null;
  onNavigate?: (path: string) => void;
}

export default function Breadcrumb({ filePath, onNavigate }: BreadcrumbProps) {
  if (!filePath) return null;

  const parts = filePath.split('/');

  return (
    <nav className="flex items-center gap-1 text-sm font-mono">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const path = parts.slice(0, index + 1).join('/');

        return (
          <span key={path} className="flex items-center gap-1">
            {index > 0 && (
              <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-cyber-500 dark:text-cyber-400 font-medium">{part}</span>
            ) : (
              <button
                onClick={() => onNavigate?.(path)}
                className="text-slate-600 dark:text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 transition-colors"
              >
                {part}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
