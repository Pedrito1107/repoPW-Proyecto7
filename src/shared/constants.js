// src/shared/constants.js
// Valores admitidos del contrato de datos (compartidos por todas las historias).

export const ROLES = {
  ESTUDIANTE: 'estudiante',
  ENCARGADO: 'encargado'
}

// Vista principal de cada rol después de iniciar sesión
export const HOME_BY_ROLE = {
  estudiante: '/student',
  encargado: '/manager'
}

export const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería Electrónica',
  'Arquitectura',
  'Comunicación'
]

export const CICLOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const ALMACENES = [
  'Almacén H-102',
  'Almacén N-005',
  'Laboratorio de Electrónica H-210'
]

export const CATEGORIAS = [
  'Medición',
  'Audiovisual',
  'Robótica',
  'Cómputo',
  'Redes',
  'Laboratorio de física'
]

export const ESTADOS_UNIDAD = {
  disponible: 'Disponible',
  prestada: 'Prestada',
  mantenimiento: 'Mantenimiento',
  baja: 'Dada de baja'
}

export const ESTADOS_USUARIO = {
  habilitado: 'Habilitado',
  con_deuda: 'Con deuda',
  bloqueado: 'Bloqueado',
  pendiente: 'Pendiente de aprobación'
}

export const MAX_INTENTOS_LOGIN = 5

// Fecha de corte de los datos de la Entrega 1 (el "hoy" de todas las vistas).
// En la Entrega 2 será la fecha del servidor.
export const FECHA_CORTE = '2026-09-14'
