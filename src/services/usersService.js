// src/services/usersService.js
// HU-5 · Ficha del estudiante (5.4): sus datos y su historial de préstamos.
// En la HU-7 este servicio crece con el listado de estudiantes y el
// bloqueo / desbloqueo de cuentas.

import { getAll, delay, ServiceError } from './db.js'
import { FECHA_CORTE } from '../shared/constants.js'
import { fullName } from '../shared/format.js'

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

// ---------- Ficha del estudiante con su historial ----------

export async function getEstudiante(id) {
  await delay(250)
  const u = getAll('usuarios').find((x) => x.id === id && x.rol === 'estudiante')
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

  return { ...toFila(u, prestamos), historial }
}
