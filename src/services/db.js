// src/services/db.js
// "Base de datos" de la Entrega 1: el archivo semilla se copia a localStorage
// la primera vez y desde ahí se lee/escribe. Así los cambios sobreviven
// al recargar y se comparten entre las vistas públicas, del estudiante
// y del encargado (que son entradas distintas de Vite).
//
// En la Entrega 2 este archivo se reemplaza por llamadas fetch() a la API
// Express; los servicios mantienen la misma firma.

import seed from '../data/seed.json'

// v5: HU-6 agrega reservas de prueba en el seed. v4: el seed agrega solicitudes, reservas, lista de espera, cursos… (antes en
// los demoData.js) y v3 estudiantes, `prestamos` y `bloqueos` (HU-7). Cambiar la
// clave hace que los navegadores con datos viejos (v1, o v2 con bloqueos de
// prueba guardados) carguen la semilla limpia.
// v6: todas las cuentas de prueba usan la contraseña «123» (también en el servidor).
const DB_KEY = 'almacen.db.v6'

function read() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // localStorage bloqueado o JSON dañado: se vuelve a la semilla
  }
  const fresh = structuredClone(seed)
  write(fresh)
  return fresh
}

function write(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // sin almacenamiento disponible: los cambios viven solo en memoria
  }
}

export function getAll(collection) {
  return read()[collection] || []
}

export function saveAll(collection, items) {
  const db = read()
  db[collection] = items
  write(db)
}

export function resetDatabase() {
  write(structuredClone(seed))
}

export function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Simula la latencia de red para que la interfaz muestre estados de carga
export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Error con código HTTP, igual al que devolverá la API en la Entrega 2
export class ServiceError extends Error {
  constructor(status, message, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}
