// src/pages/loans/DeliveryPage.jsx
// HU-4 · 4.4 Registro de entrega
// Solo diseño y navegación: muestra la solicitud aprobada del código de la URL
// y al enviar pasa a su constancia (4.5) sin registrar nada.

import { Link, useNavigate, useParams } from 'react-router-dom'
import { Field, EmptyState } from '../../components/ui.jsx'
import { buscarSolicitud, equipoDe } from '../../services/loansService.js'

// "19/09/2026" -> "2026-09-19" (valor de un input date)
function aIso(fecha) {
  const [d, m, a] = fecha.split('/')
  return a + '-' + m + '-' + d
}

export default function DeliveryPage() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const solicitud = buscarSolicitud(codigo)

  if (!solicitud || solicitud.estado !== 'aprobada') {
    return (
      <div className="page">
        <h1 className="page-title">Registrar entrega</h1>
        <div className="card">
          <EmptyState
            title="No hay una solicitud aprobada con este código"
            text={'Solo se registra la entrega de solicitudes aprobadas. Código: ' + codigo + '.'}
            action={<Link to="/manager/solicitudes" className="btn btn-primary">Ir a la bandeja</Link>}
          />
        </div>
      </div>
    )
  }

  const equipo = equipoDe(solicitud.equipoId)

  function registrar(e) {
    e.preventDefault()
    // Pendiente (funcionamiento): registrar la entrega y pasar la unidad a «prestada»
    navigate('/manager/prestamos/' + codigo + '/constancia')
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/solicitudes">Solicitudes</Link> / <span className="mono">{codigo}</span> / Registrar entrega
      </div>
      <h1 className="page-title">Registrar entrega</h1>

      <form className="card" onSubmit={registrar}>
        <dl className="details receipt-grid" style={{ display: 'grid' }}>
          <div><dt className="section-label">ESTUDIANTE</dt><dd>{solicitud.estudiante}</dd></div>
          <div><dt className="section-label">CÓDIGO DE PRÉSTAMO</dt><dd className="mono">{codigo}</dd></div>
          <div><dt className="section-label">EQUIPO Y UNIDAD</dt><dd>{solicitud.equipo} · <span className="mono">{solicitud.unidad}</span></dd></div>
          <div><dt className="section-label">DEVOLUCIÓN PACTADA</dt><dd className="mono">{solicitud.hasta} · 19:00</dd></div>
        </dl>

        <span className="section-label">ACCESORIOS ENTREGADOS</span>
        {equipo.accesorios.map((nombre) => (
          <label key={nombre} className="check-row">
            <input type="checkbox" defaultChecked /> {nombre}
          </label>
        ))}

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field label="FECHA DE ENTREGA"><input type="datetime-local" defaultValue={aIso(solicitud.desde) + 'T09:00'} /></Field>
        </div>
        <Field label="OBSERVACIONES DEL ESTADO INICIAL">
          <textarea rows="3" placeholder="Describe el estado en que se entrega la unidad (golpes, rayaduras, faltantes…)" />
        </Field>

        <div className="form-actions">
          <Link to="/manager/solicitudes" className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary">Registrar entrega y generar constancia</button>
        </div>
      </form>
    </div>
  )
}
