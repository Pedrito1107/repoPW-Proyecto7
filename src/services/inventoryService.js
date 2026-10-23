// src/services/inventoryService.js
// HU-2 · Inventario. Equipos, unidades, estados y condiciones del préstamo.

import { getAll, saveAll, newId, delay, ServiceError } from './db.js'
import { CATEGORIAS, ESTADOS_UNIDAD, TRANSICIONES_UNIDAD, MAX_DESCRIPCION } from '../shared/constants.js'
import { isEmpty, isInventoryCode, hasErrors, validateEquipoData } from '../shared/validators.js'

// Fecha y hora local en formato ISO sin zona: 2026-09-14T08:05:00
function localIsoNow() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}

// ---------- Lecturas ----------

export function countByState(unidades) {
  const resumen = { total: unidades.length, disponible: 0, prestada: 0, mantenimiento: 0, baja: 0 }
  unidades.forEach((u) => { resumen[u.estado]++ })
  return resumen
}

function withSummary(equipo, unidades) {
  const propias = unidades.filter((u) => u.equipoId === equipo.id)
  return { ...equipo, resumen: countByState(propias) }
}

export async function listEquipos() {
  await delay(300)
  const unidades = getAll('unidades')
  return getAll('equipos').map((e) => withSummary(e, unidades))
}

export async function listUnidades() {
  return getAll('unidades')
}

