// src/services/reservationsService.js
// HU-6 · Reserva anticipada.
// Calendario de ocupación, reserva con validación de solapamiento, lista de
// espera, cancelación y conversión de la reserva en solicitud de préstamo.
//
// Ocupación de un día (provisional, ver docs/contrato-datos.md):
//  · si el seed trae un registro `ocupacion` para ese día, se parte de él;
//  · si no, se calcula con las unidades del equipo, los préstamos entregados
//    y las reservas confirmadas.
//  · Las reservas creadas desde la app (tienen `creadaEn`) siempre restan.
// Los domingos el almacén no atiende.

import { getAll, saveAll, newId, ServiceError } from './db.js'
import { FECHA_CORTE, DIAS_PARA_CONVERTIR, RESERVAS_ACTIVAS } from '../shared/constants.js'
import { fullName, dateOnly } from '../shared/format.js'

// ---------- Fechas (YYYY-MM-DD) ----------

const pad = (n) => String(n).padStart(2, '0')

function aFecha(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function aIso(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

export function sumarDias(iso, n) {
  const d = aFecha(iso)
  d.setDate(d.getDate() + n)
  return aIso(d)
}

// Días entre dos fechas contando ambos extremos: 16 → 18 = 3
export function diasDelRango(desde, hasta) {
  if (!desde || !hasta) return 0
  return Math.round((aFecha(hasta) - aFecha(desde)) / 86400000) + 1
}

export function rangosSeSolapan(aDesde, aHasta, bDesde, bHasta) {
  return aDesde <= bHasta && bDesde <= aHasta
}

export function esDomingo(iso) {
  return aFecha(iso).getDay() === 0
}

function listarDias(desde, hasta) {
  const dias = []
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) dias.push(f)
  return dias
}

// "16/09 → 18/09/2026"
function rango(desde, hasta) {
  return dateOnly(desde).slice(0, 5) + ' → ' + dateOnly(hasta)
}

// ---------- Búsquedas ----------

const nombreEquipo = (id) => getAll('equipos').find((e) => e.id === id)?.nombre || '—'
const nombreUsuario = (id) => fullName(getAll('usuarios').find((u) => u.id === id))

export function listarEquiposReservables() {
  const conUnidades = new Set(getAll('unidades').filter((u) => u.estado !== 'baja').map((u) => u.equipoId))
  return getAll('equipos').filter((e) => !e.borrador && conUnidades.has(e.id))
}

// ---------- Ocupación por día (6.1) ----------

function capacidad(equipoId) {
  return getAll('unidades').filter((u) => u.equipoId === equipoId && u.estado !== 'baja').length
}

function leerRegistro(texto, total) {
  const n = (re) => Number((texto.match(re) || [])[1] || 0)
  const prestadas = n(/(\d+) prestada/)
  const reservadas = n(/(\d+) reservada/)
  let libres
  if (/comprometida/.test(texto)) libres = 0
  else if (/(\d+) libre/.test(texto)) libres = n(/(\d+) libre/)
  else libres = Math.max(0, total - prestadas - reservadas)
  return { prestadas, reservadas, libres }
}

// { cerrado, total, prestadas, reservadas, libres, tipo, texto } de un día
export function ocupacionDelDia(equipoId, fecha) {
  const total = capacidad(equipoId)
  if (esDomingo(fecha)) return { cerrado: true, total, prestadas: 0, reservadas: 0, libres: 0 }

  const registro = getAll('ocupacion').find((o) => o.equipoId === equipoId && o.fecha === fecha)
  const reservas = getAll('reservas').filter((r) =>
    r.equipoId === equipoId && r.estado === 'confirmada' && fecha >= r.desde && fecha <= r.hasta)

  let prestadas, reservadas, libres
  if (registro) {
    const base = leerRegistro(registro.texto, total)
    const nuevas = reservas.filter((r) => r.creadaEn).length
    prestadas = base.prestadas
    reservadas = base.reservadas + nuevas
    libres = Math.max(0, base.libres - nuevas)
  } else {
    const mantenimiento = getAll('unidades').filter((u) => u.equipoId === equipoId && u.estado === 'mantenimiento').length
    prestadas = getAll('prestamos').filter((p) =>
      p.equipoId === equipoId && p.estado === 'entregada' && fecha >= p.entrega.slice(0, 10) && fecha <= p.vence).length
    reservadas = reservas.length
    libres = Math.max(0, total - mantenimiento - prestadas - reservadas)
  }

  const partes = []
  if (prestadas) partes.push(prestadas + (prestadas === 1 ? ' prestada' : ' prestadas'))
  if (reservadas) partes.push(reservadas + (reservadas === 1 ? ' reservada' : ' reservadas'))
  if (libres === 0) partes.length = 0
  const texto = libres === 0 ? total + ' comprometidas' : partes.concat(libres + (libres === 1 ? ' libre' : ' libres')).join(' · ')
  const tipo = libres === 0 || reservadas > 0 ? 'full' : prestadas > 0 ? 'lent' : 'free'
  return { cerrado: false, total, prestadas, reservadas, libres, tipo, texto }
}

// Unidades libres en todo el rango = el mínimo de los días del rango
export function unidadesLibresEnRango(equipoId, desde, hasta) {
  const dias = listarDias(desde, hasta).filter((f) => !esDomingo(f))
  if (!dias.length) return 0
  return Math.min(...dias.map((f) => ocupacionDelDia(equipoId, f).libres))
}

// Grilla de 6 semanas (lunes a domingo) del mes con la ocupación del equipo.
// "seleccion" es el rango que el estudiante eligió en el calendario.
export function calendarioDe(equipoId, anio, mes, seleccion = null) {
  const primero = new Date(anio, mes - 1, 1)
  const diasMes = new Date(anio, mes, 0).getDate()
  const antes = (primero.getDay() + 6) % 7
  const finMesAnterior = new Date(anio, mes - 1, 0).getDate()

  const celdas = []
  for (let i = antes; i > 0; i--) celdas.push({ num: finMesAnterior - i + 1, out: true })
  for (let d = 1; d <= diasMes; d++) {
    const fecha = anio + '-' + pad(mes) + '-' + pad(d)
    const o = ocupacionDelDia(equipoId, fecha)
    const enSeleccion = !!seleccion && fecha >= seleccion.desde && fecha <= seleccion.hasta
    celdas.push({
      num: d,
      fecha,
      tipo: enSeleccion ? 'selected' : o.cerrado ? '' : o.tipo,
      texto: enSeleccion ? 'selección' : o.cerrado ? '' : o.texto,
      hoy: fecha === FECHA_CORTE,
      seleccionable: !o.cerrado && fecha >= FECHA_CORTE
    })
  }
  let siguiente = 1
  while (celdas.length % 7 !== 0) celdas.push({ num: siguiente++, out: true })
  return celdas
}

// Unidades del equipo con su estado de hoy (panel «Unidades comprometidas hoy»)
export function unidadesComprometidasHoy(equipoId) {
  const unidades = getAll('unidades').filter((u) => u.equipoId === equipoId)
  return unidades
    .filter((u) => u.estado !== 'disponible')
    .map((u) => ({ codigo: u.codigo, estado: u.estado }))
}

// ---------- Reservar (6.2) ----------

// Valida el rango sin guardar nada. Sirve para mostrar los mensajes en vivo.
export function validarReserva({ equipoId, usuarioId, desde, hasta }) {
  const res = { errores: {}, solape: null, dias: 0, libres: 0, ok: false }
  const equipo = getAll('equipos').find((e) => e.id === equipoId)
  if (!equipo) {
    res.errores.general = 'Equipo no encontrado.'
    return res
  }
  if (!desde) res.errores.desde = 'Elige la fecha de inicio.'
  else if (desde <= FECHA_CORTE) res.errores.desde = 'La reserva debe ser a futuro: elige desde mañana.'
  else if (esDomingo(desde)) res.errores.desde = 'El almacén no atiende los domingos.'
  if (!hasta) res.errores.hasta = 'Elige la fecha de fin.'
  else if (desde && hasta < desde) res.errores.hasta = 'La fecha final no puede ser anterior a la inicial.'
  if (res.errores.desde || res.errores.hasta) return res

  res.dias = diasDelRango(desde, hasta)
  const max = equipo.condiciones?.duracionMaxima
  if (max && res.dias > max) {
    res.errores.hasta = 'La duración máxima de este equipo es de ' + max + ' días.'
    return res
  }

  // Solapamiento con otra reserva propia del mismo equipo
  const choque = getAll('reservas').find((r) =>
    r.usuarioId === usuarioId && r.equipoId === equipoId &&
    RESERVAS_ACTIVAS.includes(r.estado) && rangosSeSolapan(desde, hasta, r.desde, r.hasta))
  if (choque) {
    res.solape = 'Ya tienes una reserva de este equipo del ' + dateOnly(choque.desde) + ' al ' + dateOnly(choque.hasta) + '. Ajusta el rango para continuar.'
    return res
  }

  res.libres = unidadesLibresEnRango(equipoId, desde, hasta)
  res.ok = true
  return res
}

// Crea la reserva: confirmada si hay unidades libres en todo el rango;
// si todas están comprometidas, queda en lista de espera con su orden de registro.
export function crearReserva({ equipoId, usuarioId, desde, hasta, motivo, curso }) {
  const usuario = getAll('usuarios').find((u) => u.id === usuarioId)
  if (!usuario || usuario.rol !== 'estudiante') throw new ServiceError(403, 'Debes iniciar sesión como estudiante.')
  if (usuario.estado === 'bloqueado') throw new ServiceError(403, 'Tu cuenta está bloqueada y no puede reservar equipos.')

  const v = validarReserva({ equipoId, usuarioId, desde, hasta })
  if (v.solape) throw new ServiceError(409, v.solape)
  if (!v.ok) throw new ServiceError(400, Object.values(v.errores)[0], v.errores)
  if (!motivo || motivo.trim().length < 10) {
    throw new ServiceError(400, 'El motivo debe tener al menos 10 caracteres.', { motivo: 'Escribe al menos 10 caracteres.' })
  }

  const enEspera = v.libres === 0
  const reserva = {
    id: newId('r'),
    usuarioId,
    equipoId,
    desde,
    hasta,
    estado: enEspera ? 'en_espera' : 'confirmada',
    prestamo: null,
    motivo: motivo.trim(),
    curso: curso || '',
    creadaEn: new Date().toISOString()
  }
  saveAll('reservas', [...getAll('reservas'), reserva])

  if (enEspera) {
    const cola = getAll('listaEspera')
    const orden = cola.filter((w) => w.equipoId === equipoId).length + 1
    saveAll('listaEspera', [...cola, {
      id: newId('w'),
      equipoId,
      usuarioId,
      desde,
      hasta,
      orden,
      estado: Number(usuario.deuda || 0) > 0 ? 'deuda' : 'asignar',
      reservaId: reserva.id,
      motivoPausa: null
    }])
  }
  return { reserva, enEspera, puesto: enEspera ? puestoEnEspera(reserva.id) : null }
}

// ---------- Mis reservas (6.3) ----------

// "puesto 2 de 4" si la reserva está en lista de espera
function puestoEnEspera(reservaId) {
  const cola = getAll('listaEspera')
  const w = cola.find((x) => x.reservaId === reservaId)
  if (!w) return null
  const total = cola.filter((x) => x.equipoId === w.equipoId).length
  return 'puesto ' + w.orden + ' de ' + total
}

// ¿La reserva confirmada ya está cerca de su fecha de inicio?
export function puedeConvertir(r) {
  return r.estado === 'confirmada' && r.desde <= sumarDias(FECHA_CORTE, DIAS_PARA_CONVERTIR) && r.hasta >= FECHA_CORTE
}

function aFila(r) {
  const prestamo = r.prestamo || undefined
  return {
    id: r.id,
    estudiante: nombreUsuario(r.usuarioId),
    equipo: nombreEquipo(r.equipoId),
    equipoId: r.equipoId,
    desde: r.desde,
    hasta: r.hasta,
    rango: rango(r.desde, r.hasta),
    estado: r.estado,
    espera: r.estado === 'en_espera' ? puestoEnEspera(r.id) : null,
    prestamo,
    // true si el código ya es un préstamo entregado (y no solo una solicitud)
    esPrestamo: !!prestamo && getAll('prestamos').some((p) => p.codigo === prestamo),
    puedeConvertir: puedeConvertir(r)
  }
}

// "Mis reservas" del estudiante; `estado` filtra (vacío = todas)
export function misReservas(usuarioId, estado = '') {
  return getAll('reservas')
    .filter((r) => r.usuarioId === usuarioId && (!estado || r.estado === estado))
    .sort((a, b) => a.desde.localeCompare(b.desde) || a.id.localeCompare(b.id, 'es', { numeric: true }))
    .map(aFila)
}

// Quita a alguien de la cola y recorre los puestos de los de abajo
function sacarDeCola(filtro) {
  const cola = getAll('listaEspera')
  const quitado = cola.find(filtro)
  if (!quitado) return
  // Los de ese equipo, en su orden actual, se vuelven a numerar desde 1
  const nuevoOrden = new Map(
    cola
      .filter((w) => w !== quitado && w.equipoId === quitado.equipoId)
      .sort((a, b) => a.orden - b.orden)
      .map((w, i) => [w.id, i + 1])
  )
  saveAll('listaEspera', cola
    .filter((w) => w !== quitado)
    .map((w) => (nuevoOrden.has(w.id) ? { ...w, orden: nuevoOrden.get(w.id) } : w)))
}

// Cancela la reserva (solo la dueña); si estaba en espera, la cola se recorre
export function cancelarReserva(reservaId, usuarioId) {
  const reservas = getAll('reservas')
  const r = reservas.find((x) => x.id === reservaId)
  if (!r) throw new ServiceError(404, 'Reserva no encontrada.')
  if (r.usuarioId !== usuarioId) throw new ServiceError(403, 'Solo puedes cancelar tus propias reservas.')
  if (!RESERVAS_ACTIVAS.includes(r.estado)) throw new ServiceError(409, 'Esta reserva ya no se puede cancelar.')
  saveAll('reservas', reservas.map((x) => (x.id === reservaId ? { ...x, estado: 'cancelada' } : x)))
  if (r.estado === 'en_espera') sacarDeCola((w) => w.reservaId === reservaId)
  return r
}

// Convierte la reserva confirmada en una solicitud de préstamo (HU-3/HU-4)
export function convertirEnSolicitud(reservaId, usuarioId) {
  const reservas = getAll('reservas')
  const r = reservas.find((x) => x.id === reservaId)
  if (!r) throw new ServiceError(404, 'Reserva no encontrada.')
  if (r.usuarioId !== usuarioId) throw new ServiceError(403, 'Solo puedes convertir tus propias reservas.')
  if (r.estado !== 'confirmada') throw new ServiceError(409, 'Solo una reserva confirmada puede convertirse en solicitud.')
  if (!puedeConvertir(r)) {
    throw new ServiceError(409, 'Podrás convertirla desde ' + dateOnly(sumarDias(r.desde, -DIAS_PARA_CONVERTIR)) + '.')
  }

  const solicitudes = getAll('solicitudes')
  const numeros = [...solicitudes.map((s) => s.codigo), ...getAll('prestamos').map((p) => p.codigo)]
    .map((c) => Number(String(c).split('-').pop()))
    .filter(Number.isFinite)
  const codigo = 'PRE-2026-' + String(Math.max(0, ...numeros) + 1).padStart(4, '0')

  const solicitud = {
    id: codigo,
    codigo,
    estudianteId: usuarioId,
    equipoId: r.equipoId,
    fechaInicio: r.desde,
    fechaFin: r.hasta,
    curso: r.curso || '',
    motivo: r.motivo || 'Reserva anticipada convertida en solicitud',
    estado: 'enviada',
    unidadId: null,
    unidad: null,
    motivoRechazo: null,
    fechaSolicitud: new Date().toISOString(),
    reservaId: r.id
  }
  saveAll('solicitudes', [...solicitudes, solicitud])
  saveAll('reservas', reservas.map((x) => (x.id === reservaId ? { ...x, estado: 'cumplida', prestamo: codigo } : x)))
  return solicitud
}

// ---------- Vista del encargado (6.4) ----------

// Reservas del almacén: las que terminan desde hoy en adelante; primero por
// fecha de inicio y al final las que están en espera
export function listarReservasAlmacen() {
  return getAll('reservas')
    .filter((r) => r.hasta >= FECHA_CORTE && r.estado !== 'cancelada')
    .sort((a, b) =>
      (a.estado === 'en_espera') - (b.estado === 'en_espera') ||
      a.desde.localeCompare(b.desde) ||
      a.id.localeCompare(b.id, 'es', { numeric: true }))
    .map(aFila)
}

// Colas agrupadas por equipo, cada una ordenada por puesto
export function listarListaEspera() {
  const todos = getAll('listaEspera')
  const grupos = []
  todos
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .forEach((w) => {
      let g = grupos.find((x) => x.equipoId === w.equipoId)
      if (!g) {
        g = { equipoId: w.equipoId, equipo: nombreEquipo(w.equipoId), cola: [] }
        grupos.push(g)
      }
      if (w.motivoPausa && !g.aviso) g.aviso = w.motivoPausa
      g.cola.push({ id: w.id, nombre: nombreUsuario(w.usuarioId), rango: rango(w.desde, w.hasta), estado: w.estado })
    })
  const orden = todos.map((w) => w.equipoId)
  return grupos.sort((a, b) => orden.indexOf(a.equipoId) - orden.indexOf(b.equipoId))
}

// «Asignar»: pasa a la persona de la cola a reserva confirmada. Reglas:
// no tiene deuda, la cola no está en pausa, es la primera asignable (FIFO)
// y ya hay unidades libres en todo su rango.
export function asignarDeLista(waitId) {
  const cola = getAll('listaEspera')
  const w = cola.find((x) => x.id === waitId)
  if (!w) throw new ServiceError(404, 'Ese puesto ya no está en la cola.')
  if (w.estado === 'deuda') throw new ServiceError(409, nombreUsuario(w.usuarioId) + ' tiene deuda pendiente: no se le puede asignar.')
  if (w.estado === 'pausa') throw new ServiceError(409, 'La cola está en pausa hasta que el equipo vuelva al inventario.')

  const primero = cola
    .filter((x) => x.equipoId === w.equipoId && x.estado === 'asignar')
    .sort((a, b) => a.orden - b.orden)[0]
  if (primero && primero.id !== w.id) {
    throw new ServiceError(409, 'Respeta el orden de la cola: primero corresponde asignar a ' + nombreUsuario(primero.usuarioId) + '.')
  }
  if (unidadesLibresEnRango(w.equipoId, w.desde, w.hasta) === 0) {
    throw new ServiceError(409, 'Todavía no hay unidades libres en ' + rango(w.desde, w.hasta) + '.')
  }

  const reservas = getAll('reservas')
  if (w.reservaId && reservas.some((r) => r.id === w.reservaId)) {
    saveAll('reservas', reservas.map((r) => (r.id === w.reservaId ? { ...r, estado: 'confirmada', creadaEn: r.creadaEn || new Date().toISOString() } : r)))
  } else {
    saveAll('reservas', [...reservas, {
      id: newId('r'), usuarioId: w.usuarioId, equipoId: w.equipoId, desde: w.desde, hasta: w.hasta,
      estado: 'confirmada', prestamo: null, motivo: 'Asignada desde la lista de espera', creadaEn: new Date().toISOString()
    }])
  }
  sacarDeCola((x) => x.id === waitId)
  return w
}
