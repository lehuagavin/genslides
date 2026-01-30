/**
 * Toast notification component
 */

import { cn } from "@/utils";
import { useUIStore, type Toast as ToastType } from "@/stores";

interface ToastItemProps {
  toast: ToastType;
}

function ToastItem({ toast }: ToastItemProps): JSX.Element {
  const { removeToast } = useUIStore();

  const typeStyles = {
    info: "bg-[var(--md-soft-blue)] border-[var(--md-sky)]",
    success: "bg-[var(--md-soft-blue)] border-[var(--md-sky-strong)]",
    warning: "bg-[var(--md-sunbeam)] border-[var(--md-sunbeam-dark)]",
    error: "bg-red-50 border-[var(--md-watermelon)]",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded border-2 border-l-4 p-4 shadow-lg",
        "animate-in slide-in-from-right duration-300",
        typeStyles[toast.type]
      )}
      role="alert"
    >
      <p className="flex-1 text-sm text-[var(--md-ink)]">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[var(--md-slate)] transition-colors hover:text-[var(--md-ink)]"
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer(): JSX.Element {
  const { toasts } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
