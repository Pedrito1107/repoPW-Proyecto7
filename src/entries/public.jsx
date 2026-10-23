// src/entries/public.jsx
// App del visitante: landing, acceso, registro, recuperación y ficha pública.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import { AuthProvider } from '../context/AuthContext.jsx'
import { InventoryProvider } from '../context/InventoryContext.jsx'
import { ToastProvider } from '../context/ToastContext.jsx'
import { PublicLayout } from '../components/layouts.jsx'

import LandingPage from '../pages/account/LandingPage'
import LoginPage from '../pages/account/LoginPage'
import RegisterStudentPage from '../pages/account/RegisterStudentPage'
import RegisterManagerPage from '../pages/account/RegisterManagerPage'
import RecoverPasswordPage from '../pages/account/RecoverPasswordPage'
import RulesPage, { HelpPage } from '../pages/account/RulesPage'
import PublicEquipmentPage from '../pages/inventory/PublicEquipmentPage'
import { NotFoundContent } from '../pages/errors/NotFoundPage'

function Shell() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/public" element={<LandingPage />} />
        <Route path="/public/login" element={<LoginPage />} />
        <Route path="/public/register" element={<RegisterStudentPage />} />
        <Route path="/public/register-manager" element={<RegisterManagerPage />} />
        <Route path="/public/recover-password" element={<RecoverPasswordPage />} />
        <Route path="/public/reglas" element={<RulesPage />} />
        <Route path="/public/ayuda" element={<HelpPage />} />
        <Route path="/public/equipos/:id" element={<PublicEquipmentPage />} />
        <Route path="*" element={<NotFoundContent />} />
      </Route>
    </Routes>
  )
}

const container = document.getElementById('root')

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <InventoryProvider>
              <App />
            </InventoryProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
