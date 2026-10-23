// src/pages/loans/DeliveryReceiptPage.jsx
// HU-4 · 4.5 Constancia de entrega (consultable por el encargado y el estudiante)
// Solo diseño: «Descargar PDF» aún no hace nada; «Imprimir» usa la impresión del navegador.

import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/ui.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { constanciaDe } from '../../services/loansService.js'

// volver = ruta de regreso según quién la consulta.
// soloPropias = el estudiante solo puede ver las constancias de sus préstamos.
export default function DeliveryReceiptPage({ volver = '/manager/prestamos', volverLabel = 'Préstamos vigentes', soloPropias = false }) {
  const { codigo } = useParams()
  const { user } = useAuth()
  const c = constanciaDe(codigo)

  if (!c || (soloPropias && c.usuarioId !== user?.id)) {
    return (
      <div className="page receipt">
        <h1 className="page-title">Constancia de entrega</h1>
        <div className="card">
          <EmptyState
            title="No encontramos esta constancia"
            text={'No hay una constancia disponible para el código ' + codigo + '.'}
            action={<Link to={volver} className="btn btn-primary">Volver a {volverLabel.toLowerCase()}</Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page receipt">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><Link to={volver}>{volverLabel}</Link> / Constancia</div>
          <h1 className="page-title">Constancia de entrega</h1>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary">Descargar PDF</button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      <article className="receipt-doc">
        <header>
          <span className="section-label">UNIVERSIDAD DE LIMA · FACULTAD DE INGENIERÍA</span>
          <h2>Constancia de entrega de equipo</h2>
        </header>

        <div className="receipt-grid">
          <div><span className="section-label">CÓDIGO DE PRÉSTAMO</span><p className="mono strong">{c.codigo}</p></div>
          <div><span className="section-label">ESTUDIANTE</span><p>{c.estudiante}</p><p className="cell-sub">{c.estudianteInfo}</p></div>
          <div><span className="section-label">CURSO ASOCIADO</span><p>{c.curso}</p>{c.docente && <p className="cell-sub">Docente: {c.docente}</p>}</div>
          <div><span className="section-label">EQUIPO Y UNIDAD</span><p>{c.equipo}</p><p className="mono">{c.unidad}</p></div>
          <div><span className="section-label">FECHAS</span><p className="mono">Entrega: {c.entrega}</p><p className="mono">Devolución: {c.devolucion}</p></div>
        </div>

        <span className="section-label">ACCESORIOS ENTREGADOS</span>
        <table className="table" style={{ marginBottom: 20 }}>
          <thead><tr><th>ACCESORIO</th><th>ENTREGADO</th></tr></thead>
          <tbody>
            {c.accesorios.map(([a, ok]) => <tr key={a}><td>{a}</td><td>{ok}</td></tr>)}
          </tbody>
        </table>

        <p className="receipt-legal">
          Declaro recibir el equipo en las condiciones descritas y me comprometo a devolverlo en la fecha pactada.
          El retraso genera una penalidad de {c.penalidad} por día y suspende nuevos préstamos.
        </p>

        <div className="signatures">
          <div>Firma del estudiante</div>
          <div>Firma del encargado de almacén</div>
        </div>
      </article>
    </div>
  )
}
