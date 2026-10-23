// src/services/usersService.js
// HU-7 · Gestión de usuarios. Listado de estudiantes con filtros, ficha con
// historial de préstamos y bloqueo / desbloqueo de cuentas con motivo.
//
// Entrega 1: el bloqueo y el desbloqueo NO se guardan. Se validan igual que
// en el servidor y la interfaz los muestra, pero viven solo en memoria
// (`cambios`): al recargar la página se vuelve a los datos del seed.
// En la Entrega 2 se guardarán en la base de datos a través de la API.

import { getAll, newId, delay, ServiceError } from './db.js'
import { FECHA_CORTE, MOTIVOS_BLOQUEO, MOTIVOS_DESBLOQUEO, ESTADOS_USUARIO } from '../shared/constants.js'
import { validateBloqueo, hasErrors } from '../shared/validators.js'
import { fullName } from '../shared/format.js'

export const PAGE_SIZE = 9

// Cambios de la sesión actual (no se escriben en localStorage)
const cambios = {
  estados: {},   // usuarioId -> estado nuevo
  bloqueos: []   // registros de bloqueo / desbloqueo hechos en esta visita
}

function localIsoNow() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}

// Sin tildes ni mayúsculas, para la búsqueda
function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Datos que ve el encargado (nunca la contraseña)
function toFila(u, prestamos) {
  const { password, ...rest } = u
  const vigentes = prestamos.filter((p) => p.usuarioId === u.id && p.estado === 'entregada')
  return {
    ...rest,
    nombre: fullName(u),
    deuda: Number(u.deuda) || 0,
    prestamosVigentes: vigentes.length,
    vencidos: vigentes.filter((p) => p.vence < FECHA_CORTE).length
  }
}

function estudiantes() {
  return getAll('usuarios')
    .filter((u) => u.rol === 'estudiante')
    .map((u) => (cambios.estados[u.id] ? { ...u, estado: cambios.estados[u.id] } : u))
}

function bloqueosDe(id) {
  return [...getAll('bloqueos'), ...cambios.bloqueos].filter((b) => b.usuarioId === id)
}

// ---------- 7.3 Listado ----------

export async function listEstudiantes({ carrera = '', estado = '', q = '', page = 1, pageSize = PAGE_SIZE } = {}) {
  await delay(250)
  const prestamos = getAll('prestamos')
  const todos = estudiantes()
  const term = normalize(q)

  const filtrados = todos
    .filter((u) => !carrera || u.carrera === carrera)
    .filter((u) => !estado || u.estado === estado)
    .filter((u) => !term || [fullName(u), u.codigo, u.correo].some((v) => normalize(v).includes(term)))
    .sort((a, b) => fullName(a).localeCompare(fullName(b), 'es'))

  const pages = Math.max(1, Math.ceil(filtrados.length / pageSize))
  const actual = Math.min(Math.max(1, page), pages)

  return {
    items: filtrados.slice((actual - 1) * pageSize, actual * pageSize).map((u) => toFila(u, prestamos)),
    total: filtrados.length,
    page: actual,
    pageSize,
    // Resumen de todos los estudiantes (no depende de los filtros)
    resumen: {
      total: todos.length,
      conDeuda: todos.filter((u) => Number(u.deuda) > 0).length,
      bloqueados: todos.filter((u) => u.estado === 'bloqueado').length
    }
  }
}

// ---------- Ficha del estudiante con su historial ----------

export async function getEstudiante(id) {
  await delay(250)
  const u = estudiantes().find((x) => x.id === id)
  if (!u) throw new ServiceError(404, 'El estudiante no existe.')

  const equipos = getAll('equipos')
  const unidades = getAll('unidades')
  const prestamos = getAll('prestamos')

  const historial = prestamos
    .filter((p) => p.usuarioId === id)
    .sort((a, b) => b.entrega.localeCompare(a.entrega))
    .map((p) => {
      const equipo = equipos.find((e) => e.id === p.equipoId)
      const unidad = unidades.find((x) => x.id === p.unidadId)
      const vencido = p.estado === 'entregada' && p.vence < FECHA_CORTE
      const diasVencido = vencido
        ? Math.round((new Date(FECHA_CORTE) - new Date(p.vence)) / 86400000)
        : 0
      return {
        ...p,
        equipo: equipo ? equipo.nombre : '—',
        unidad: unidad ? unidad.codigo : '—',
        vencido,
        retraso: p.estado === 'devuelta' ? p.retrasoDias : diasVencido
      }
    })

  const bloqueos = bloqueosDe(id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return { ...toFila(u, prestamos), historial, bloqueos }
}

// ---------- Bloqueo y desbloqueo ----------

// Solo en memoria: la interfaz ve el cambio, pero no se guarda
function cambiarEstado(id, nuevoEstado, registro) {
  cambios.estados[id] = nuevoEstado
  cambios.bloqueos.push(registro)
  return toFila(estudiantes().find((u) => u.id === id), getAll('prestamos'))
}

function buscarEstudiante(id) {
  const u = estudiantes().find((x) => x.id === id)
  if (!u) throw new ServiceError(404, 'El estudiante no existe.')
  return u
}

export async function bloquearCuenta(id, { motivo, detalle }, encargado) {
  await delay()
  const errors = validateBloqueo({ motivo, detalle }, MOTIVOS_BLOQUEO)
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa los datos del bloqueo.', errors)

  const u = buscarEstudiante(id)
  if (u.estado === 'bloqueado') {
    throw new ServiceError(409, 'La cuenta de ' + fullName(u) + ' ya está bloqueada.')
  }
  const enCurso = getAll('prestamos').find((p) => p.usuarioId === id && p.estado === 'entregada')
  if (enCurso) {
    throw new ServiceError(409,
      'No pudimos bloquear la cuenta: tiene el préstamo ' + enCurso.codigo +
      ' entregado sin devolver. Registra primero la devolución.')
  }

  return cambiarEstado(id, 'bloqueado', {
    id: newId('b'),
    usuarioId: id,
    accion: 'bloqueo',
    motivo,
    detalle: String(detalle).trim(),
    fecha: localIsoNow(),
    encargado: encargado || 'Encargado'
  })
}

export async function desbloquearCuenta(id, { motivo, detalle }, encargado) {
  await delay()
  const errors = validateBloqueo({ motivo, detalle }, MOTIVOS_DESBLOQUEO)
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa los datos del desbloqueo.', errors)

  const u = buscarEstudiante(id)
  if (u.estado !== 'bloqueado') {
    throw new ServiceError(409, 'La cuenta de ' + fullName(u) + ' no está bloqueada.')
  }

  // Si aún tiene deuda vuelve a «con deuda»; si no, queda habilitado
  const nuevoEstado = Number(u.deuda) > 0 ? 'con_deuda' : 'habilitado'
  const fila = cambiarEstado(id, nuevoEstado, {
    id: newId('b'),
    usuarioId: id,
    accion: 'desbloqueo',
    motivo,
    detalle: String(detalle).trim(),
    fecha: localIsoNow(),
    encargado: encargado || 'Encargado'
  })
  return { ...fila, estadoLabel: ESTADOS_USUARIO[nuevoEstado] }
}
