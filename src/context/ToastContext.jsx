// src/context/ToastContext.jsx
// Notificaciones de resultado: toda operación de escritura avisa si
// funcionó o falló.

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, type, message }])
    setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const value = useMemo(() => ({
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    info: (message) => notify('info', message)
  }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast toast-' + t.type}>
            <span>{t.message}</span>
            <button type="button" aria-label="Cerrar" onClick={() => dismiss(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return context
}
