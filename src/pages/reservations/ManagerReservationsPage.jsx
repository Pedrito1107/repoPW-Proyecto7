// src/pages/reservations/ManagerReservationsPage.jsx
// HU-6 · Reservas del almacén (vista del encargado, menú «Reservas»)
// No tiene mockup propio: sigue el patrón de tabla del panel del encargado.
// Solo lectura: la reserva la convierte en solicitud el propio estudiante.

import { Link } from 'react-router-dom'
import { RequestBadge } from '../../components/ui.jsx'
import { listarReservasAlmacen } from '../../services/reservationsService.js'

export default function ManagerReservationsPage() {
  // Se lee en cada render para ver las reservas nuevas y las canceladas
  const RESERVAS_ALMACEN = listarReservasAlmacen()
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservas</h1>
          <p className="page-subtitle">
            {RESERVAS_ALMACEN.filter((r) => r.estado === 'confirmada').length} reservas confirmadas ·{' '}
            {RESERVAS_ALMACEN.filter((r) => r.estado === 'en_espera').length} en lista de espera ·{' '}
            {RESERVAS_ALMACEN.filter((r) => r.estado === 'cumplida').length} convertida en préstamo
          </p>
        </div>
        <Link to="/manager/lista-espera" className="btn btn-secondary">Ver lista de espera</Link>
      </div>

      <div className="card card-flush">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ESTUDIANTE</th>
                <th>EQUIPO</th>
                <th>RANGO</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {RESERVAS_ALMACEN.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.estudiante}</td>
                  <td>{r.equipo}</td>
                  <td className="mono">{r.rango}</td>
                  <td><RequestBadge estado={r.estado} /></td>
                  <td className="actions">
                    {r.estado === 'en_espera' && <Link to="/manager/lista-espera">Ver cola</Link>}
                    {r.estado === 'confirmada' && <span className="text-muted">Confirmada</span>}
                    {r.estado === 'cumplida' && (r.esPrestamo
                      ? <Link to={'/manager/prestamos/' + r.prestamo + '/constancia'}>Ver préstamo</Link>
                      : <Link to="/manager/solicitudes">Ver solicitud {r.prestamo}</Link>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
