
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Field } from '../../components/ui.jsx'
import { NotFoundContent } from '../errors/NotFoundPage.jsx'
import { money, plural, dateOnly } from '../../shared/format.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { crearSolicitud, calcularDias, restriccionDe } from '../../services/requestService.js'
import { getCursos, getDetalle } from '../../services/catalogService.js'

// Cursos del seed (HU-3)
const CURSOS = getCursos()

export default function RequestFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const e = getDetalle(id)

  const hoy = () => {
    const fecha = new Date()
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [fechaInicio, setFechaInicio] = useState(hoy)
  const [fechaFin, setFechaFin] = useState('')
  const [curso, setCurso] = useState('')
  const [motivo, setMotivo] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!e) return <NotFoundContent />

  const c = e.condiciones

  // Con deuda o cuenta bloqueada no se puede solicitar (mismas reglas que crearSolicitud)
  const restriccion = restriccionDe(user?.id)

  // Última fecha de devolución permitida por la duración máxima
  const sumarDias = (iso, n) => {
    const [y, m, d] = iso.split('-').map(Number)
    const f = new Date(y, m - 1, d + n)
    return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0')
  }

  const libres = e.unidades.filter(
    (u) => u.estado === 'disponible'
  ).length

  const dias = calcularDias(fechaInicio, fechaFin)

  const duracionExcedida = (
    dias > c.duracionMaxima
  )

  const rangoInvalido = (
    fechaInicio &&
    fechaFin &&
    dias <= 0
  )

  const hoyTexto = hoy()

  function enviar(ev) {
    ev.preventDefault()
    setError('')
    setEnviando(true)

    try {
      crearSolicitud({
        estudianteId: user?.id,
        equipoId: e.id,
        fechaInicio,
        fechaFin,
        curso,
        motivo,
        aceptaCondiciones: acepta
      })

      navigate('/student/solicitudes', {
        state: {
          mensaje: 'Solicitud enviada correctamente.'
        }
      })
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="page">

      <div className="breadcrumb">
        <Link to="/student/catalogo">Catálogo</Link>
        {' / '}
        <Link to={'/student/equipos/' + e.id}>
          {e.nombre}
        </Link>
        {' / Solicitar préstamo'}
      </div>

      <h1 className="page-title">
        Solicitar préstamo
      </h1>

      <div className="form-aside">

        <form className="card" onSubmit={enviar}>

          <span className="section-label">
            FECHAS DEL PRÉSTAMO
          </span>

          <div className="form-grid">

            <Field label="FECHA DE INICIO">
              <input
                type="date"
                value={fechaInicio}
                min={hoyTexto}
                required
                onChange={(ev) => {
                  setFechaInicio(ev.target.value)
                  setError('')
                }}
              />
            </Field>

            <Field label="FECHA DE DEVOLUCIÓN">
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio || hoyTexto}
                required
                onChange={(ev) => {
                  setFechaFin(ev.target.value)
                  setError('')
                }}
              />
            </Field>

          </div>

          <p className="inline-note">
            Duración:{' '}
            <strong className="mono">
              {dias} de {c.duracionMaxima} días
            </strong>
            {' · '}
            La duración máxima de este equipo es de{' '}
            {plural(
              c.duracionMaxima,
              'día calendario',
              'días calendario'
            )}.
          </p>

          {rangoInvalido && (
            <div className="alert alert-danger">
              La fecha de devolución debe ser posterior
              a la fecha de inicio.
            </div>
          )}

          {duracionExcedida && (
            <div className="alert alert-danger">
              Duración excedida: solicitaste {dias} días
              y el máximo es {c.duracionMaxima}.
              {fechaInicio && <> Ajusta la devolución al <strong className="mono">{dateOnly(sumarDias(fechaInicio, c.duracionMaxima))}</strong> o antes.</>}
            </div>
          )}

          <span className="section-label">
            JUSTIFICACIÓN
          </span>

          <Field label="CURSO ASOCIADO">
            <select
              value={curso}
              onChange={(ev) => setCurso(ev.target.value)}
              required
            >
              <option value="">Selecciona un curso</option>

              {CURSOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="MOTIVO DE LA SOLICITUD"
            help="Mínimo 20 caracteres. El encargado lo verá al evaluar tu solicitud."
          >
            <textarea
              rows="4"
              value={motivo}
              minLength={20}
              required
              placeholder="Explica para qué práctica o proyecto necesitas el equipo."
              onChange={(ev) => setMotivo(ev.target.value)}
            />
          </Field>

          {motivo.length > 0 && motivo.trim().length < 20 && (
            <p className="text-danger">
              Faltan {20 - motivo.trim().length} caracteres.
            </p>
          )}

          {c.requiereAutorizacion && (
            <p className="inline-note">
              Este equipo requiere la autorización
              del docente del curso asociado.
            </p>
          )}

          {restriccion && (
            <div className="alert alert-danger" role="alert">
              {restriccion.deuda
                ? <>Con deuda pendiente: <strong className="mono">{restriccion.deuda}</strong>
                    {restriccion.prestamo && <> por el préstamo <span className="mono">{restriccion.prestamo}</span></>}
                    {' · '}no puedes solicitar hasta regularizar. </>
                : <><strong>Cuenta bloqueada</strong> · no puedes solicitar hasta regularizar. </>}
              <Link to="/student/cuenta">Ver mi deuda</Link>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Link
              to={'/student/equipos/' + e.id}
              className="btn btn-secondary"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviando || !!restriccion}
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>

        </form>

        <aside className="summary-box">

          <strong>{e.nombre}</strong>

          <p className="text-muted">
            {e.marca} · {libres} de {e.unidades.length}
            {' '}unidades libres
          </p>

          <span className="section-label">
            CONDICIONES QUE ACEPTAS
          </span>

          <p>
            {fechaFin
              ? `Devolución el ${fechaFin.split('-').reverse().join('/')} antes de las 19:00`
              : 'Selecciona tu fecha de devolución'}
            {' '}en el {e.almacen}.
            {' '}Verificación de accesorios en la
            entrega y el retorno.
            {' '}Penalidad de {money(c.penalidadDia)}
            {' '}por día de retraso.
            {' '}
            {c.admiteRenovacion
              ? 'Admite renovación.'
              : 'Sin renovación.'}
          </p>

          <label className="check-row">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(ev) => setAcepta(ev.target.checked)}
            />
            Acepto las condiciones del préstamo.
          </label>

        </aside>

      </div>
    </div>
  )
}
