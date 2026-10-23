// src/services/loansService.js
// HU-4 · Aprobación y entrega. Lee del seed las solicitudes, los préstamos,
// los equipos, las unidades y los usuarios, y arma los datos tal como los
// muestran la bandeja, la entrega, la constancia y los préstamos vigentes.
// (Antes estaba escrito a mano en pages/loans/demoData.js.)

import { getAll } from './db.js'
import { FECHA_CORTE } from '../shared/constants.js'
import { money, fullName, dateOnly, shortCarrera } from '../shared/format.js'

const DIA_MS = 24 * 60 * 60 * 1000
// Momento de corte de los datos de la Entrega 1 (como "Última sincronización")
const AHORA = new Date(FECHA_CORTE + 'T08:05:00')

export function equipoDe(equipoId) {
  return getAll('equipos').find((e) => e.id === equipoId) || null
}

// Unidades del equipo (sin las dadas de baja) para asignar al aprobar (4.2)
export function unidadesDe(equipoId) {
  return getAll('unidades').filter((u) => u.equipoId === equipoId && u.estado !== 'baja')
}

function usuarioDe(id) {
  return getAll('usuarios').find((u) => u.id === id) || null
}

function codigoUnidad(unidadId) {
  return getAll('unidades').find((u) => u.id === unidadId)?.codigo || '—'
}

// "hace 2 h", "hace 3 d"
function antiguedad(iso) {
  const horas = Math.max(0, Math.round((AHORA - new Date(iso)) / 3600000))
  return horas < 24 ? 'hace ' + horas + ' h' : 'hace ' + Math.round(horas / 24) + ' d'
}

// Días que faltan para la fecha pactada (negativo = días de retraso)
function diasHastaVencer(vence) {
  return Math.round((new Date(vence + 'T00:00:00') - new Date(FECHA_CORTE + 'T00:00:00')) / DIA_MS)
}

// ---------- Bandeja de solicitudes (4.1) ----------

function aFilaBandeja(s) {
  const u = usuarioDe(s.estudianteId)
  const equipo = equipoDe(s.equipoId)
  const desde = dateOnly(s.fechaInicio)
  const hasta = dateOnly(s.fechaFin)
  return {
    id: s.codigo,
    estudiante: fullName(u),
    usuarioId: s.estudianteId,
    carrera: u?.carrera ? shortCarrera(u.carrera) + ' · ' + u.ciclo + '.º' : '',
    deuda: Number(u?.deuda) > 0 ? money(u.deuda) : null,
    equipoId: s.equipoId,
    equipo: equipo?.nombre || '—',
    desde,
    hasta,
    fechas: desde.slice(0, 5) + ' → ' + hasta,
    motivo: s.motivo,
    antiguedad: antiguedad(s.fechaSolicitud),
    estado: s.estado,
    unidad: s.unidad || null,
    curso: s.curso,
    motivoRechazo: s.motivoRechazo || null
  }
}

// Solicitudes que atiende el encargado: enviadas, aprobadas y rechazadas
// (las entregadas ya figuran como préstamos), de la más reciente a la más antigua
export function listarBandeja() {
  return getAll('solicitudes')
    .filter((s) => ['enviada', 'aprobada', 'rechazada'].includes(s.estado))
    .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))
    .map(aFilaBandeja)
}

export function buscarSolicitud(codigo) {
  const s = getAll('solicitudes').find((x) => x.codigo === codigo)
  return s ? aFilaBandeja(s) : null
}

// ---------- Préstamos vigentes (4.6) ----------

function aFilaPrestamo(p) {
  const u = usuarioDe(p.usuarioId)
  const ciclo = u?.ciclo ? u.ciclo + '.º ciclo · ' : ''
  return {
    codigo: p.codigo,
    equipoId: p.equipoId,
    equipo: equipoDe(p.equipoId)?.nombre || '—',
    unidad: codigoUnidad(p.unidadId),
    estudiante: fullName(u),
    usuarioId: p.usuarioId,
    info: shortCarrera(u?.carrera) + ' · ' + ciclo + 'código ' + (u?.codigo || '—'),
    curso: p.curso,
    entrega: dateOnly(p.entrega) + ' ' + p.entrega.slice(11, 16),
    vence: dateOnly(p.vence),
    dias: diasHastaVencer(p.vence)
  }
}

// Préstamos entregados y aún no devueltos, del que vence antes al que vence después
export function listarPrestamosVigentes() {
  return getAll('prestamos')
    .filter((p) => p.estado === 'entregada')
    .sort((a, b) => a.vence.localeCompare(b.vence))
    .map(aFilaPrestamo)
}

export function buscarPrestamo(codigo) {
  const p = getAll('prestamos').find((x) => x.codigo === codigo && x.estado === 'entregada')
  return p ? aFilaPrestamo(p) : null
}

// ---------- Constancia de entrega (4.5) ----------

// Constancia del préstamo vigente o de la solicitud aprobada del código
export function constanciaDe(codigo) {
  const registro = getAll('prestamos').find((x) => x.codigo === codigo && x.estado === 'entregada')
  const prestamo = registro ? aFilaPrestamo(registro) : null
  const solicitud = prestamo ? null : buscarSolicitud(codigo)
  const base = prestamo || solicitud
  if (!base) return null

  const equipo = equipoDe(base.equipoId)
  const noEntregados = registro?.accesoriosNoEntregados || []

  return {
    codigo,
    usuarioId: base.usuarioId,
    estudiante: fullName(usuarioDe(base.usuarioId)),
    estudianteInfo: prestamo ? prestamo.info : base.carrera,
    curso: base.curso || '—',
    docente: registro?.docente || null,
    equipo: equipo.marca + ' · ' + equipo.nombre,
    unidad: (base.unidad || '—') + ' · ' + equipo.almacen,
    entrega: prestamo ? prestamo.entrega : base.desde + ' 09:00',
    devolucion: (prestamo ? prestamo.vence : base.hasta) + ' 19:00',
    accesorios: equipo.accesorios.map((a) => [a, noEntregados.includes(a) ? 'No' : 'Sí']),
    penalidad: money(equipo.condiciones.penalidadDia)
  }
}
