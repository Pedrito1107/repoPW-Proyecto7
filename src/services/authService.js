// src/services/authService.js
// HU-1 · Cuenta y acceso. Toda la lógica de usuarios y sesión.

import { getAll, saveAll, newId, delay, ServiceError } from './db.js'
import {
  validateStudentRegistration,
  validateManagerRegistration,
  hasErrors,
  isStrongPassword,
  isEmpty,
  isCellphone,
  isAnexo,
  PASSWORD_RULE
} from '../shared/validators.js'

const SESSION_KEY = 'almacen.session'

// Nunca se expone la contraseña fuera del servicio
function publicUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

function findByEmail(correo) {
  const email = String(correo).trim().toLowerCase()
  return getAll('usuarios').find((u) => u.correo.toLowerCase() === email)
}

function updateUser(id, changes) {
  const usuarios = getAll('usuarios')
  const index = usuarios.findIndex((u) => u.id === id)
  if (index === -1) throw new ServiceError(404, 'Usuario no encontrado.')
  usuarios[index] = { ...usuarios[index], ...changes }
  saveAll('usuarios', usuarios)
  return usuarios[index]
}

// ---------- Sesión ----------

// La sesión real la maneja el servidor (POST /login): cada página la recibe
// en window.USER (null si no hay sesión). Solo si la página no la trae se
// usa la sesión guardada en el navegador.
// "Recordarme" guarda la sesión en localStorage (sobrevive al cerrar el
// navegador); si no, en sessionStorage (dura mientras la pestaña esté abierta).
export function getSessionUser() {
  if (typeof window !== 'undefined' && 'USER' in window) {
    return window.USER || null
  }
  try {
    const id = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!id) return null
    return publicUser(getAll('usuarios').find((u) => u.id === id))
  } catch {
    return null
  }
}

function saveSession(id, remember) {
  try {
    clearSession()
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(SESSION_KEY, id)
  } catch {
    // sin almacenamiento: la sesión no persiste entre páginas
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // nada que limpiar
  }
}

// Inicio de sesión: lo valida el servidor (POST /login, website/services.js),
// que crea la sesión y cuenta los intentos fallidos.
// Devuelve { redirect, aviso } · lanza ServiceError 400 / 401 / 429 / 503;
// en 401 y 429 el error trae `intentosRestantes` y `minutos`.
export async function login(correo, password, next = '') {
  await delay(600)
  const fields = {}
  if (isEmpty(correo)) fields.correo = 'Ingresa tu correo institucional.'
  if (isEmpty(password)) fields.password = 'Ingresa tu contraseña.'
  if (hasErrors(fields)) throw new ServiceError(400, 'Completa todos los campos.', fields)

  let res
  try {
    res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: correo, password, next })
    })
  } catch {
    throw new ServiceError(503, 'No pudimos conectar con el servidor. Inténtalo de nuevo.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new ServiceError(res.status, body.message || 'No se pudo iniciar sesión.')
    err.intentosRestantes = body.data?.intentosRestantes ?? null
    err.minutos = body.data?.minutos ?? 0
    throw err
  }
  return body.data
}

export async function logout() {
  clearSession()
}

// ---------- Registro ----------

