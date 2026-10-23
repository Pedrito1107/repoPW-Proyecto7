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

// Equipo del inventario (HU-2). Un borrador solo exige el nombre;
// para publicarlo se exigen todos los campos.
export function validateEquipoData(data, borrador, { categorias, maxDescripcion }) {
  const errors = {}
  if (isEmpty(data.nombre)) errors.nombre = 'El nombre es obligatorio.'
  if (data.descripcion.length > maxDescripcion) {
    errors.descripcion = 'Máximo ' + maxDescripcion + ' caracteres.'
  }
  if (data.fotos.some((f) => !isUrl(f))) {
    errors.fotos = 'Cada fotografía debe ser una URL válida (http o https).'
  }
  const repetido = data.accesorios.find(
    (a, i) => data.accesorios.findIndex((b) => b.toLowerCase() === a.toLowerCase()) !== i
  )
  if (repetido) errors.accesorios = 'El accesorio «' + repetido + '» está repetido.'

  if (!borrador) {
    if (!categorias.includes(data.categoria)) errors.categoria = 'Selecciona una categoría.'
    if (isEmpty(data.marca)) errors.marca = 'La marca es obligatoria.'
    if (isEmpty(data.modelo)) errors.modelo = 'El modelo es obligatorio.'
    if (isEmpty(data.descripcion)) errors.descripcion = 'La descripción es obligatoria.'
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

// ---------- HU-7 · Métricas y usuarios ----------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Rango de fechas del tablero y del ranking (fechas YYYY-MM-DD)
export function validateRango({ desde, hasta }, fechaCorte) {
  const errors = {}
  if (!ISO_DATE.test(desde || '')) errors.desde = 'Indica la fecha de inicio.'
  if (!ISO_DATE.test(hasta || '')) errors.hasta = 'Indica la fecha de fin.'
  if (!errors.desde && !errors.hasta && desde > hasta) {
    errors.hasta = 'La fecha de fin debe ser igual o posterior a la de inicio.'
  }
  if (!errors.hasta && hasta > fechaCorte) {
    errors.hasta = 'No hay datos posteriores al ' + fechaCorte.split('-').reverse().join('/') + '.'
  }
  return errors
}

// Bloqueo o desbloqueo de una cuenta: el motivo es obligatorio y queda
// registrado en el historial del estudiante.
export const MIN_DETALLE_BLOQUEO = 10
export const MAX_DETALLE_BLOQUEO = 300

export function validateBloqueo({ motivo, detalle }, motivos) {
  const errors = {}
  if (!motivos.includes(motivo)) errors.motivo = 'Selecciona un motivo.'
  const texto = String(detalle || '').trim()
  if (texto.length < MIN_DETALLE_BLOQUEO) {
    errors.detalle = 'Describe el motivo (mínimo ' + MIN_DETALLE_BLOQUEO + ' caracteres).'
  } else if (texto.length > MAX_DETALLE_BLOQUEO) {
    errors.detalle = 'Máximo ' + MAX_DETALLE_BLOQUEO + ' caracteres.'
  }
  return errors
}