export async function getEquipo(id) {
  await delay(250)
  const equipo = getAll('equipos').find((e) => e.id === id)
  if (!equipo) throw new ServiceError(404, 'El equipo no existe.')
  const unidades = getAll('unidades').filter((u) => u.equipoId === id)
  const ids = unidades.map((u) => u.id)
  const historial = getAll('historialEstados')
    .filter((h) => ids.includes(h.unidadId))
    .map((h) => ({ ...h, codigo: unidades.find((u) => u.id === h.unidadId).codigo }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  return { ...withSummary(equipo, unidades), unidades, historial }
}

// Ficha pública: solo equipos publicados con al menos una unidad activa
export async function getFichaPublica(id) {
  const data = await getEquipo(id)
  const activas = data.unidades.filter((u) => u.estado !== 'baja')
  if (data.borrador || activas.length === 0) {
    throw new ServiceError(404, 'La ficha del equipo no está publicada.')
  }
  return { ...data, unidades: activas, historial: undefined }
}

export async function findUnidadByCodigo(codigo) {
  const code = String(codigo).trim().toUpperCase()
  return getAll('unidades').find((u) => u.codigo === code) || null
}

// ---------- Equipos ----------

function cleanEquipo(data) {
  return {
    nombre: String(data.nombre || '').trim(),
    marca: String(data.marca || '').trim(),
    modelo: String(data.modelo || '').trim(),
    categoria: data.categoria || '',
    descripcion: String(data.descripcion || '').trim(),
    accesorios: (data.accesorios || []).map((a) => a.trim()).filter(Boolean),
    fotos: (data.fotos || []).map((f) => f.trim()).filter(Boolean)
  }
}

// Repite las validaciones del formulario y además revisa duplicados
function validateEquipo(data, borrador, excludeId) {
  const errors = validateEquipoData(data, borrador, { categorias: CATEGORIAS, maxDescripcion: MAX_DESCRIPCION })

  if (!errors.marca && !errors.modelo && data.marca && data.modelo) {
    const duplicado = getAll('equipos').find((e) =>
      e.id !== excludeId &&
      e.marca.toLowerCase() === data.marca.toLowerCase() &&
      e.modelo.toLowerCase() === data.modelo.toLowerCase()
    )
    if (duplicado) errors.modelo = 'Ya existe un equipo con esta marca y modelo.'
  }
  return errors
}

export async function createEquipo(data, { borrador = false, almacen } = {}) {
  await delay()
  const clean = cleanEquipo(data)
  const errors = validateEquipo(clean, borrador)
  if (hasErrors(errors)) throw new ServiceError(400, 'No se pudo guardar.', errors)

  const equipo = {
    id: newId('e'),
    ...clean,
    condiciones: { duracionMaxima: 7, requiereAutorizacion: false, admiteRenovacion: true, penalidadDia: 10 },
    almacen: almacen || 'Almacén H-102',
    borrador
  }
  saveAll('equipos', [...getAll('equipos'), equipo])
  return equipo
}

export async function updateEquipo(id, data, { borrador = false } = {}) {
  await delay()
  const equipos = getAll('equipos')
  const index = equipos.findIndex((e) => e.id === id)
  if (index === -1) throw new ServiceError(404, 'El equipo no existe.')

  const clean = cleanEquipo(data)
  const errors = validateEquipo(clean, borrador, id)
  if (hasErrors(errors)) throw new ServiceError(400, 'No se pudo guardar.', errors)

  equipos[index] = { ...equipos[index], ...clean, borrador }
  saveAll('equipos', equipos)
  return equipos[index]
}

export async function deleteEquipo(id) {
  await delay()
  const equipo = getAll('equipos').find((e) => e.id === id)
  if (!equipo) throw new ServiceError(404, 'El equipo no existe.')

  const unidades = getAll('unidades')
  const prestadas = unidades.filter((u) => u.equipoId === id && u.estado === 'prestada')
  if (prestadas.length) {
    throw new ServiceError(409,
      'No se puede eliminar: ' + prestadas.length + ' unidad(es) están prestadas. Registra primero la devolución.')
  }
  const ids = unidades.filter((u) => u.equipoId === id).map((u) => u.id)
  saveAll('equipos', getAll('equipos').filter((e) => e.id !== id))
  saveAll('unidades', unidades.filter((u) => u.equipoId !== id))
  saveAll('historialEstados', getAll('historialEstados').filter((h) => !ids.includes(h.unidadId)))
}

export async function updateCondiciones(id, data) {
  await delay()
  const errors = {}
  const duracion = Number(data.duracionMaxima)
  const penalidad = Number(data.penalidadDia)
  if (!Number.isInteger(duracion) || duracion < 1 || duracion > 60) {
    errors.duracionMaxima = 'Ingresa un número entero de días entre 1 y 60.'
  }
  if (isEmpty(data.penalidadDia) || Number.isNaN(penalidad) || penalidad < 0) {
    errors.penalidadDia = 'Ingresa un monto mayor o igual a 0.'
  }
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa las condiciones.', errors)

  const equipos = getAll('equipos')
  const index = equipos.findIndex((e) => e.id === id)
  if (index === -1) throw new ServiceError(404, 'El equipo no existe.')
  equipos[index].condiciones = {
    duracionMaxima: duracion,
    requiereAutorizacion: Boolean(data.requiereAutorizacion),
    admiteRenovacion: Boolean(data.admiteRenovacion),
    penalidadDia: Math.round(penalidad * 100) / 100
  }
  saveAll('equipos', equipos)
  return equipos[index]
}

// ---------- Unidades ----------

// Propone el siguiente código libre: INV-OSC-0047, etc.
export function suggestCodigo(equipoId, nombre = '') {
  const unidades = getAll('unidades')
  const propia = unidades.find((u) => u.equipoId === equipoId)
  const prefijo = propia
    ? propia.codigo.slice(4, 7)
    : (nombre.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'EQP').padEnd(3, 'X')
  const numeros = unidades
    .filter((u) => u.codigo.slice(4, 7) === prefijo)
    .map((u) => Number(u.codigo.slice(8)))
  const siguiente = (numeros.length ? Math.max(...numeros) : 0) + 1
  return 'INV-' + prefijo + '-' + String(siguiente).padStart(4, '0')
}

export async function createUnidad(equipoId, data) {
  await delay()
  const codigo = String(data.codigo || '').trim().toUpperCase()
  const errors = {}
  if (!isInventoryCode(codigo)) errors.codigo = 'Usa el formato INV-XXX-0000.'
  else if (getAll('unidades').some((u) => u.codigo === codigo)) errors.codigo = 'Ese código ya está registrado.'
  if (isEmpty(data.ubicacion)) errors.ubicacion = 'Indica la ubicación.'
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa los datos de la unidad.', errors)
  if (!getAll('equipos').some((e) => e.id === equipoId)) throw new ServiceError(404, 'El equipo no existe.')

  const unidad = {
    id: newId('n'),
    equipoId,
    codigo,
    ubicacion: data.ubicacion.trim(),
    observaciones: String(data.observaciones || '').trim(),
    estado: 'disponible',
    prestamoVigente: null
  }
  saveAll('unidades', [...getAll('unidades'), unidad])
  return unidad
}

export async function updateUnidad(id, data) {
  await delay()
  const errors = {}
  if (isEmpty(data.ubicacion)) errors.ubicacion = 'Indica la ubicación.'
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa los datos de la unidad.', errors)

  const unidades = getAll('unidades')
  const index = unidades.findIndex((u) => u.id === id)
  if (index === -1) throw new ServiceError(404, 'La unidad no existe.')
  unidades[index] = {
    ...unidades[index],
    ubicacion: data.ubicacion.trim(),
    observaciones: String(data.observaciones || '').trim()
  }
  saveAll('unidades', unidades)
  return unidades[index]
}

export async function changeEstadoUnidad(id, hacia, motivo, usuario) {
  await delay()
  const unidades = getAll('unidades')
  const index = unidades.findIndex((u) => u.id === id)
  if (index === -1) throw new ServiceError(404, 'La unidad no existe.')
  const unidad = unidades[index]

  const errors = {}
  if (!TRANSICIONES_UNIDAD[unidad.estado].includes(hacia)) {
    errors.hacia = 'No se puede pasar de «' + ESTADOS_UNIDAD[unidad.estado] + '» a «' + (ESTADOS_UNIDAD[hacia] || hacia) + '».'
  }
  if (String(motivo || '').trim().length < 10) errors.motivo = 'Describe el motivo (mínimo 10 caracteres).'
  if (hasErrors(errors)) throw new ServiceError(400, 'No se pudo cambiar el estado.', errors)

  unidades[index] = { ...unidad, estado: hacia }
  saveAll('unidades', unidades)
  saveAll('historialEstados', [
    ...getAll('historialEstados'),
    {
      id: newId('h'),
      unidadId: id,
      desde: unidad.estado,
      hacia,
      motivo: motivo.trim(),
      fecha: localIsoNow(),
      usuario
    }
  ])
  return unidades[index]
}
