// src/services/returnsService.js
// HU-5 · Devoluciones. Revisión de la devolución en curso: accesorios
// faltantes y descripción del daño que el encargado ya anotó (mockup 5.1/5.2).
// (Antes estaba escrito a mano en pages/returns/demoData.js.)

import { getAll } from './db.js'

// Revisión anotada para un préstamo (o null si no hay)
export function revisionDe(codigo) {
  return getAll('devolucionesPendientes').find((d) => d.prestamo === codigo) || null
}

// Primera devolución en curso: la que abre "Devoluciones" sin código en la URL
export function devolucionEnCurso() {
  const d = getAll('devolucionesPendientes')[0]
  return d ? { codigo: d.prestamo, faltantes: d.faltantes, descripcion: d.descripcion } : null
}
