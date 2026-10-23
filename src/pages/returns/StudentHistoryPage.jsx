// src/pages/returns/StudentHistoryPage.jsx
// HU-5 · 5.4 Historial del estudiante · 5.5 Aviso de deuda pendiente
// (También es la ficha de detalle que abre «Ver historial» en Usuarios, HU-7.)
// Los datos del estudiante, su historial de préstamos y el bloqueo /
// desbloqueo vienen de HU-7 (MetricsContext). «Registrar pago» es de HU-5
// y aún no cambia nada.

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge, StatCard, EmptyState, Spinner } from '../../components/ui.jsx'
import { BlockModal } from '../metrics/BlockModal.jsx'
import { useMetrics } from '../../context/MetricsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money, dateOnly, dateTime, plural } from '../../shared/format.js'

function devolucionTexto(h) {
  if (h.estado === 'devuelta') return dateOnly(h.devolucion)
  return (h.vencido ? 'vencido · ' : 'en curso · vence ') + dateOnly(h.vence)
}

export default function StudentHistoryPage() {
  const { id } = useParams()
  const { getEstudiante, bloquearCuenta, desbloquearCuenta, version } = useMetrics()
  const toast = useToast()
  const [e, setE] = useState(null)
  const [noExiste, setNoExiste] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let vigente = true
    setNoExiste(false)
    getEstudiante(id)
      .then((d) => { if (vigente) setE(d) })
      .catch(() => { if (vigente) setNoExiste(true) })
    return () => { vigente = false }
  }, [id, version, getEstudiante])

  if (noExiste) {
    return (
      <div className="page">
        <h1 className="page-title">Historial del estudiante</h1>
        <div className="card">
          <EmptyState
            title="No encontramos a este estudiante"
            text="Puede que el enlace sea incorrecto o que la cuenta ya no exista."
            action={<Link to="/manager/usuarios" className="btn btn-primary">Ir a usuarios</Link>}
          />
        </div>
      </div>
    )
  }

  if (!e || e.id !== id) return <div className="page"><Spinner /></div>

  const bloqueado = e.estado === 'bloqueado'

  async function onConfirm(datos) {
    if (modal === 'desbloquear') {
      const r = await desbloquearCuenta(e.id, datos)
      toast.success('Cuenta desbloqueada. Su estado ahora es «' + r.estadoLabel + '».')
    } else {
      await bloquearCuenta(e.id, datos)
      toast.success('Cuenta bloqueada. El motivo quedó registrado en su historial.')
    }
    setModal(null)
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/usuarios">Usuarios</Link> / Estudiantes / {e.nombre}
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
          {bloqueado
            ? <button type="button" className="btn btn-primary" onClick={() => setModal('desbloquear')}>Desbloquear cuenta</button>
            : <button type="button" className="btn btn-danger" onClick={() => setModal('bloquear')}>Bloquear cuenta</button>}
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

      <section className="card">
        <h2 className="card-title">Bloqueos de la cuenta</h2>
        {e.bloqueos.length === 0 ? (
          <p className="text-muted" style={{ margin: 0 }}>La cuenta no tiene bloqueos registrados.</p>
        ) : (
          <ul className="block-log">
            {e.bloqueos.map((b) => (
              <li key={b.id}>
                <span className="mono">{dateTime(b.fecha)}</span>
                <span>
                  <span className={'badge ' + (b.accion === 'bloqueo' ? 'badge-danger' : 'badge-success')}>
                    {b.accion === 'bloqueo' ? 'Bloqueo' : 'Desbloqueo'}
                  </span>
                </span>
                <span>
                  <strong>{b.motivo}.</strong> {b.detalle}
                  <span className="cell-sub"> · {b.encargado}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <BlockModal
          usuario={e.nombre}
          desbloquear={modal === 'desbloquear'}
          onClose={() => setModal(null)}
          onConfirm={onConfirm}
        />
      )}
    </div>
  )
}
