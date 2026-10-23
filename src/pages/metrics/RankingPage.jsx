// src/pages/metrics/RankingPage.jsx
// HU-7 · 7.2 Ranking de equipos: más solicitados, sin movimiento y
// distribución de préstamos por carrera y por mes, con filtro por categoría
// y rango de fechas (el mismo rango del tablero).

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, Spinner, Alert } from '../../components/ui.jsx'
import { useMetrics } from '../../context/MetricsContext.jsx'
import { CATEGORIAS } from '../../shared/constants.js'
import { dateOnly } from '../../shared/format.js'
import { DateRangeFilter } from './DateRangeFilter.jsx'

const COLORES_SERIE = ['var(--primary)', 'var(--accent)']

export default function RankingPage() {
  const { rango, getRanking } = useMetrics()
  const [categoria, setCategoria] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    setError('')
    getRanking({ ...rango, categoria })
      .then((d) => { if (vigente) setData(d) })
      .catch((err) => { if (vigente) setError(err.message) })
    return () => { vigente = false }
  }, [rango, categoria, getRanking])

  const maxCarrera = data ? Math.max(1, ...data.porCarrera.map((c) => c.total)) : 1
  const maxMes = data ? Math.max(1, ...data.porMesCategoria.map((m) => m.valores.reduce((s, v) => s + v, 0))) : 1

  return (
    <div className="page">
      <div className="breadcrumb"><Link to="/manager/tablero">Tablero</Link> / Ranking</div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ranking de equipos</h1>
          <p className="page-subtitle">
            Periodo del {dateOnly(rango.desde)} al {dateOnly(rango.hasta)}
            {data && <> · {data.totalPrestamos} préstamos</>}
          </p>
        </div>
        <div className="page-header-actions">
          <DateRangeFilter />
          <label className="toolbar-select" style={{ marginTop: 21 }}>
            <span>Categoría:</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">todas</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>

      <Alert type="danger">{error}</Alert>

      {!data ? <Spinner text="Calculando ranking…" /> : (
        <div className="ranking-grid">
          <section className="card card-flush">
            <div className="card-body" style={{ paddingBottom: 0 }}><h2 className="card-title">Más solicitados</h2></div>
            {data.masSolicitados.length === 0 ? (
              <EmptyState title="Sin préstamos en el periodo" text="Ningún equipo de esta selección se prestó en el rango elegido." />
            ) : (
              <table className="table">
                <thead><tr><th>#</th><th>EQUIPO</th><th className="num">PRÉSTAMOS</th><th>USO</th></tr></thead>
                <tbody>
                  {data.masSolicitados.map((f, i) => (
                    <tr key={f.id}>
                      <td className="mono">{i + 1}</td>
                      <td>
                        <Link to={'/manager/inventario/' + f.id} className="cell-title">{f.nombre}</Link>
                        <div className="cell-sub">{f.categoria}</div>
                      </td>
                      <td className="num mono">{f.prestamos}</td>
                      <td style={{ minWidth: 140 }}>
                        <div className="hbar-track"><div className="hbar-fill" style={{ width: f.uso + '%' }} /></div>
                        <span className="cell-sub mono">{f.uso} %</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card card-flush">
            <div className="card-body" style={{ paddingBottom: 0 }}><h2 className="card-title">Sin movimiento</h2></div>
            {data.sinMovimiento.length === 0 ? (
              <EmptyState title="Todos los equipos tuvieron préstamos" text="No hay equipos sin movimiento en el periodo." />
            ) : (
              <table className="table">
                <thead><tr><th>EQUIPO</th><th className="num">UNIDADES</th><th>ÚLTIMO PRÉSTAMO</th></tr></thead>
                <tbody>
                  {data.sinMovimiento.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Link to={'/manager/inventario/' + f.id} className="cell-title">{f.nombre}</Link>
                        <div className="cell-sub">{f.categoria}</div>
                      </td>
                      <td className="num mono">{f.unidades}</td>
                      <td className={'mono ' + (f.ultimoPrestamo ? '' : 'text-muted')}>
                        {f.ultimoPrestamo ? dateOnly(f.ultimoPrestamo) : 'sin registros'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Préstamos por carrera</h2>
            {data.porCarrera.length === 0 ? (
              <EmptyState title="Sin préstamos en el periodo" />
            ) : (
              <ul className="hbar-list">
                {data.porCarrera.map((c) => (
                  <li key={c.carrera}>
                    <span>{c.carrera}</span>
                    <div className="hbar-track"><div className="hbar-fill" style={{ width: (c.total / maxCarrera) * 100 + '%' }} /></div>
                    <span className="mono">{c.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Préstamos por mes y categoría</h2>
            {data.totalPrestamos === 0 ? (
              <EmptyState title="Sin préstamos en el periodo" />
            ) : (
              <>
                <div className="stacked-bars" role="img" aria-label="Préstamos por mes y categoría">
                  {data.porMesCategoria.map((m) => (
                    <div
                      key={m.clave}
                      className="stacked-col"
                      title={m.mes + ': ' + data.series.map((s, i) => s + ' ' + m.valores[i]).join(' · ')}
                    >
                      {/* La primera serie va abajo: se dibujan de arriba hacia abajo */}
                      {[...m.valores].reverse().map((v, j, arr) => (
                        <div
                          key={j}
                          className="bar"
                          style={{
                            height: (v / maxMes) * 90 + '%',
                            background: COLORES_SERIE[arr.length - 1 - j],
                            borderRadius: j === arr.findIndex((x) => x > 0) ? 'var(--radius) var(--radius) 0 0' : 0
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="bar-labels">
                  {data.porMesCategoria.map((m) => <span key={m.clave}>{m.mes}</span>)}
                </div>
                <div className="chart-legend">
                  {data.series.map((s, i) => (
                    <span key={s}><i className="legend-dot" style={{ background: COLORES_SERIE[i] }} />{s}</span>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
