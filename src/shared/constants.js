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

// Transiciones permitidas desde la vista de inventario.
// "prestada" solo se asigna al registrar una entrega (HU-4) y se libera
// al registrar la devolución (HU-5); por eso no aparece como destino manual.
export const TRANSICIONES_UNIDAD = {
  disponible: ['mantenimiento', 'baja'],
  mantenimiento: ['disponible', 'baja'],
  prestada: [],
  baja: []
}

export const ESTADOS_USUARIO = {
  habilitado: 'Habilitado',
  con_deuda: 'Con deuda',
  bloqueado: 'Bloqueado',
  pendiente: 'Pendiente de aprobación'
}

export const MAX_INTENTOS_LOGIN = 5
export const MAX_DESCRIPCION = 400

// ---------- HU-7 · Métricas y usuarios ----------

// Fecha de corte de los datos de la Entrega 1 (el "hoy" de todas las vistas).
// En la Entrega 2 será la fecha del servidor.
export const FECHA_CORTE = '2026-09-14'

// Periodo que muestra el tablero al abrirse
export const PERIODO_INICIAL = { desde: '2026-08-01', hasta: FECHA_CORTE }

export const MOTIVOS_BLOQUEO = [
  'Penalidad pendiente de pago',
  'Devoluciones con retraso reiteradas',
  'Daño de equipo sin regularizar',
  'Otro'
]

export const MOTIVOS_DESBLOQUEO = [
  'Regularizó su deuda',
  'Reparó o repuso el equipo dañado',
  'Bloqueo registrado por error',
  'Otro'
]

// Agrupación del gráfico «Préstamos por mes y categoría» (7.2)
export const GRUPOS_CATEGORIA = {
  'Medición y laboratorio': ['Medición', 'Laboratorio de física', 'Redes'],
  'Audiovisual y cómputo': ['Audiovisual', 'Cómputo', 'Robótica']
}

// ---------- HU-6 · Reserva anticipada ----------

// Desde cuántos días antes del inicio una reserva confirmada puede convertirse
// en solicitud de préstamo («al aproximarse la fecha»)
export const DIAS_PARA_CONVERTIR = 3

// Estados de reserva que ocupan cupo o lugar en la cola
export const RESERVAS_ACTIVAS = ['confirmada', 'en_espera']
