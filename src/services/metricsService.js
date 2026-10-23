// src/services/metricsService.js
// HU-7 · Métricas. Tablero del almacén y ranking de equipos.
// Solo lee: préstamos (HU-4/HU-5), unidades y equipos (HU-2) y usuarios (HU-1).
// Todo se calcula a partir de los datos, nada está escrito a mano.

import { getAll, delay, ServiceError } from './db.js'
import { FECHA_CORTE, CATEGORIAS, GRUPOS_CATEGORIA } from '../shared/constants.js'
import { validateRango, hasErrors } from '../shared/validators.js'
import { money, shortCarrera, dateOnly } from '../shared/format.js'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']

const DIA_MS = 24 * 60 * 60 * 1000

// ---------- Fechas (YYYY-MM-DD) ----------

function toDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

function addDays(iso, n) {
  const d = toDate(iso)
  d.setDate(d.getDate() + n)
  return toIso(d)
}

// Días entre dos fechas, contando ambos extremos
function daysBetween(desde, hasta) {
  return Math.round((toDate(hasta) - toDate(desde)) / DIA_MS) + 1
}

// Meses (año y mes) que toca el rango, en orden
function mesesDelRango(desde, hasta) {
  const meses = []
  let y = Number(desde.slice(0, 4))
  let m = Number(desde.slice(5, 7))
  const yFin = Number(hasta.slice(0, 4))
  const mFin = Number(hasta.slice(5, 7))
  while (y < yFin || (y === yFin && m <= mFin)) {
    meses.push({ clave: y + '-' + String(m).padStart(2, '0'), mes: MESES[m - 1], anio: y })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return meses
}

function checkRango(rango) {
  const errors = validateRango(rango, FECHA_CORTE)
  if (hasErrors(errors)) throw new ServiceError(400, 'Revisa el rango de fechas.', errors)
}

// ---------- Lecturas comunes ----------

const fechaEntrega = (p) => p.entrega.slice(0, 10)

function prestamosEn(prestamos, { desde, hasta }) {
  return prestamos.filter((p) => fechaEntrega(p) >= desde && fechaEntrega(p) <= hasta)
}

function contarPor(items, keyFn) {
  const counts = {}
  items.forEach((it) => {
    const k = keyFn(it)
    counts[k] = (counts[k] || 0) + 1
  })
  return counts
}

function datosBase() {
  const equipos = getAll('equipos').filter((e) => !e.borrador)
  const unidades = getAll('unidades')
  const prestamos = getAll('prestamos')
  const usuarios = getAll('usuarios')
  return { equipos, unidades, prestamos, usuarios }
}

// ---------- 7.1 Tablero ----------

export async function getTablero(rango) {
  await delay(300)
  checkRango(rango)
  const { unidades, prestamos, usuarios } = datosBase()

  // Préstamos del periodo frente al periodo anterior de la misma duración
  const delPeriodo = prestamosEn(prestamos, rango)
  const dias = daysBetween(rango.desde, rango.hasta)
  const anterior = prestamosEn(prestamos, {
    desde: addDays(rango.desde, -dias),
    hasta: addDays(rango.desde, -1)
  })
  const variacion = anterior.length
    ? Math.round(((delPeriodo.length - anterior.length) / anterior.length) * 100)
    : null

  // Estado actual del inventario (no depende del rango)
  const estado = { disponible: 0, prestada: 0, mantenimiento: 0, baja: 0 }
  unidades.forEach((u) => { estado[u.estado]++ })

  const vencidos = prestamos.filter((p) => p.estado === 'entregada' && p.vence < FECHA_CORTE)
  const deudaTotal = usuarios.reduce((s, u) => s + (Number(u.deuda) || 0), 0)

  // Indicadores del periodo
  const devueltos = delPeriodo.filter((p) => p.estado === 'devuelta')
  const promedio = devueltos.length
    ? devueltos.reduce((s, p) => s + daysBetween(fechaEntrega(p), p.devolucion.slice(0, 10)) - 1, 0) / devueltos.length
    : null
  const aTiempo = devueltos.length
    ? Math.round((devueltos.filter((p) => !p.retrasoDias).length / devueltos.length) * 100)
    : null
  const porUnidad = contarPor(delPeriodo, (p) => p.unidadId)
  const topUnidadId = Object.keys(porUnidad).sort((a, b) => porUnidad[b] - porUnidad[a])[0]
  const topUnidad = unidades.find((u) => u.id === topUnidadId)

  const porMesCount = contarPor(delPeriodo, (p) => p.entrega.slice(0, 7))

  return {
    rango,
    fechaCorte: FECHA_CORTE,
    kpis: {
      prestamosPeriodo: delPeriodo.length,
      variacion,
      disponibles: estado.disponible,
      totalUnidades: unidades.length,
      vencidos: vencidos.length,
      deudaTotal,
      mantenimiento: estado.mantenimiento
    },
    porMes: mesesDelRango(rango.desde, rango.hasta).map((m) => ({ ...m, total: porMesCount[m.clave] || 0 })),
    estadoInventario: [
      { estado: 'disponible', label: 'Disponibles', total: estado.disponible, tone: 'success' },
      { estado: 'prestada', label: 'Prestadas', total: estado.prestada, tone: 'info' },
      { estado: 'mantenimiento', label: 'En mantenimiento', total: estado.mantenimiento, tone: 'warning' },
      { estado: 'baja', label: 'Dadas de baja', total: estado.baja, tone: 'muted' }
    ],
    resumen: {
      promedioDias: promedio === null ? null : Math.round(promedio * 10) / 10,
      aTiempo,
      unidadMasSolicitada: topUnidad ? topUnidad.codigo : null
    }
  }
}

// ---------- 7.2 Ranking ----------

// Días que el préstamo ocupó la unidad dentro del rango
function diasOcupados(p, desde, hasta) {
  const inicio = fechaEntrega(p) > desde ? fechaEntrega(p) : desde
  const finPrestamo = p.devolucion ? p.devolucion.slice(0, 10) : FECHA_CORTE
  const fin = finPrestamo < hasta ? finPrestamo : hasta
  return fin < inicio ? 0 : daysBetween(inicio, fin)
}

export async function getRanking({ desde, hasta, categoria = '' }) {
  await delay(300)
  checkRango({ desde, hasta })
  if (categoria && !CATEGORIAS.includes(categoria)) {
    throw new ServiceError(400, 'La categoría no existe.')
  }
  const { equipos, unidades, prestamos, usuarios } = datosBase()

  const visibles = equipos.filter((e) => !categoria || e.categoria === categoria)
  const idsVisibles = visibles.map((e) => e.id)
  const delPeriodo = prestamosEn(prestamos, { desde, hasta }).filter((p) => idsVisibles.includes(p.equipoId))
  const diasPeriodo = daysBetween(desde, hasta)

  const filas = visibles.map((e) => {
    const activas = unidades.filter((u) => u.equipoId === e.id && u.estado !== 'baja')
    const propios = delPeriodo.filter((p) => p.equipoId === e.id)
    const ocupados = prestamos
      .filter((p) => p.equipoId === e.id)
      .reduce((s, p) => s + diasOcupados(p, desde, hasta), 0)
    const capacidad = activas.length * diasPeriodo
    const historicos = prestamos.filter((p) => p.equipoId === e.id).map(fechaEntrega).sort()
    return {
      id: e.id,
      nombre: e.nombre,
      marca: e.marca,
      categoria: e.categoria,
      unidades: activas.length,
      prestamos: propios.length,
      uso: capacidad ? Math.min(100, Math.round((ocupados / capacidad) * 100)) : 0,
      ultimoPrestamo: historicos.length ? historicos[historicos.length - 1] : null
    }
  })

  const masSolicitados = filas
    .filter((f) => f.prestamos > 0)
    .sort((a, b) => b.prestamos - a.prestamos || b.uso - a.uso || a.nombre.localeCompare(b.nombre))
    .slice(0, 5)

  // Sin movimiento: equipos sin préstamos en el periodo. Primero los que
  // tuvieron algún préstamo (del más reciente al más antiguo), al final los
  // que nunca se prestaron.
  const sinMovimiento = filas
    .filter((f) => f.prestamos === 0)
    .sort((a, b) => {
      if (!a.ultimoPrestamo) return 1
      if (!b.ultimoPrestamo) return -1
      return b.ultimoPrestamo.localeCompare(a.ultimoPrestamo)
    })

  const carreraDe = Object.fromEntries(usuarios.map((u) => [u.id, u.carrera]))
  const porCarreraCount = contarPor(delPeriodo, (p) => carreraDe[p.usuarioId] || 'Sin carrera')
  const porCarrera = Object.entries(porCarreraCount)
    .map(([carrera, total]) => ({ carrera: shortCarrera(carrera), total }))
    .sort((a, b) => b.total - a.total)

  // Con categoría elegida se muestra solo esa serie; si no, los dos grupos
  const series = categoria
    ? [{ nombre: categoria, categorias: [categoria] }]
    : Object.entries(GRUPOS_CATEGORIA).map(([nombre, categorias]) => ({ nombre, categorias }))
  const categoriaDe = Object.fromEntries(equipos.map((e) => [e.id, e.categoria]))
  const porMesCategoria = mesesDelRango(desde, hasta).map((m) => ({
    ...m,
    valores: series.map((s) => delPeriodo.filter((p) =>
      p.entrega.slice(0, 7) === m.clave && s.categorias.includes(categoriaDe[p.equipoId])).length)
  }))

  return {
    rango: { desde, hasta },
    categoria,
    totalPrestamos: delPeriodo.length,
    masSolicitados,
    sinMovimiento,
    porCarrera,
    series: series.map((s) => s.nombre),
    porMesCategoria
  }
}

// ---------- Exportar (CSV) ----------

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return /[";\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

function toCsv(rows) {
  // Separador «;» y BOM para que Excel en español lo abra con tildes y columnas
  return '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n')
}

export async function exportarTablero(rango) {
  const [tablero, ranking] = await Promise.all([getTablero(rango), getRanking(rango)])
  const k = tablero.kpis
  const rows = [
    ['Tablero del almacén'],
    ['Periodo', dateOnly(rango.desde) + ' al ' + dateOnly(rango.hasta)],
    ['Datos al', dateOnly(tablero.fechaCorte)],
    [],
    ['Indicador', 'Valor'],
    ['Préstamos del periodo', k.prestamosPeriodo],
    ['Variación frente al periodo anterior (%)', k.variacion === null ? 'sin datos' : k.variacion],
    ['Unidades disponibles', k.disponibles],
    ['Unidades registradas', k.totalUnidades],
    ['Préstamos vencidos', k.vencidos],
    ['Penalidades pendientes', money(k.deudaTotal)],
    ['Unidades en mantenimiento', k.mantenimiento],
    ['Tiempo promedio de préstamo (días)', tablero.resumen.promedioDias ?? 'sin datos'],
    ['Devoluciones a tiempo (%)', tablero.resumen.aTiempo ?? 'sin datos'],
    ['Unidad más solicitada', tablero.resumen.unidadMasSolicitada || 'sin datos'],
    [],
    ['Mes', 'Préstamos'],
    ...tablero.porMes.map((m) => [m.mes + ' ' + m.anio, m.total]),
    [],
    ['Estado del inventario', 'Unidades'],
    ...tablero.estadoInventario.map((e) => [e.label, e.total]),
    [],
    ['Más solicitados', 'Categoría', 'Préstamos', 'Uso (%)'],
    ...ranking.masSolicitados.map((f) => [f.nombre, f.categoria, f.prestamos, f.uso]),
    [],
    ['Sin movimiento', 'Unidades', 'Último préstamo'],
    ...ranking.sinMovimiento.map((f) => [f.nombre, f.unidades, f.ultimoPrestamo ? dateOnly(f.ultimoPrestamo) : 'sin registros']),
    [],
    ['Carrera', 'Préstamos'],
    ...ranking.porCarrera.map((c) => [c.carrera, c.total])
  ]
  return {
    nombre: 'tablero_' + rango.desde + '_' + rango.hasta + '.csv',
    contenido: toCsv(rows)
  }
}
