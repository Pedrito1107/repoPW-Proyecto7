// src/entries/manager.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom'

import { InventoryProvider } from '../context/InventoryContext.jsx'
import { ToastProvider } from '../context/ToastContext.jsx'
import { MetricsProvider } from '../context/MetricsContext.jsx'
import { ManagerLayout } from '../components/layouts.jsx'

import MyAccountPage from '../pages/account/MyAccountPage'
import InventoryPage from '../pages/inventory/InventoryPage'
import EquipmentFormPage from '../pages/inventory/EquipmentFormPage'
import EquipmentDetailPage from '../pages/inventory/EquipmentDetailPage'
import { NotFoundContent } from '../pages/errors/NotFoundPage'

// HU-4 · Aprobación y entrega
import RequestsInboxPage from '../pages/loans/RequestsInboxPage'
import DeliveryPage from '../pages/loans/DeliveryPage'
import DeliveryReceiptPage from '../pages/loans/DeliveryReceiptPage'
import ActiveLoansPage from '../pages/loans/ActiveLoansPage'
// HU-5 · Devoluciones
import ReturnPage from '../pages/returns/ReturnPage'
import StudentHistoryPage from '../pages/returns/StudentHistoryPage'
// HU-6 · Reserva anticipada
import ManagerReservationsPage from '../pages/reservations/ManagerReservationsPage'
import WaitlistPage from '../pages/reservations/WaitlistPage'
// HU-7 · Métricas y usuarios
import MetricsDashboardPage from '../pages/metrics/MetricsDashboardPage'
import RankingPage from '../pages/metrics/RankingPage'
import UsersPage from '../pages/metrics/UsersPage'


function Shell() {
  return (
    <InventoryProvider>
      <MetricsProvider>
        <ManagerLayout>
          <Outlet />
        </ManagerLayout>
      </MetricsProvider>
    </InventoryProvider>
  )
}


function App() {
  return (
    <Routes>

      <Route element={<Shell />}>

        <Route
          path="/manager"
          element={
            <Navigate
              to="/manager/inventario"
              replace
            />
          }
        />

        <Route
          path="/manager/cuenta"
          element={<MyAccountPage />}
        />


        <Route
          path="/manager/inventario"
          element={<InventoryPage />}
        />

        <Route
          path="/manager/inventario/nuevo"
          element={<EquipmentFormPage />}
        />

        <Route
          path="/manager/inventario/:id"
          element={<EquipmentDetailPage />}
        />

        <Route
          path="/manager/inventario/:id/editar"
          element={<EquipmentFormPage />}
        />


        {/* HU-4 · Aprobación y entrega */}
        <Route path="/manager/solicitudes" element={<RequestsInboxPage />} />
        <Route path="/manager/solicitudes/:codigo/entrega" element={<DeliveryPage />} />
        <Route path="/manager/prestamos" element={<ActiveLoansPage />} />
        <Route path="/manager/prestamos/:codigo/constancia" element={<DeliveryReceiptPage />} />
        <Route path="/manager/vencidos" element={<ActiveLoansPage soloVencidos />} />

        {/* HU-5 · Devoluciones */}
        <Route path="/manager/devoluciones" element={<ReturnPage />} />
        <Route path="/manager/devoluciones/:codigo" element={<ReturnPage />} />
        <Route path="/manager/usuarios/:id" element={<StudentHistoryPage />} />

        {/* HU-6 · Reserva anticipada */}
        <Route path="/manager/reservas" element={<ManagerReservationsPage />} />
        <Route path="/manager/lista-espera" element={<WaitlistPage />} />

        {/* HU-7 · Métricas y usuarios */}
        <Route path="/manager/tablero" element={<MetricsDashboardPage />} />
        <Route path="/manager/ranking" element={<RankingPage />} />
        <Route path="/manager/usuarios" element={<UsersPage />} />

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