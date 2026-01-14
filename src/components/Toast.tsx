import { useToastStore, type ToastType } from '../stores/toastStore';

// Icons for each toast type
const icons: Record<ToastType, JSX.Element> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Style configurations for each toast type
const typeStyles: Record<ToastType, { border: string; icon: string; glow: string }> = {
  success: {
    border: 'border-l-status-online',
    icon: 'text-status-online',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  },
  error: {
    border: 'border-l-status-error',
    icon: 'text-status-error',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  },
  warning: {
    border: 'border-l-status-warning',
    icon: 'text-status-warning',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  },
  info: {
    border: 'border-l-cyber-500',
    icon: 'text-cyber-500',
    glow: 'shadow-[0_0_15px_rgba(12,184,196,0.3)]',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const styles = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              animate-slide-up
              flex items-start gap-3
              min-w-[320px] max-w-[420px]
              px-4 py-3
              bg-slate-850
              border border-slate-700 border-l-4 ${styles.border}
              rounded-lg
              ${styles.glow}
              backdrop-blur-sm
            `}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 ${styles.icon}`}>
              {icons[toast.type]}
            </div>

            {/* Message */}
            <p className="flex-1 text-sm text-slate-200 font-body leading-relaxed">
              {toast.message}
            </p>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-slate-500 hover:text-white transition-colors rounded hover:bg-slate-700"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
