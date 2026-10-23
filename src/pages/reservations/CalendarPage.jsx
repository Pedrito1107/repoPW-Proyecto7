// src/pages/reservations/CalendarPage.jsx
// HU-6 · 6.1 Calendario de ocupación · 6.2 Modal de reserva
// Elige un equipo, navega por meses y marca un rango con dos clics.
// Los días libres, prestados y reservados salen de reservationsService.

import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui.jsx'
import ReservationModal from './ReservationModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  calendarioDe, listarEquiposReservables, unidadesLibresEnRango,
  unidadesComprometidasHoy, diasDelRango
} from '../../services/reservationsService.js'
import { getAll } from '../../services/db.js'
import { FECHA_CORTE } from '../../shared/constants.js'
import { dateOnly } from '../../shared/format.js'

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function CalendarPage() {
  const { user } = useAuth()
  const equipos = useMemo(() => listarEquiposReservables(), [])
  // ?equipo=e5 (desde «Reservar» en el detalle del equipo, HU-3); si no, el osciloscopio
  const [params] = useSearchParams()
  const pedido = params.get('equipo')
  const [equipoId, setEquipoId] = useState(
    equipos.find((e) => e.id === pedido)?.id || equipos.find((e) => e.id === 'e1')?.id || equipos[0]?.id
  )
  const [anio, setAnio] = useState(Number(FECHA_CORTE.slice(0, 4)))
  const [mes, setMes] = useState(Number(FECHA_CORTE.slice(5, 7)))
  // { desde, hasta, abierto }: abierto = ya se marcó el inicio y falta el fin
  const [sel, setSel] = useState(null)
  const [reservar, setReservar] = useState(false)
  const [, setTick] = useState(0)

  const equipo = equipos.find((e) => e.id === equipoId)
  const total = getAll('unidades').filter((u) => u.equipoId === equipoId && u.estado !== 'baja').length
  const celdas = calendarioDe(equipoId, anio, mes, sel)
  const libres = sel ? unidadesLibresEnRango(equipoId, sel.desde, sel.hasta) : null

  function cambiarMes(delta) {
    const d = new Date(anio, mes - 1 + delta, 1)
    setAnio(d.getFullYear())
    setMes(d.getMonth() + 1)
  }

  function cambiarEquipo(id) {
    setEquipoId(id)
    setSel(null)
  }

  // 1.er clic: inicio · 2.º clic: fin (se ordenan solas) · 3.er clic: vuelve a empezar
  function clicDia(c) {
    if (c.out || !c.seleccionable) return
    if (!sel || !sel.abierto) setSel({ desde: c.fecha, hasta: c.fecha, abierto: true })
    else setSel({ desde: c.fecha < sel.desde ? c.fecha : sel.desde, hasta: c.fecha < sel.desde ? sel.desde : c.fecha, abierto: false })
  }

  const empiezaHoy = sel && sel.desde === FECHA_CORTE
  const futuro = sel && sel.desde > FECHA_CORTE
  const comprometidas = unidadesComprometidasHoy(equipoId)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario de ocupación</h1>
          <p className="page-subtitle">{equipo?.nombre} · {total} unidades</p>
        </div>
        <label className="toolbar-select">
          <span>Equipo:</span>
          <select value={equipoId} onChange={(e) => cambiarEquipo(e.target.value)}>
            {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </label>
      </div>

      <div className="calendar-layout">
        <section className="card">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div className="calendar-nav">
              <button type="button" className="btn btn-secondary" aria-label="Mes anterior" onClick={() => cambiarMes(-1)}>‹</button>
              <strong>{MESES[mes - 1]} {anio}</strong>
              <button type="button" className="btn btn-secondary" aria-label="Mes siguiente" onClick={() => cambiarMes(1)}>›</button>
            </div>
          </div>

          <div className="calendar">
            {DOW.map((d) => <div key={d} className="calendar-dow">{d}</div>)}
            {celdas.map((d, i) => (
              <div
                key={i}
                role={d.seleccionable ? 'button' : undefined}
                tabIndex={d.seleccionable ? 0 : undefined}
                className={'calendar-day ' + (d.out ? 'out ' : d.tipo + ' ') + (d.hoy ? 'today' : '')}
                style={d.out || !d.seleccionable ? { cursor: 'default' } : undefined}
                onClick={() => clicDia(d)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && clicDia(d)}
              >
                <span className="num">{d.num}</span>
                {!d.out && <span>{d.hoy && d.tipo !== 'selected' ? 'hoy · ' : ''}{d.texto}</span>}
              </div>
            ))}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-dot" style={{ background: '#F1F8F4' }} />Con unidades libres</span>
            <span><i className="legend-dot" style={{ background: '#EEF3F9' }} />Con unidades prestadas</span>
            <span><i className="legend-dot" style={{ background: '#FBF1D6' }} />Reservadas o sin disponibilidad</span>
            <span><i className="legend-dot" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }} />Rango seleccionado</span>
          </div>
        </section>

        <aside>
          <div className="card">
            <span className="section-label">RANGO SELECCIONADO</span>
            {sel ? (
              <>
                <p className="mono strong" style={{ fontSize: 18, margin: '4px 0' }}>
                  {dateOnly(sel.desde).slice(0, 5)} → {dateOnly(sel.hasta)}
                </p>
                <p className="text-muted small">
                  {sel.abierto
                    ? 'Marca el día final del rango.'
                    : diasDelRango(sel.desde, sel.hasta) + ' días · ' + (libres === 0
                      ? 'sin unidades libres en el rango: pasarías a lista de espera'
                      : libres + ' unidades libres en todo el rango')}
                </p>
              </>
            ) : (
              <p className="text-muted small">Haz clic en un día para marcar el inicio y en otro para el fin.</p>
            )}
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!futuro}
              onClick={() => setReservar(true)}
            >
              Reservar este rango
            </button>
            {sel && !futuro && <p className="inline-note">La reserva debe empezar desde mañana. Para hoy usa un préstamo directo.</p>}
            {empiezaHoy
              ? <Link to={'/student/solicitar/' + equipoId} className="btn btn-secondary btn-block">Solicitar préstamo directo</Link>
              : <button type="button" className="btn btn-secondary btn-block" disabled>Solicitar préstamo directo</button>}
          </div>

          <div className="card">
            <span className="section-label">UNIDADES COMPROMETIDAS HOY</span>
            {comprometidas.length === 0
              ? <p className="text-muted small">Todas las unidades están disponibles hoy.</p>
              : (
                <ul className="unit-list">
                  {comprometidas.map((u) => (
                    <li key={u.codigo}><span className="mono">{u.codigo}</span><StatusBadge estado={u.estado} /></li>
                  ))}
                </ul>
              )}
          </div>
        </aside>
      </div>

      {reservar && sel && (
        <ReservationModal
          equipo={equipo}
          usuarioId={user?.id}
          desde={sel.desde}
          hasta={sel.hasta}
          onClose={() => setReservar(false)}
          onDone={() => { setReservar(false); setSel(null); setTick((t) => t + 1) }}
        />
      )}
    </div>
  )
}
