// src/pages/metrics/MetricsDashboardPage.jsx
// HU-7 · 7.1 Tablero de métricas
// Préstamos del periodo, unidades disponibles, vencidos y en mantenimiento,
// préstamos por mes y estado del inventario. Gráficos hechos con HTML/CSS.
// Todo se calcula en metricsService a partir del seed.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatCard, EmptyState, Spinner, Alert } from '../../components/ui.jsx'
import { useMetrics } from '../../context/MetricsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money, dateOnly } from '../../shared/format.js'
import { DateRangeFilter } from './DateRangeFilter.jsx'

function variacionTexto(v) {
  if (v === null) return 'sin préstamos en el periodo anterior'
  return (v > 0 ? '+' : '') + v + ' % frente al periodo anterior'
}

// Descarga un texto como archivo desde el navegador
function descargar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function MetricsDashboardPage() {
  const { rango, getTablero, exportarTablero } = useMetrics()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    let vigente = true
    setError('')
    getTablero(rango)
      .then((d) => { if (vigente) setData(d) })
      .catch((err) => { if (vigente) setError(err.message) })
    return () => { vigente = false }
  }, [rango, getTablero])

  async function onExportar() {
    setExportando(true)
    try {
      const { nombre, contenido } = await exportarTablero(rango)
      descargar(nombre, contenido)
      toast.success('Se descargó el archivo ' + nombre + '.')
    } catch (err) {
      toast.error('No se pudo exportar el tablero. ' + err.message)
    } finally {
      setExportando(false)
    }
  }

  const k = data?.kpis
  const maxMes = data ? Math.max(1, ...data.porMes.map((m) => m.total)) : 1
  const totalMes = data ? data.porMes.reduce((s, m) => s + m.total, 0) : 0
  const totalInv = data ? data.estadoInventario.reduce((s, e) => s + e.total, 0) : 0

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tablero del almacén</h1>
          <p className="page-subtitle">
            Almacén H-102 · datos al {data ? dateOnly(data.fechaCorte) : '…'}
          </p>
        </div>
        <div className="page-header-actions">
          <DateRangeFilter />
          <Link to="/manager/ranking" className="btn btn-secondary" style={{ marginTop: 21 }}>Ver ranking</Link>
          <button type="button" className="btn btn-primary" style={{ marginTop: 21 }} onClick={onExportar} disabled={!data || exportando}>
            {exportando ? 'Exportando…' : 'Exportar'}
          </button>
        </div>
      </div>

      <Alert type="danger">{error}</Alert>

      {!data ? <Spinner text="Calculando métricas…" /> : (
        <>
          <div className="stat-grid">
            <StatCard label="PRÉSTAMOS DEL PERIODO" value={k.prestamosPeriodo} hint={variacionTexto(k.variacion)} />
            <StatCard label="UNIDADES DISPONIBLES" value={k.disponibles} hint={'de ' + k.totalUnidades + ' registradas'} />
            <StatCard
              label="PRÉSTAMOS VENCIDOS"
              value={k.vencidos}
              hint={money(k.deudaTotal) + ' en penalidades pendientes'}
              tone={k.vencidos ? 'danger' : ''}
            />
            <StatCard
              label="EN MANTENIMIENTO"
              value={k.mantenimiento}
              hint="unidades fuera de servicio"
              tone={k.mantenimiento ? 'warning' : ''}
            />
          </div>

          <div className="chart-grid">
            <section className="card">
              <h2 className="card-title">Préstamos por mes</h2>
              {totalMes === 0 ? (
                <EmptyState
                  title="Sin préstamos en el periodo"
                  text="Prueba con un rango de fechas más amplio."
                />
              ) : (
                <>
                  <div className="bar-chart" role="img" aria-label="Préstamos por mes">
                    {data.porMes.map((m) => (
                      <div key={m.clave} className="bar-col" title={m.mes + ' ' + m.anio + ': ' + m.total}>
                        <span className="bar-value">{m.total}</span>
                        <div className={'bar' + (m.total ? '' : ' empty')} style={{ height: Math.max(2, (m.total / maxMes) * 85) + '%' }} />
                      </div>
                    ))}
                  </div>
                  <div className="bar-labels">
                    {data.porMes.map((m) => <span key={m.clave}>{m.mes}</span>)}
                  </div>
                </>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Estado del inventario</h2>
              <ul className="hbar-list">
                {data.estadoInventario.map((e) => (
                  <li key={e.estado}>
                    <span>{e.label}</span>
                    <div className="hbar-track">
                      <div className={'hbar-fill ' + e.tone} style={{ width: (totalInv ? (e.total / totalInv) * 100 : 0) + '%' }} />
                    </div>
                    <span className="mono">{e.total}</span>
                  </li>
                ))}
              </ul>
              <p className="inline-note chart-note">
                {data.resumen.promedioDias === null
                  ? 'Aún no hay devoluciones registradas en el periodo.'
                  : <>
                      Tiempo promedio de préstamo: {data.resumen.promedioDias} días ·
                      devoluciones a tiempo: {data.resumen.aTiempo} %
                    </>}
                {data.resumen.unidadMasSolicitada && (
                  <> · unidad más solicitada: <span className="mono">{data.resumen.unidadMasSolicitada}</span></>
                )}
                .
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
