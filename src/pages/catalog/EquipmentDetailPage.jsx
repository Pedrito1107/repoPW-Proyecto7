
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui.jsx'
import { NotFoundContent } from '../errors/NotFoundPage.jsx'
import { condicionesTexto, dateOnly } from '../../shared/format.js'
import { getDetalle, proximaLiberacion } from '../../services/catalogService.js'
import { restriccionDe } from '../../services/requestService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { FECHA_CORTE } from '../../shared/constants.js'

export default function EquipmentDetailPage() {

  // Obtiene el ID del equipo desde la URL
  const { id } = useParams()

  // Estudiante en sesión (HU-1)
  const { user } = useAuth()

  // Busca la información del equipo
  const e = getDetalle(id)

  // Si el equipo no existe, muestra error 404
  if (!e) return <NotFoundContent />

  // Calcula cuántas unidades están disponibles
  const libres = e.unidades.filter(
    (u) => u.estado === 'disponible'
  ).length

  const total = e.unidades.length

  // "Hoy" del proyecto (14/09/2026), el mismo que usan las demás vistas
  const fechaActual = dateOnly(FECHA_CORTE)

  // Variantes del panel (mockup 3.2):
  //  · con deuda o cuenta bloqueada: no puede solicitar, se ofrece «Ver mi deuda»
  //  · sin unidades libres: solicitar deshabilitado
  const restriccion = restriccionDe(user?.id)
  const liberacion = libres === 0 ? proximaLiberacion(e.id) : null
  const puedeSolicitar = libres > 0 && !restriccion

  return (
    <div className="page">

      {/* RUTA DE NAVEGACIÓN */}
      <div className="breadcrumb">
        <Link to="/student/catalogo">Catálogo</Link>
        {' / '}
        {e.categoria}
        {' / '}
        {e.nombre}
      </div>

      <div className="ficha">

        {/* FOTOGRAFÍA DEL EQUIPO */}
        <div className="photo photo-xl">
          <span>fotografía principal 1:1</span>
        </div>

        {/* INFORMACIÓN DEL EQUIPO */}
        <div className="ficha-info">

          <h1 className="page-title">
            {e.nombre}
          </h1>

          <p className="page-subtitle">
            {e.marca} · {e.modelo} · {e.categoria}
          </p>

          <p className="ficha-description">
            {e.descripcion}
          </p>

          {/* ACCESORIOS */}
          <span className="section-label">
            ACCESORIOS INCLUIDOS
          </span>

          <div className="chips">
            {(e.accesorios || []).map((accesorio) => (
              <span key={accesorio} className="chip">
                {accesorio}
              </span>
            ))}
          </div>

          {/* CONDICIONES DEL PRÉSTAMO */}
          <h2 className="card-title">
            Condiciones del préstamo
          </h2>

          <p>{condicionesTexto(e.condiciones)}</p>

          {/* UNIDADES */}
          <span className="section-label">
            UNIDADES DE ESTE EQUIPO
          </span>

          <ul className="unit-list">
            {e.unidades.map((unidad) => (
              <li key={unidad.codigo}>

                <span className="mono">
                  {unidad.codigo}
                </span>

                <StatusBadge estado={unidad.estado} />

              </li>
            ))}
          </ul>

        </div>

        {/* PANEL DE DISPONIBILIDAD */}
        <aside className="card availability">

          <span className="section-label">
            DISPONIBILIDAD
          </span>

          <div className="availability-number">

            <strong
              className={
                libres > 0
                  ? 'text-success'
                  : 'text-danger'
              }
            >
              {libres}
            </strong>

            {' de '}{total}

          </div>

          <p className="text-muted">
            unidades libres hoy, {fechaActual}
          </p>

          {/* SOLICITAR PRÉSTAMO */}
          {puedeSolicitar ? (

            <Link
              to={'/student/solicitar/' + e.id}
              className="btn btn-primary btn-block"
            >
              Solicitar préstamo
            </Link>

          ) : (

            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled
            >
              Solicitar préstamo
            </button>

          )}

          {/* VER MI DEUDA */}
          {restriccion && (
            <Link to="/student/cuenta" className="btn btn-secondary btn-block">
              Ver mi deuda
            </Link>
          )}

          <p className="small text-muted">
            Recojo en {e.almacen || 'almacén asignado'}
            {' · lunes a viernes de 08:00 a 19:00.'}
          </p>

          {/* ALERTA: CON DEUDA O CUENTA BLOQUEADA */}
          {restriccion && (
            <div className="alert alert-danger" role="alert">
              {restriccion.deuda
                ? <>Con deuda pendiente: <strong className="mono">{restriccion.deuda}</strong>
                    {restriccion.prestamo && <> por el préstamo <span className="mono">{restriccion.prestamo}</span></>}
                    {' · '}no puedes solicitar hasta regularizar.</>
                : <><strong>Cuenta bloqueada</strong> · no puedes solicitar hasta regularizar.</>}
            </div>
          )}

          {/* ALERTA: SIN UNIDADES */}
          {libres === 0 && (
            <div className="alert alert-warning">
              Sin unidades libres: <strong className="mono">0 de {total}</strong>
              {liberacion
                ? <> · la próxima se libera el <span className="mono">{dateOnly(liberacion)}</span>.</>
                : <> · sin fecha estimada de liberación.</>}
            </div>
          )}

        </aside>

      </div>

    </div>
  )
}
