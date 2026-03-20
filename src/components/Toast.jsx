import { X } from 'lucide-react'

const TOAST_STYLES = {
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/70 dark:text-green-100',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/70 dark:text-red-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/70 dark:text-blue-100',
}

export default function Toast({ toast, onClose }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${TOAST_STYLES[toast.type] ?? TOAST_STYLES.info}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-6">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
