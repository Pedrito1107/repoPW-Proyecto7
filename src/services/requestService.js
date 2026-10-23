
import {
  getAll,
  saveAll,
  newId,
  ServiceError
} from './db.js'

// Convierte una fecha YYYY-MM-DD a milisegundos
function fechaNumero(fecha) {
  return Date.parse(`${fecha}T00:00:00Z`)
}

// Calcula días entre dos fechas
export function calcularDias(inicio, fin) {
  if (!inicio || !fin) return 0

  const a = fechaNumero(inicio)
  const b = fechaNumero(fin)

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return 0
  }

  return Math.round((b - a) / 86400000)
}

// Comprueba si dos rangos se superponen
function seCruzan(inicio1, fin1, inicio2, fin2) {
  return inicio1 <= fin2 && fin1 >= inicio2
}

// Restricción de la cuenta del estudiante para solicitar (mismas reglas que
// crearSolicitud): null si puede solicitar; si no,
// { bloqueada, deuda: 'S/ 60.00' | null, prestamo: 'PRE-2026-0303' | null }
export function restriccionDe(usuarioId) {
  const u = getAll('usuarios').find((x) => x.id === usuarioId)
  if (!u || u.rol !== 'estudiante') return null
  const deuda = Number(u.deuda || 0)
  if (u.estado !== 'bloqueado' && u.estado !== 'con_deuda' && deuda <= 0) return null
  return {
    bloqueada: u.estado === 'bloqueado',
    deuda: deuda > 0 ? 'S/ ' + deuda.toFixed(2) : null,
    prestamo: u.prestamoDeuda || null
  }
}

// Obtiene las solicitudes del almacén
export function obtenerSolicitudes() {
  return getAll('solicitudes')
}

// Registra una nueva solicitud
export function crearSolicitud(datos) {
  const equipos = getAll('equipos')
  const unidades = getAll('unidades')
  const usuarios = getAll('usuarios')
  const solicitudes = obtenerSolicitudes()

  const equipo = equipos.find(
    (e) => e.id === datos.equipoId
  )

  const estudiante = usuarios.find(
    (u) => u.id === datos.estudianteId
  )

  if (!equipo) {
    throw new ServiceError(404, 'Equipo no encontrado.')
  }

  if (!estudiante || estudiante.rol !== 'estudiante') {
    throw new ServiceError(403, 'Debes iniciar sesión como estudiante.')
  }

  if (
    estudiante.estado === 'bloqueado' ||
    estudiante.estado === 'con_deuda' ||
    Number(estudiante.deuda || 0) > 0
  ) {
    throw new ServiceError(
      403,
      'Tu cuenta tiene una restricción o deuda pendiente.'
    )
  }

  const {
    fechaInicio,
    fechaFin,
    curso,
    motivo,
    aceptaCondiciones
  } = datos

  if (!fechaInicio || !fechaFin) {
    throw new ServiceError(400, 'Selecciona ambas fechas.')
  }

  const hoy = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, '0'),
    String(new Date().getDate()).padStart(2, '0')
  ].join('-')

  if (fechaInicio < hoy) {
    throw new ServiceError(
      400,
      'La fecha de inicio no puede estar en el pasado.'
    )
  }

  const dias = calcularDias(fechaInicio, fechaFin)

  if (dias <= 0) {
    throw new ServiceError(
      400,
      'La devolución debe ser posterior al inicio.'
    )
  }

  if (dias > equipo.condiciones.duracionMaxima) {
    throw new ServiceError(
      400,
      `La duración máxima es de ${equipo.condiciones.duracionMaxima} días.`
    )
  }

  if (!curso) {
    throw new ServiceError(400, 'Selecciona un curso.')
  }

  if (!motivo || motivo.trim().length < 20) {
    throw new ServiceError(
      400,
      'El motivo debe tener al menos 20 caracteres.'
    )
  }

  if (!aceptaCondiciones) {
    throw new ServiceError(
      400,
      'Debes aceptar las condiciones del préstamo.'
    )
  }

  // Disponibilidad inicial de unidades
  const libres = unidades.filter(
    (u) =>
      u.equipoId === equipo.id &&
      u.estado === 'disponible'
  ).length

  if (libres === 0) {
    throw new ServiceError(
      409,
      'No hay unidades disponibles para solicitar.'
    )
  }

  // Evita solicitudes propias duplicadas en esas fechas
  const duplicada = solicitudes.some(
    (s) =>
      s.estudianteId === estudiante.id &&
      s.equipoId === equipo.id &&
      ['enviada', 'aprobada', 'entregada'].includes(s.estado) &&
      seCruzan(
        fechaInicio,
        fechaFin,
        s.fechaInicio,
        s.fechaFin
      )
  )

  if (duplicada) {
    throw new ServiceError(
      409,
      'Ya tienes una solicitud activa de este equipo en esas fechas.'
    )
  }

  // Verificación básica de compromisos existentes
  const compromisos = solicitudes.filter(
    (s) =>
      s.equipoId === equipo.id &&
      ['aprobada', 'entregada'].includes(s.estado) &&
      seCruzan(
        fechaInicio,
        fechaFin,
        s.fechaInicio,
        s.fechaFin
      )
  ).length

  if (compromisos >= libres) {
    throw new ServiceError(
      409,
      'No hay capacidad disponible en el rango elegido.'
    )
  }

  const solicitud = {
    id: newId('s'),
    codigo: `PRE-${new Date().getFullYear()}-${Date.now()}`,
    estudianteId: estudiante.id,
    equipoId: equipo.id,
    fechaInicio,
    fechaFin,
    curso,
    motivo: motivo.trim(),
    estado: 'enviada',
    unidadId: null,
    unidad: null,
    motivoRechazo: null,
    fechaSolicitud: new Date().toISOString()
  }

  saveAll('solicitudes', [...solicitudes, solicitud])

  return solicitud
}
