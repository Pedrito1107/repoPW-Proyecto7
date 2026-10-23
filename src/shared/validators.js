// src/shared/validators.js
// Reglas de validación. Las usan los formularios (validación en línea)
// y los servicios (se repiten "del lado del servidor").

export const STUDENT_DOMAIN = '@aloe.ulima.edu.pe'
// Todas las cuentas (estudiantes y encargados) usan el mismo dominio
export const STAFF_DOMAIN = '@aloe.ulima.edu.pe'

export function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === ''
}

export function isStudentEmail(email) {
  return /^[a-z0-9._-]+@aloe\.ulima\.edu\.pe$/i.test(String(email).trim())
}

export function isStaffEmail(email) {
  return /^[a-z0-9._-]+@aloe\.ulima\.edu\.pe$/i.test(String(email).trim())
}

export function isInstitutionalEmail(email) {
  return isStudentEmail(email) || isStaffEmail(email)
}

export function isStrongPassword(password) {
  return (
    String(password).length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

export const PASSWORD_RULE = 'Mínimo 8 caracteres, una mayúscula y un número.'

export function isCellphone(value) {
  return /^9[0-9]{8}$/.test(String(value).replace(/\s/g, ''))
}

export function isAnexo(value) {
  return /^[0-9]{4}$/.test(String(value).trim())
}

// Código de inventario: INV-XXX-0000
export function isInventoryCode(code) {
  return /^INV-[A-Z]{3}-[0-9]{4}$/.test(String(code).trim())
}

export function isUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Validaciones de registro reutilizadas en el formulario y en el servicio
export function validateStudentRegistration(data) {
  const errors = {}
  if (isEmpty(data.nombres)) errors.nombres = 'Ingresa tus nombres.'
  if (isEmpty(data.apellidos)) errors.apellidos = 'Ingresa tus apellidos.'
  if (isEmpty(data.carrera)) errors.carrera = 'Selecciona tu carrera.'
  if (isEmpty(data.ciclo)) errors.ciclo = 'Selecciona tu ciclo.'
  if (!isStudentEmail(data.correo)) errors.correo = 'Debe terminar en ' + STUDENT_DOMAIN
  if (!isStrongPassword(data.password)) errors.password = PASSWORD_RULE
  if (isEmpty(data.confirmar) || data.password !== data.confirmar) {
    errors.confirmar = 'Las contraseñas no coinciden.'
  }
  if (!data.reglamento) errors.reglamento = 'Debes aceptar el reglamento para continuar.'
  return errors
}

export function validateManagerRegistration(data) {
  const errors = {}
  if (isEmpty(data.nombres)) errors.nombres = 'Ingresa tus nombres.'
  if (isEmpty(data.apellidos)) errors.apellidos = 'Ingresa tus apellidos.'
  if (!isStaffEmail(data.correo)) errors.correo = 'Debe terminar en ' + STAFF_DOMAIN
  if (!isStrongPassword(data.password)) errors.password = PASSWORD_RULE
  if (isEmpty(data.confirmar) || data.password !== data.confirmar) {
    errors.confirmar = 'Las contraseñas no coinciden.'
  }
  if (isEmpty(data.almacen)) errors.almacen = 'Selecciona el almacén asignado.'
  if (!isAnexo(data.anexo)) errors.anexo = 'Ingresa un anexo válido de 4 dígitos.'
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
