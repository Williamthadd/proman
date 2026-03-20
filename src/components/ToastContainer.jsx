import Toast from './Toast'

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
