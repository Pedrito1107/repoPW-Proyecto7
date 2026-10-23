// src/shared/format.js

export function money(value) {
  return 'S/ ' + Number(value || 0).toFixed(2)
}

export function fullName(user) {
  if (!user) return ''
  return user.nombres + ' ' + user.apellidos
}

// "Renzo Andrés" + "Mendoza Cárdenas" -> "Renzo Mendoza"
export function shortName(user) {
  if (!user) return ''
  return user.nombres.split(' ')[0] + ' ' + user.apellidos.split(' ')[0]
}

export function initials(user) {
  if (!user) return ''
  return (user.nombres[0] + user.apellidos[0]).toUpperCase()
}

export function dateTime(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear()
}

// Texto de las condiciones del préstamo tal como lo ve el estudiante
export function condicionesTexto(c) {
  return [
    'Préstamo de hasta ' + plural(c.duracionMaxima, 'día calendario', 'días calendario') + '.',
    c.requiereAutorizacion
      ? 'Requiere la autorización del docente del curso asociado.'
      : 'No requiere autorización adicional.',
    c.admiteRenovacion ? 'Admite una renovación.' : 'No admite renovación.',
    'El retraso genera una penalidad de ' + money(c.penalidadDia) + ' por día.'
  ].join(' ')
}

export function plural(n, singular, pluralForm) {
  return n + ' ' + (n === 1 ? singular : pluralForm)
}

// "2026-09-14" o "2026-09-14T10:00:00" -> "14/09/2026"
export function dateOnly(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return d + '/' + m + '/' + y
}

// "Ingeniería Electrónica" -> "Ing. Electrónica" (gráficos y tablas angostas)
export function shortCarrera(carrera) {
  return String(carrera || '').replace(/^Ingeniería /, 'Ing. ')
}
