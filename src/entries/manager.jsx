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

import { ToastProvider } from '../context/ToastContext.jsx'
import { ManagerLayout } from '../components/layouts.jsx'

import MyAccountPage from '../pages/account/MyAccountPage'
import { NotFoundContent } from '../pages/errors/NotFoundPage'


function Shell() {
  return (
    <ManagerLayout>
      <Outlet />
    </ManagerLayout>
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
              to="/manager/cuenta"
              replace
            />
          }
        />

        <Route
          path="/manager/cuenta"
          element={<MyAccountPage />}
        />


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