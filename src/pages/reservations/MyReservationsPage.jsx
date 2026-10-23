// src/pages/reservations/MyReservationsPage.jsx
// HU-6 · 6.3 Mis reservas (estudiante)
// Filtro por estado, cancelación con confirmación y conversión de la reserva
// en solicitud de préstamo cuando se acerca la fecha.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RequestBadge, ConfirmDialog, EmptyState } from '../../components/ui.jsx'
import { misReservas, cancelarReserva, convertirEnSolicitud } from '../../services/reservationsService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DIAS_PARA_CONVERTIR } from '../../shared/constants.js'

const FILTROS = [
  ['', 'todas'],
  ['confirmada', 'confirmadas'],
  ['en_espera', 'en espera'],
  ['cumplida', 'cumplidas'],
  ['cancelada', 'canceladas']
]

export default function MyReservationsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [estado, setEstado] = useState('')
  const [aCancelar, setACancelar] = useState(null)
  const [, setTick] = useState(0)

  const todas = misReservas(user?.id)
  const visibles = misReservas(user?.id, estado)
  const activas = todas.filter((r) => r.estado === 'confirmada').length
  const enEspera = todas.filter((r) => r.estado === 'en_espera').length

  function cancelar() {
    try {
      cancelarReserva(aCancelar.id, user.id)
      toast.success('Reserva cancelada: ' + aCancelar.equipo + ', ' + aCancelar.rango + '.')
    } catch (e) {
      toast.error(e.message || 'No se pudo cancelar la reserva.')
    }
    setACancelar(null)
    setTick((t) => t + 1)
  }

  function convertir(r) {
    try {
      const s = convertirEnSolicitud(r.id, user.id)
      toast.success('Solicitud ' + s.codigo + ' enviada al encargado. La verás en «Mis solicitudes».')
    } catch (e) {
      toast.error(e.message || 'No se pudo convertir la reserva.')
    }
    setTick((t) => t + 1)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis reservas</h1>
          <p className="page-subtitle">
            {activas} {activas === 1 ? 'reserva activa' : 'reservas activas'} · {enEspera} en lista de espera
          </p>
        </div>
        <Link to="/student/calendario" className="btn btn-primary">Nueva reserva</Link>
      </div>

      {todas.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="▤"
            title="No tienes reservas"
            text="Revisa el calendario de ocupación de un equipo y reserva con anticipación."
            action={<Link to="/student/calendario" className="btn btn-primary">Ver calendario</Link>}
          />
        </div>
      ) : (
        <>
          <div className="toolbar">
            <label className="toolbar-select">
              <span>Estado:</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                {FILTROS.map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="card card-flush">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>EQUIPO</th>
                    <th>RANGO</th>
                    <th>ESTADO</th>
                    <th>LISTA DE ESPERA</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.length === 0 && (
                    <tr><td colSpan={5} className="text-muted">No tienes reservas con ese estado.</td></tr>
                  )}
                  {visibles.map((r) => (
                    <tr key={r.id} style={r.estado === 'en_espera' ? { background: '#FBF5E6' } : undefined}>
                      <td className="strong">{r.equipo}</td>
                      <td className="mono">{r.rango}</td>
                      <td><RequestBadge estado={r.estado} /></td>
                      <td>{r.espera || <span className="text-muted">—</span>}</td>
                      <td className="actions">
                        {r.puedeConvertir && (
                          <button type="button" className="btn-link" onClick={() => convertir(r)} style={{ marginRight: 12 }}>
                            Convertir en solicitud
                          </button>
                        )}
                        {r.estado === 'cumplida' && <Link to="/student/solicitudes">Ver detalle</Link>}
                        {(r.estado === 'confirmada' || r.estado === 'en_espera') && (
                          <button type="button" className="btn-link danger" onClick={() => setACancelar(r)}>Cancelar reserva</button>
                        )}
                        {r.estado === 'cancelada' && <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="inline-note">
            Una reserva confirmada se puede convertir en solicitud de préstamo desde {DIAS_PARA_CONVERTIR} días antes de su inicio.
          </p>
        </>
      )}

      {aCancelar && (
        <ConfirmDialog
          title={'¿Cancelar la reserva del ' + aCancelar.rango.replace(' → ', ' al ') + '?'}
          message={aCancelar.estado === 'en_espera'
            ? 'Perderás tu lugar en la lista de espera de «' + aCancelar.equipo + '» (' + aCancelar.espera + ') y los demás avanzarán un puesto.'
            : 'El equipo «' + aCancelar.equipo + '» quedará libre para otros estudiantes.'}
          confirmLabel="Cancelar reserva"
          onConfirm={cancelar}
          onCancel={() => setACancelar(null)}
        />
      )}
    </div>
  )
}
