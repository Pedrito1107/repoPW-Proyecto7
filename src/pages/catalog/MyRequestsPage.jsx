
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  RequestBadge,
  ConfirmDialog,
  Modal,
  EmptyState
} from '../../components/ui.jsx'

import { useAuth } from '../../context/AuthContext.jsx'
import { getAll, saveAll } from '../../services/db.js'

export default function MyRequestsPage() {

  const { user } = useAuth()
  const location = useLocation()

  // Obtiene solo las solicitudes del estudiante actual
  const cargarSolicitudes = () => {
    if (!user?.id) return []

    return getAll('solicitudes').filter(
      (s) => s.estudianteId === user.id
    )
  }

  const [solicitudes, setSolicitudes] = useState(
    cargarSolicitudes
  )

  const [filtroEstado, setFiltroEstado] = useState('')
  const [aRetirar, setARetirar] = useState(null)
  const [verDetalle, setVerDetalle] = useState(null)

  const [mensaje, setMensaje] = useState(
    location.state?.mensaje || ''
  )
  const [error, setError] = useState('')

  // Equipos registrados en la base local
  const equipos = getAll('equipos')
  const unidades = getAll('unidades')

  // Devuelve el nombre del equipo
  const nombreEquipo = (s) => {
    const equipo = equipos.find(
      (e) => e.id === s.equipoId
    )

    return equipo?.nombre || s.equipo ||
      'Equipo no encontrado'
  }

  // Convierte YYYY-MM-DD a DD/MM/YYYY
  const formatearFecha = (fecha) => {
    if (!fecha) return '—'

    const soloFecha = String(fecha).slice(0, 10)
    const partes = soloFecha.split('-')

    if (partes.length !== 3) return fecha

    return partes.reverse().join('/')
  }

  const fechasSolicitud = (s) => {
    if (s.fechaInicio && s.fechaFin) {
      return (
        formatearFecha(s.fechaInicio) +
        ' → ' +
        formatearFecha(s.fechaFin)
      )
    }

    return s.fechas || '—'
  }

  // Obtiene el código de la unidad asignada
  const codigoUnidad = (s) => {
    if (s.unidad) return s.unidad

    const unidad = unidades.find(
      (u) => u.id === s.unidadId
    )

    return unidad?.codigo || null
  }

  // Contadores para el encabezado
  const contar = (estado) =>
    solicitudes.filter((s) => s.estado === estado).length

  const pendientes = contar('enviada')
  const aprobadas = contar('aprobada')
  const enCurso = contar('entregada')

  const historial =
    contar('devuelta') +
    contar('rechazada') +
    contar('retirada')

  // Filtrado real de solicitudes
  const solicitudesFiltradas = solicitudes.filter(
    (s) =>
      filtroEstado === '' ||
      s.estado === filtroEstado
  )

  // Retira una solicitud pendiente
  function retirarSolicitud() {
    if (!aRetirar) return

    setError('')
    setMensaje('')

    try {
      // Lee otra vez para comprobar el estado actualizado
      const todas = getAll('solicitudes')

      const actual = todas.find(
        (s) => s.id === aRetirar.id
      )

      if (
        !actual ||
        actual.estudianteId !== user?.id
      ) {
        throw new Error(
          'No se encontró la solicitud de tu cuenta.'
        )
      }

      if (actual.estado !== 'enviada') {
        throw new Error(
          'No puedes retirar una solicitud que ya fue resuelta.'
        )
      }

      // Cambia su estado y conserva el historial
      const actualizadas = todas.map((s) =>
        s.id === actual.id
          ? {
              ...s,
              estado: 'retirada',
              fechaRetiro: new Date().toISOString()
            }
          : s
      )

      saveAll('solicitudes', actualizadas)

      setSolicitudes(
        actualizadas.filter(
          (s) => s.estudianteId === user.id
        )
      )

      setMensaje('Solicitud retirada correctamente.')
      setARetirar(null)

    } catch (err) {
      setError(
        err.message || 'No se pudo retirar la solicitud.'
      )
      setARetirar(null)
    }
  }

  return (
    <div className="page">

      {/* ENCABEZADO */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Mis solicitudes
          </h1>

          <p className="page-subtitle">
            {pendientes} pendientes ·{' '}
            {aprobadas} aprobadas ·{' '}
            {enCurso} en curso ·{' '}
            {historial} en el historial
          </p>
        </div>

        <Link
          to="/student/catalogo"
          className="btn btn-primary"
        >
          Nueva solicitud
        </Link>
      </div>

      {/* NOTIFICACIONES */}
      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* FILTROS */}
      <div className="toolbar">

        <label className="toolbar-select">
          <span>Estado:</span>

          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value)
            }
          >
            <option value="">todos</option>
            <option value="enviada">enviadas</option>
            <option value="aprobada">aprobadas</option>
            <option value="entregada">entregadas</option>
            <option value="devuelta">devueltas</option>
            <option value="rechazada">rechazadas</option>
            <option value="retirada">retiradas</option>
          </select>
        </label>

        <span className="toolbar-select mono">
          {solicitudesFiltradas.length} solicitudes encontradas
        </span>

      </div>

      {/* TABLA O ESTADO VACÍO */}
      {solicitudesFiltradas.length > 0 ? (

        <div className="card card-flush">
          <div className="table-wrap">

            <table className="table">
              <thead>
                <tr>
                  <th>EQUIPO Y CURSO</th>
                  <th>FECHAS</th>
                  <th>UNIDAD ASIGNADA</th>
                  <th>ESTADO</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>

              <tbody>
                {solicitudesFiltradas.map((s) => (

                  <tr key={s.id}>

                    <td>
                      <span className="strong">
                        {nombreEquipo(s)}
                      </span>

                      <div className="cell-sub">
                        {s.curso || 'Sin curso'}
                      </div>
                    </td>

                    <td className="mono">
                      {fechasSolicitud(s)}
                    </td>

                    <td>
                      {codigoUnidad(s) ? (
                        <span className="mono">
                          {codigoUnidad(s)}
                        </span>
                      ) : (
                        <span className="text-muted">
                          Pendiente de asignar
                        </span>
                      )}
                    </td>

                    <td>
                      <RequestBadge estado={s.estado} />
                    </td>

                    <td className="actions">

                      {s.estado === 'enviada' && (
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => setARetirar(s)}
                        >
                          Retirar solicitud
                        </button>
                      )}

                      {s.estado === 'entregada' && (
                        <Link
                          to={
                            '/student/prestamos/' +
                            s.codigo +
                            '/constancia'
                          }
                        >
                          Ver constancia
                        </Link>
                      )}

                      {s.estado !== 'enviada' &&
                       s.estado !== 'entregada' && (
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => setVerDetalle(s)}
                        >
                          {s.estado === 'rechazada'
                            ? 'Ver motivo'
                            : 'Ver detalle'}
                        </button>
                      )}

                    </td>
                  </tr>

                ))}
              </tbody>
            </table>

          </div>
        </div>

      ) : (

        <div className="card">
          <EmptyState
            title={
              filtroEstado
                ? 'No hay solicitudes con este estado'
                : 'Aún no tienes solicitudes'
            }
            text={
              filtroEstado
                ? 'Selecciona otro estado para consultar tus solicitudes.'
                : 'Busca un equipo en el catálogo y solicita tu primer préstamo.'
            }
            action={
              <Link
                to="/student/catalogo"
                className="btn btn-primary"
              >
                Ir al catálogo
              </Link>
            }
          />
        </div>

      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {aRetirar && (
        <ConfirmDialog
          title="Retirar solicitud"
          message={
            '¿Seguro que deseas retirar la solicitud de «' +
            nombreEquipo(aRetirar) +
            '»?'
          }
          confirmLabel="Retirar solicitud"
          onConfirm={retirarSolicitud}
          onCancel={() => setARetirar(null)}
        />
      )}

      {/* MODAL DE DETALLE */}
      {verDetalle && (
        <Modal
          title={nombreEquipo(verDetalle)}
          onClose={() => setVerDetalle(null)}
        >
          <dl className="details">

            <dt>Código</dt>
            <dd className="mono">
              {verDetalle.codigo || verDetalle.id}
            </dd>

            <dt>Curso</dt>
            <dd>{verDetalle.curso || '—'}</dd>

            <dt>Fechas</dt>
            <dd className="mono">
              {fechasSolicitud(verDetalle)}
            </dd>

            <dt>Unidad</dt>
            <dd className="mono">
              {codigoUnidad(verDetalle) || '—'}
            </dd>

            <dt>Estado</dt>
            <dd>
              <RequestBadge estado={verDetalle.estado} />
            </dd>

            {(verDetalle.motivoRechazo ||
              verDetalle.motivo) && (
              <>
                <dt>
                  {verDetalle.estado === 'rechazada'
                    ? 'Motivo del rechazo'
                    : 'Motivo de la solicitud'}
                </dt>

                <dd>
                  {verDetalle.motivoRechazo ||
                   verDetalle.motivo}
                </dd>
              </>
            )}

          </dl>
        </Modal>
      )}

    </div>
  )
}
