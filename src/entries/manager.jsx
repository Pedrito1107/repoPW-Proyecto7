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


function Shell() {
  return (
    <InventoryProvider>
      <ManagerLayout>
        <Outlet />
      </ManagerLayout>
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