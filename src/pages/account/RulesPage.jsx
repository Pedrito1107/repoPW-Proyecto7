// src/pages/account/RulesPage.jsx  (vista pública de apoyo)
const REGLAS = [
  'Solo estudiantes con correo @aloe.ulima.edu.pe y sin deudas pendientes pueden solicitar equipos.',
  'Cada equipo tiene una duración máxima de préstamo, indicada en su ficha.',
  'Al recoger, verifica los accesorios junto al encargado y firma la constancia de entrega.',
  'Devuelve el equipo en la fecha pactada antes de las 19:00 en el almacén de recojo.',
  'Cada día de retraso genera la penalidad indicada en la ficha y bloquea nuevos préstamos hasta regularizar en Tesorería.',
  'Los daños o faltantes se registran en la devolución y la unidad pasa a mantenimiento.'
]

export default function RulesPage() {
  return (
    <div className="page page-narrow">
      <h1 className="page-title">Reglas del préstamo</h1>
      <div className="card">
        <ol className="rules">
          {REGLAS.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </div>
    </div>
  )
}

export function HelpPage() {
  return (
    <div className="page page-narrow">
      <h1 className="page-title">Ayuda</h1>
      <div className="card">
        <p>¿Tienes dudas sobre un préstamo? Escribe a <strong>almacen.equipos@ulima.edu.pe</strong> o llama al anexo 3120.</p>
        <p>Horario de atención del Almacén H-102: lunes a viernes de 08:00 a 19:00.</p>
      </div>
    </div>
  )
}
