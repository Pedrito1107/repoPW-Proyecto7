# Contrato de datos — Tema 7 · Préstamo de equipos

Estructura de las entidades compartidas entre historias. Los datos de prueba
están en `src/data/seed.json`. Cambiar este contrato requiere acuerdo del grupo.

## Usuario (`usuarios`) — dueño: HU-1

| Campo | Tipo | Valores / reglas |
|---|---|---|
| id | string | único (`u1`, `u2`…) |
| rol | string | `estudiante` · `encargado` |
| nombres, apellidos | string | obligatorios |
| correo | string | estudiante: `@aloe.ulima.edu.pe` · encargado: `@ulima.edu.pe` · único |
| password | string | mín. 8 caracteres, 1 mayúscula y 1 número (en la Entrega 2 se guarda cifrada) |
| estado | string | `habilitado` · `con_deuda` · `bloqueado` · `pendiente` (encargado sin aprobar) |
| carrera, ciclo, codigo, celular | string / number | solo estudiante |
| deuda, prestamoDeuda, diasRetraso, prestamos, retrasos | number / string | solo estudiante (los actualiza HU-5) |
| almacen, anexo | string | solo encargado |

## Equipo (`equipos`) — dueño: HU-2

| Campo | Tipo | Valores / reglas |
|---|---|---|
| id | string | único |
| nombre | string | obligatorio |
| marca, modelo | string | obligatorios para publicar · la pareja marca+modelo es única |
| categoria | string | `Medición` · `Audiovisual` · `Robótica` · `Cómputo` · `Redes` · `Laboratorio de física` |
| descripcion | string | máx. 400 caracteres |
| fotos | string[] | URLs http(s); la primera es la principal |
| accesorios | string[] | sin repetidos |
| condiciones | objeto | `{ duracionMaxima: 1-60, requiereAutorizacion: bool, admiteRenovacion: bool, penalidadDia: >= 0 }` |
| almacen | string | almacén del encargado que lo registró |
| borrador | boolean | `true` = no se muestra en el catálogo |

## Unidad (`unidades`) — dueño: HU-2

| Campo | Tipo | Valores / reglas |
|---|---|---|
| id | string | único |
| equipoId | string | id del equipo |
| codigo | string | `INV-XXX-0000`, único |
| ubicacion | string | obligatoria |
| observaciones | string | opcional |
| estado | string | `disponible` · `prestada` · `mantenimiento` · `baja` |
| prestamoVigente | string \| null | código `PRE-2026-0000` mientras está prestada |

Transiciones manuales (inventario): `disponible → mantenimiento | baja`,
`mantenimiento → disponible | baja`. `prestada` la asigna HU-4 al registrar la
entrega y la libera HU-5 en la devolución. `baja` es final.

## Historial de estados (`historialEstados`) — dueño: HU-2

`{ id, unidadId, desde, hacia, motivo (mín. 10 caracteres), fecha (ISO local), usuario }`

## Préstamo (`prestamos`) — dueño: HU-4 (entrega) y HU-5 (devolución) · propuesta de HU-7

HU-7 lo necesita para el tablero, el ranking y el historial del estudiante.
Los 9 préstamos vigentes y los cerrados son los mismos códigos que usan las
vistas de HU-4 y HU-5. **HU-4 y HU-5 deben validar estos campos.**

| Campo | Tipo | Valores / reglas |
|---|---|---|
| codigo | string | `PRE-2026-0000`, único |
| equipoId, unidadId, usuarioId | string | ids de equipo, unidad y estudiante |
| curso | string | curso asociado a la solicitud |
| entrega | string | fecha y hora ISO local de la entrega |
| vence | string | fecha pactada de devolución (`YYYY-MM-DD`) |
| devolucion | string \| null | fecha y hora ISO local; `null` mientras está entregado |
| estado | string | `entregada` · `devuelta` |
| retrasoDias | number | días de retraso al devolver (0 si fue a tiempo) |
| penalidad | number | `retrasoDias × penalidadDia` del equipo |
| penalidadPagada | boolean | |

Los contadores `prestamos` y `retrasos` de cada estudiante coinciden con esta
colección (retrasos = devoluciones tardías + préstamos vencidos sin devolver).

## Bloqueo de cuenta (`bloqueos`) — dueño: HU-7

`{ id, usuarioId, accion: 'bloqueo' | 'desbloqueo', motivo, detalle (10-300 caracteres), fecha (ISO local), encargado }`

En la Entrega 1 el seed trae el registro inicial y los bloqueos nuevos solo
viven en memoria (no se guardan). En la Entrega 2, al bloquear, HU-7 cambia `usuario.estado` a `bloqueado`; al desbloquear, a
`con_deuda` si `deuda > 0` o a `habilitado`. No se puede bloquear a quien tiene
un préstamo `entregada` (primero se registra la devolución).

## Fecha de corte

En la Entrega 1 el "hoy" de todas las vistas es `FECHA_CORTE = '2026-09-14'`
(`shared/constants.js`).

## Solicitud de préstamo (`solicitudes`) — dueño: HU-3 (crea) y HU-4 (resuelve)

Mismo formato que guarda `requestService.js`. La bandeja de HU-4 la lee con
`loansService.listarBandeja()`.

| Campo | Tipo | Valores / reglas |
|---|---|---|
| id, codigo | string | `PRE-2026-0000`, único |
| estudianteId, equipoId | string | ids de usuario y equipo |
| fechaInicio, fechaFin | string | `YYYY-MM-DD`; la duración no supera `duracionMaxima` |
| curso, motivo | string | motivo de 20 caracteres o más |
| estado | string | `enviada` · `aprobada` · `rechazada` · `retirada` · `entregada` · `devuelta` |
| unidadId, unidad | string \| null | unidad asignada al aprobar (id y código) |
| motivoRechazo | string \| null | obligatorio al rechazar |
| fechaSolicitud | string | fecha y hora ISO |

## Curso (`cursos`) — dueño: HU-3

`{ id, nombre, docente }`. El formulario de solicitud muestra «nombre · docente».

## Reserva (`reservas`) — dueño: HU-6

`{ id, usuarioId, equipoId, desde, hasta (YYYY-MM-DD), estado: confirmada · en_espera · cumplida · cancelada, prestamo (código de la solicitud/préstamo si se convirtió), motivo, curso, creadaEn (ISO; solo las creadas desde la app) }`

## Lista de espera (`listaEspera`) — dueño: HU-6

`{ id, equipoId, usuarioId, desde, hasta, orden (puesto en la cola), estado: asignar · deuda · pausa, reservaId, motivoPausa }`

## Ocupación del calendario (`ocupacion`) — dueño: HU-6

`{ equipoId, fecha, tipo: free · lent · full, texto }` · un registro por día.
**Provisional:** si un día tiene registro se parte de él; si no, `reservationsService` lo calcula con unidades, préstamos entregados y reservas confirmadas. Las reservas con `creadaEn` siempre restan. Domingos: sin atención.

## Revisión de devolución en curso (`devolucionesPendientes`) — dueño: HU-5

`{ prestamo, faltantes: string[], descripcion }` · lo que el encargado ya anotó
al revisar el equipo devuelto (mockup 5.1 / 5.2).

## Préstamo · campos opcionales de la constancia (HU-4)

`docente` y `accesoriosNoEntregados: string[]` (mockup 4.5).
