// src/components/conditions.jsx
// Textos de las condiciones del préstamo con las cifras en negrita y el
// monto en fuente mono, como en los mockups 2.5 (vista previa) y 2.6 (ficha).

const money = (n) => 'S/ ' + Number(n || 0).toFixed(2)

// 2.5 · vista previa para el estudiante
export function CondicionesPreview({ c }) {
  return (
    <p>
      Préstamo de hasta <b>{c.duracionMaxima} {c.duracionMaxima === 1 ? 'día calendario' : 'días calendario'}</b>.{' '}
      {c.requiereAutorizacion
        ? 'Requiere la autorización del docente del curso asociado. '
        : 'No requiere autorización adicional. '}
      {c.admiteRenovacion
        ? 'Admite una renovación. '
        : <><b>No admite renovación.</b>{' '}</>}
      El retraso genera una penalidad de <b className="money">{money(c.penalidadDia)}</b> por día.
    </p>
  )
}

// 2.6 · ficha pública del equipo
export function CondicionesFicha({ c }) {
  return (
    <p>
      Hasta <b>{c.duracionMaxima} {c.duracionMaxima === 1 ? 'día calendario' : 'días calendario'}</b>
      {' · '}
      {c.requiereAutorizacion ? 'requiere autorización del docente' : 'no requiere autorización adicional'}
      {' · '}
      {c.admiteRenovacion ? 'admite una renovación' : 'no admite renovación'}
      {' · '}
      penalidad de <span className="money">{money(c.penalidadDia)}</span> por día de retraso.
    </p>
  )
}
