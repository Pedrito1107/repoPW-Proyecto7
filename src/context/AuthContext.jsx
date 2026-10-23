// src/context/AuthContext.jsx
// Estado global de la sesión. Cualquier componente obtiene el usuario
// con useAuth() sin tener que pasarlo por props.

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as authService from '../services/authService.js'
import { HOME_BY_ROLE } from '../shared/constants.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // La sesión se recupera al cargar la página (cada entrada de Vite es una página)
  const [user, setUser] = useState(() => authService.getSessionUser())

  // El servidor crea la sesión; la página redirige al panel con la respuesta
  const login = useCallback((correo, password, next) => authService.login(correo, password, next), [])

  // La sesión vive en el servidor: /logout-project la destruye y vuelve a /public
  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    window.location.href = '/logout-project'
  }, [])

  const updateProfile = useCallback(async (data) => {
    const updated = await authService.updateProfile(user.id, data)
    setUser(updated)
    return updated
  }, [user])

  const changePassword = useCallback(
    (actual, nueva, confirmar) => authService.changePassword(user.id, actual, nueva, confirmar),
    [user]
  )

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    homePath: user ? HOME_BY_ROLE[user.rol] : '/public',
    login,
    logout,
    updateProfile,
    changePassword,
    registerStudent: authService.registerStudent,
    registerManager: authService.registerManager,
    requestPasswordReset: authService.requestPasswordReset,
    resetPassword: authService.resetPassword
  }), [user, login, logout, updateProfile, changePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Inicio según la sección en la que se está (cuando no hay sesión)
function homeBySection() {
  const path = window.location.pathname
  if (path.startsWith('/manager')) return '/manager'
  if (path.startsWith('/student')) return '/student'
  return '/public'
}

// Fuera de <AuthProvider> (apps del estudiante y del encargado en la Entrega 1)
// se lee la sesión directamente (window.USER, que envía el servidor),
// sin estado ni re-render.
function authWithoutProvider() {
  const user = authService.getSessionUser()
  return {
    user,
    isAuthenticated: Boolean(user),
    homePath: user ? HOME_BY_ROLE[user.rol] : homeBySection(),
    login: authService.login,
    logout: async () => {
      await authService.logout()
      window.location.href = '/logout-project'
    },
    updateProfile: (data) => authService.updateProfile(user?.id, data),
    changePassword: (actual, nueva, confirmar) =>
      authService.changePassword(user?.id, actual, nueva, confirmar),
    registerStudent: authService.registerStudent,
    registerManager: authService.registerManager,
    requestPasswordReset: authService.requestPasswordReset,
    resetPassword: authService.resetPassword
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context || authWithoutProvider()
}
