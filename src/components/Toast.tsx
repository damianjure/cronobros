import { useEffect, type CSSProperties } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const AUTO_DISMISS_MS = 3500;

/**
 * Renders in-app notification feedback, replacing `alert()` calls across the
 * app (spec: ux-anti-patterns domain). Mounted once at the App root.
 */
export default function Toast() {
  const toasts = useToastStore(state => state.toasts);
  const dismissToast = useToastStore(state => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(toast => setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[70] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(toast => (
        <md-elevated-card
          key={toast.id}
          role="status"
          aria-live="polite"
          style={
            {
              display: 'flex',
              '--md-elevated-card-container-color': 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              pointerEvents: 'auto',
            } as CSSProperties
          }
          className="px-5 py-3 items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-xs">{toast.message}</span>
        </md-elevated-card>
      ))}
    </div>
  );
}
