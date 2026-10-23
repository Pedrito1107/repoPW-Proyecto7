// src/pages/returns/StudentHistoryPage.jsx
// HU-5 · 5.4 Historial del estudiante · 5.5 Aviso de deuda pendiente
// Los datos del estudiante y su historial de préstamos salen del seed con
// usersService.getEstudiante. «Registrar pago» es de HU-5 y aún no cambia nada.

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge, StatCard, EmptyState, Spinner } from '../../components/ui.jsx'
import { getEstudiante } from '../../services/usersService.js'
import { money, dateOnly, plural } from '../../shared/format.js'

function devolucionTexto(h) {
  if (h.estado === 'devuelta') return dateOnly(h.devolucion)
  return (h.vencido ? 'vencido · ' : 'en curso · vence ') + dateOnly(h.vence)
}

export default function StudentHistoryPage() {
  const { id } = useParams()
  const [e, setE] = useState(null)
  const [noExiste, setNoExiste] = useState(false)

  useEffect(() => {
    let vigente = true
    setNoExiste(false)
    getEstudiante(id)
      .then((d) => { if (vigente) setE(d) })
      .catch(() => { if (vigente) setNoExiste(true) })
    return () => { vigente = false }
  }, [id])

  if (noExiste) {
    return (
      <div className="page">
        <h1 className="page-title">Historial del estudiante</h1>
        <div className="card">
          <EmptyState
            title="No encontramos a este estudiante"
            text="Puede que el enlace sea incorrecto o que la cuenta ya no exista."
            action={<Link to="/manager/prestamos" className="btn btn-primary">Ir a préstamos vigentes</Link>}
          />
        </div>
      </div>
    )
  }

  if (!e || e.id !== id) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/prestamos">Préstamos vigentes</Link> / Historial del estudiante / {e.nombre}
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{e.nombre}</h1>
          <p className="page-subtitle">
            {e.carrera} · {e.ciclo}.º ciclo · código {e.codigo} · {e.correo}
          </p>
        </div>
        <div className="page-header-actions">
          {e.deuda > 0 && <button type="button" className="btn btn-secondary">Registrar pago</button>}
        </div>
      </div>

      {/* Aviso de deuda (HU-5): días de retraso del préstamo que la generó y,
          para Camila, el accesorio faltante del mockup 5.1 */}
      {e.deuda > 0 && (
        <div className="alert alert-warning">
          <strong>Aviso de deuda pendiente.</strong>{' '}
          {money(e.deuda)}
          {e.prestamoDeuda && (
            <>
              {' '}por {e.diasRetraso ? plural(e.diasRetraso, 'día', 'días') + ' de retraso en' : 'el préstamo'}{' '}
              <span className="mono">{e.prestamoDeuda}</span>
            </>
          )}
          {e.id === 'u2' && <>, más 1 accesorio faltante por valorizar</>}
          . No puede solicitar equipos.
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="PRÉSTAMOS" value={e.prestamos} hint={e.prestamosVigentes ? plural(e.prestamosVigentes, 'en curso', 'en curso') : null} />
        <StatCard label="RETRASOS ACUMULADOS" value={e.retrasos} tone={e.retrasos ? 'danger' : ''} />
        <StatCard label="PENALIDADES" value={money(e.deuda)} tone={e.deuda ? 'warning' : ''} />
        <div className="card stat-card">
          <span className="section-label">ESTADO</span>
          <div style={{ marginTop: 8 }}><StatusBadge estado={e.estado} /></div>
        </div>
      </div>

      <div className="card card-flush">
        {e.historial.length === 0 ? (
          <EmptyState
            title="Sin préstamos registrados"
            text="Cuando el estudiante tenga préstamos, aparecerán aquí con sus retrasos y penalidades."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>PRÉSTAMO</th>
                  <th>EQUIPO Y UNIDAD</th>
                  <th>ENTREGA</th>
                  <th>DEVOLUCIÓN</th>
                  <th>RETRASO</th>
                  <th>PENALIDAD</th>
                </tr>
              </thead>
              <tbody>
                {e.historial.map((h) => {
                  // La deuda de un préstamo vencido aún sin devolver figura en el usuario
                  const penalidad = h.penalidad || (h.codigo === e.prestamoDeuda ? e.deuda : 0)
                  const pagada = h.penalidad ? h.penalidadPagada : false
                  return (
                    <tr key={h.codigo}>
                      <td className="mono">{h.codigo}</td>
                      <td>{h.equipo} · <span className="mono">{h.unidad}</span></td>
                      <td className="mono">{dateOnly(h.entrega)}</td>
                      <td className={'mono ' + (h.vencido ? 'text-danger' : '')}>{devolucionTexto(h)}</td>
                      <td className={h.retraso ? 'text-danger strong' : 'text-muted'}>{h.retraso ? h.retraso + ' d' : '—'}</td>
                      <td>
                        {penalidad
                          ? <>{money(penalidad)} {pagada ? <span className="badge badge-success">pagada</span> : <span className="badge badge-danger">pendiente</span>}</>
                          : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
