// src/entries/student.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom'

import { ToastProvider } from '../context/ToastContext.jsx'
import { StudentLayout } from '../components/layouts.jsx'

import MyAccountPage from '../pages/account/MyAccountPage'
import { NotFoundContent } from '../pages/errors/NotFoundPage'

// HU-3 · Catálogo y solicitud
import CatalogPage from '../pages/catalog/CatalogPage'
import EquipmentDetailPage from '../pages/catalog/EquipmentDetailPage'
import RequestFormPage from '../pages/catalog/RequestFormPage'
import MyRequestsPage from '../pages/catalog/MyRequestsPage'
// HU-4 · Constancia (consultable por el estudiante)
import DeliveryReceiptPage from '../pages/loans/DeliveryReceiptPage'
// HU-6 · Reserva anticipada
import CalendarPage from '../pages/reservations/CalendarPage'
import MyReservationsPage from '../pages/reservations/MyReservationsPage'


function Shell() {
  return (
    <StudentLayout>

      <Outlet />

    </StudentLayout>
  )
}


function App() {
  return (

    <Routes>

      <Route element={<Shell />}>

        <Route
          path="/student"
          element={
            <Navigate
              to="/student/catalogo"
              replace
            />
          }
        />


        <Route
          path="/student/cuenta"
          element={<MyAccountPage />}
        />


        {/* HU-3 · Catálogo y solicitud */}
        <Route path="/student/catalogo" element={<CatalogPage base="/student" />} />
        <Route path="/student/equipos/:id" element={<EquipmentDetailPage />} />
        <Route path="/student/solicitar/:id" element={<RequestFormPage />} />
        <Route path="/student/solicitudes" element={<MyRequestsPage />} />

        {/* HU-4 · Constancia de entrega (vista del estudiante) */}
        <Route
          path="/student/prestamos/:codigo/constancia"
          element={<DeliveryReceiptPage volver="/student/solicitudes" volverLabel="Mis solicitudes" soloPropias />}
        />

        {/* HU-6 · Reserva anticipada */}
        <Route path="/student/calendario" element={<CalendarPage />} />
        <Route path="/student/reservas" element={<MyReservationsPage />} />


        <Route
          path="*"
          element={<NotFoundContent />}
        />

      </Route>

    </Routes>

  )
}


const container =
  document.getElementById('root')


if (container) {

  ReactDOM
    .createRoot(container)
    .render(

      <React.StrictMode>

        <BrowserRouter>

          <ToastProvider>

            <App />

          </ToastProvider>

        </BrowserRouter>

      </React.StrictMode>

    )

}