import { useCallback, useEffect, useRef, useState } from 'react'

export default function useToast() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timeouts = useRef(new Map())

  const removeToast = useCallback((id) => {
    const timeoutId = timeouts.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeouts.current.delete(id)
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    )
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${nextId.current}`
    nextId.current += 1

    setToasts((currentToasts) => [...currentToasts, { id, message, type }])

    const timeoutId = window.setTimeout(() => {
      removeToast(id)
    }, 3000)

    timeouts.current.set(id, timeoutId)
  }, [removeToast])

  useEffect(() => {
    const activeTimeouts = timeouts.current

    return () => {
      activeTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      activeTimeouts.clear()
    }
  }, [])

  return { toasts, addToast, removeToast }
}
