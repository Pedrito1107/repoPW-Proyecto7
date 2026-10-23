// src/components/RequireRole.jsx
// Protección de rutas por rol (HU-1):
//  - sin sesión          -> redirige al inicio de sesión (y vuelve después)
//  - con otro rol        -> vista 403 de acceso denegado
//  - con el rol correcto -> muestra la página

import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AccessDeniedPage from '../pages/errors/AccessDeniedPage.jsx'

export default function RequireRole({ role, children }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.replace('/public/login?next=' + next)
    }
  }, [user])

  if (!user) return null
  if (user.rol !== role) return <AccessDeniedPage />
  return children
}