// La cuenta también se crea en el servidor; si no, no podría iniciar sesión
// (el inicio de sesión lo valida el servidor). Repite las validaciones allá.
async function registrarEnServidor(datos) {
  let res
  try {
    res = await fetch('/api/v1/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
  } catch {
    throw new ServiceError(503, 'No pudimos conectar con el servidor. Inténtalo de nuevo.')
  }
  if (res.ok) return
  const body = await res.json().catch(() => ({}))
  throw new ServiceError(res.status, body.message || 'No se pudo crear la cuenta.', body.errors || {})
}

export async function registerStudent(data) {
  await delay()
  const errors = validateStudentRegistration(data)
  if (hasErrors(errors)) throw new ServiceError(400, 'Datos inválidos.', errors)
  if (findByEmail(data.correo)) {
    throw new ServiceError(409, 'Ya existe una cuenta con el correo ' + data.correo.trim() + '.')
  }
  const id = newId('u')
  await registrarEnServidor({ ...data, id, rol: 'estudiante' })
  const user = {
    id,
    rol: 'estudiante',
    nombres: data.nombres.trim(),
    apellidos: data.apellidos.trim(),
    correo: data.correo.trim().toLowerCase(),
    password: data.password,
    carrera: data.carrera,
    ciclo: Number(data.ciclo),
    codigo: '',
    celular: '',
    estado: 'habilitado',
    deuda: 0,
    prestamoDeuda: null,
    prestamos: 0,
    retrasos: 0
  }
  saveAll('usuarios', [...getAll('usuarios'), user])
  return publicUser(user)
}

export async function registerManager(data) {
  await delay()
  const errors = validateManagerRegistration(data)
  if (hasErrors(errors)) throw new ServiceError(400, 'Datos inválidos.', errors)
  if (findByEmail(data.correo)) {
    throw new ServiceError(409, 'Ya existe una cuenta registrada con el correo ' + data.correo.trim() + '.')
  }
  const id = newId('u')
  await registrarEnServidor({ ...data, id, rol: 'encargado' })
  const user = {
    id,
    rol: 'encargado',
    nombres: data.nombres.trim(),
    apellidos: data.apellidos.trim(),
    correo: data.correo.trim().toLowerCase(),
    password: data.password,
    almacen: data.almacen,
    anexo: data.anexo.trim(),
    // El alta queda pendiente hasta que el jefe de laboratorio la apruebe
    estado: 'pendiente'
  }
  saveAll('usuarios', [...getAll('usuarios'), user])
  return publicUser(user)
}

// ---------- Mi cuenta ----------

export async function updateProfile(userId, data) {
  await delay()
  const current = getAll('usuarios').find((u) => u.id === userId)
  if (!current) throw new ServiceError(404, 'Usuario no encontrado.')

  const errors = {}
  if (isEmpty(data.nombres)) errors.nombres = 'Ingresa tus nombres.'
  if (isEmpty(data.apellidos)) errors.apellidos = 'Ingresa tus apellidos.'

  // Solo se aceptan los campos editables de cada rol (el correo no se edita)
  let changes = { nombres: data.nombres?.trim(), apellidos: data.apellidos?.trim() }

  if (current.rol === 'estudiante') {
    if (isEmpty(data.carrera)) errors.carrera = 'Selecciona tu carrera.'
    if (isEmpty(data.ciclo)) errors.ciclo = 'Selecciona tu ciclo.'
    if (!isEmpty(data.celular) && !isCellphone(data.celular)) {
      errors.celular = 'El celular debe tener 9 dígitos y empezar con 9.'
    }
    changes = {
      ...changes,
      carrera: data.carrera,
      ciclo: Number(data.ciclo),
      celular: String(data.celular || '').replace(/\s/g, '')
    }
  } else {
    if (!isAnexo(data.anexo)) errors.anexo = 'Ingresa un anexo válido de 4 dígitos.'
    changes = { ...changes, anexo: String(data.anexo).trim() }
  }

  if (hasErrors(errors)) throw new ServiceError(400, 'Datos inválidos.', errors)
  return publicUser(updateUser(userId, changes))
}

export async function changePassword(userId, actual, nueva, confirmar) {
  await delay()
  const errors = {}
  if (isEmpty(actual)) errors.actual = 'Ingresa tu contraseña actual.'
  if (!isStrongPassword(nueva)) errors.nueva = PASSWORD_RULE
  if (isEmpty(confirmar) || nueva !== confirmar) errors.confirmar = 'Las contraseñas no coinciden.'
  if (hasErrors(errors)) throw new ServiceError(400, 'Datos inválidos.', errors)

  const user = getAll('usuarios').find((u) => u.id === userId)
  if (!user) throw new ServiceError(404, 'Usuario no encontrado.')
  if (user.password !== actual) {
    throw new ServiceError(401, 'La contraseña actual es incorrecta.', {
      actual: 'La contraseña actual es incorrecta.'
    })
  }
  if (actual === nueva) {
    throw new ServiceError(400, 'La nueva contraseña debe ser distinta de la actual.', {
      nueva: 'Debe ser distinta de la actual.'
    })
  }
  updateUser(userId, { password: nueva })
}

// ---------- Recuperación de contraseña ----------
// No se envían correos reales (fuera de alcance): se genera un token
// temporal y la interfaz simula la apertura del enlace.

const RESET_KEY = 'almacen.resetToken'

export async function requestPasswordReset(correo) {
  await delay(800)
  const user = findByEmail(correo)
  if (!user) {
    throw new ServiceError(404, 'No encontramos una cuenta asociada a ese correo.')
  }
  const token = {
    userId: user.id,
    correo: user.correo,
    expira: Date.now() + 60 * 60 * 1000 // 60 minutos
  }
  sessionStorage.setItem(RESET_KEY, JSON.stringify(token))
  return { correo: user.correo }
}

export async function resetPassword(nueva, confirmar) {
  await delay()
  const errors = {}
  if (!isStrongPassword(nueva)) errors.nueva = PASSWORD_RULE
  if (isEmpty(confirmar) || nueva !== confirmar) errors.confirmar = 'Las contraseñas no coinciden.'
  if (hasErrors(errors)) throw new ServiceError(400, 'Datos inválidos.', errors)

  const token = JSON.parse(sessionStorage.getItem(RESET_KEY) || 'null')
  if (!token || token.expira < Date.now()) {
    throw new ServiceError(410, 'El enlace expiró. Solicita uno nuevo.')
  }
  updateUser(token.userId, { password: nueva })
  sessionStorage.removeItem(RESET_KEY)
}
