// src/pages/loans/ActiveLoansPage.jsx
// HU-4 · 4.6 Préstamos vigentes (y vista «Vencidos» del menú lateral)
// Solo diseño y navegación. En la HU-5 se agregan las acciones
// «Registrar devolución» y «Renovar».

import { DueIndicator } from '../../components/ui.jsx'
import { listarPrestamosVigentes } from '../../services/loansService.js'

// Préstamos vigentes del seed (HU-4)
const PRESTAMOS = listarPrestamosVigentes()

function LoanTable({ rows, lastHeader, variant = '' }) {
  return (
    <div className={`loans-card ${variant}`}>
      <div className="table-wrap">
        <table className={`table ${variant.includes('border-danger') ? 'table-vencidos' : ''}`}>
          <thead>
            <tr>
              <th>PRÉSTAMO</th>
              <th>UNIDAD</th>
              <th>ESTUDIANTE</th>
              <th>VENCIMIENTO</th>
              <th>{lastHeader}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.codigo}>
                {/* Código en negrita de color oscuro idéntico a Imagen 2 */}
                <td className="code-bold">{p.codigo}</td>
                <td className="mono">{p.unidad}</td>
                <td>{p.estudiante}</td>
                <td className="mono">{p.vence}</td>
                <td><DueIndicator dias={p.dias} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ActiveLoansPage({ soloVencidos = false }) {
  const vencidos = PRESTAMOS.filter((p) => p.dias < 0)
  const hoy = PRESTAMOS.filter((p) => p.dias === 0)
  const enCurso = PRESTAMOS.filter((p) => p.dias > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{soloVencidos ? 'Préstamos vencidos' : 'Préstamos vigentes'}</h1>
          <p className="page-subtitle">
            {soloVencidos
              ? vencidos.length + ' préstamos con retraso'
              : PRESTAMOS.length + ' préstamos activos · ' + hoy.length + ' vence hoy · ' + vencidos.length + ' vencidos'}
          </p>
        </div>
        <div className="toolbar-search" style={{ marginLeft: 'auto' }}>
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Buscar por código de préstamo: PRE-2026-0318" />
        </div>
      </div>

      <section className="loan-section">
        <h2 className="loan-section-title danger">VENCIDOS · {vencidos.length}</h2>
        <LoanTable rows={vencidos} lastHeader="RETRASO" variant="border-danger" />
      </section>

      {!soloVencidos && (
        <>
          <section className="loan-section">
            <h2 className="loan-section-title warning">VENCEN HOY · {hoy.length}</h2>
            <LoanTable rows={hoy} lastHeader="RETRASO" variant="border-warning bg-warning-light" />
          </section>

          <section className="loan-section">
            <h2 className="loan-section-title">EN CURSO · {enCurso.length}</h2>
            <LoanTable rows={enCurso} lastHeader="DÍAS RESTANTES" variant="border-default" />
          </section>
        </>
      )}
    </div>
  )
}
