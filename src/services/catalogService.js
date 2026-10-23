// src/services/catalogService.js
// HU-3 · Catálogo. Lee equipos y unidades (HU-2) y los cursos del seed.
// (Antes estaba en pages/catalog/demoData.js.)

import { getAll } from './db.js'
import { FECHA_CORTE } from '../shared/constants.js'

// Unidades actuales de un equipo, sin las dadas de baja
function unidadesDe(equipoId) {
  return getAll('unidades').filter(
    (u) => u.equipoId === equipoId && u.estado !== 'baja'
  )
}

// Datos que muestra la tarjeta del catálogo
function resumen(equipo) {
  const unidades = unidadesDe(equipo.id)
  return {
    id: equipo.id,
    nombre: equipo.nombre,
    marca: equipo.marca,
    modelo: equipo.modelo,
    categoria: equipo.categoria,
    libres: unidades.filter((u) => u.estado === 'disponible').length,
    total: unidades.length,
    duracion: equipo.condiciones?.duracionMaxima ?? 0
  }
}

// Orden inicial utilizado en el mockup
const ORDEN = ['e3', 'e9', 'e10', 'e1', 'e2', 'e4', 'e7', 'e8', 'e6', 'e5', 'e11']

// Equipos publicados con al menos una unidad activa
function obtenerCatalogo() {
  const equipos = getAll('equipos')
  const ordenados = [
    ...ORDEN.map((id) => equipos.find((e) => e.id === id)).filter(Boolean),
    ...equipos.filter((e) => !ORDEN.includes(e.id))
  ]
  return ordenados
    .filter((e) => !e.borrador)
    .map(resumen)
    .filter((e) => e.total > 0)
}

// Catálogo actualizado cada vez que un componente lo pide
export function getCatalogoActual() {
  return obtenerCatalogo()
}

// [categoría, cantidad de equipos] para los filtros
export function getCategoriasActuales() {
  return Object.entries(
    obtenerCatalogo().reduce((acc, e) => {
      acc[e.categoria] = (acc[e.categoria] || 0) + 1
      return acc
    }, {})
  )
}

// Ficha de detalle del equipo (null si no está publicado o no tiene unidades)
export function getDetalle(id) {
  const equipo = getAll('equipos').find((e) => e.id === id)
  if (!equipo || equipo.borrador) return null
  const unidades = unidadesDe(id)
  if (unidades.length === 0) return null
  return { ...equipo, unidades }
}

// Cursos para el formulario de solicitud: "IN324 … · Ing. Elena Rivas"
export function getCursos() {
  return getAll('cursos').map((c) => c.nombre + ' · ' + c.docente)
}

// Próxima fecha en que se libera una unidad del equipo: la fecha pactada más
// cercana (desde hoy) de sus préstamos entregados. null si no hay ninguna.
export function proximaLiberacion(equipoId) {
  const fechas = getAll('prestamos')
    .filter((p) => p.equipoId === equipoId && p.estado === 'entregada' && p.vence >= FECHA_CORTE)
    .map((p) => p.vence)
    .sort()
  return fechas[0] || null
}
