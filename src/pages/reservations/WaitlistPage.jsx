// src/pages/reservations/WaitlistPage.jsx
// HU-6 · 6.4 Lista de espera (encargado)
// «Asignar» convierte el puesto en reserva confirmada si ya hay unidades libres,
// respetando el orden de la cola.

import { useState } from 'react'
import { listarListaEspera, asignarDeLista } from '../../services/reservationsService.js'
import { useToast } from '../../context/ToastContext.jsx'

function EstadoCola({ estado, onAsignar }) {
  if (estado === 'deuda') return <span className="badge badge-danger">Con deuda</span>
  if (estado === 'pausa') return <span className="badge badge-muted">En pausa</span>
  return <button type="button" className="btn btn-secondary" onClick={onAsignar}>Asignar</button>
}

export default function WaitlistPage() {
  const toast = useToast()
  const [, setTick] = useState(0)
  const listaEspera = listarListaEspera()

  function asignar(p, equipo) {
    try {
      asignarDeLista(p.id)
      toast.success(p.nombre + ' ya tiene reserva confirmada de ' + equipo + ' (' + p.rango + ').')
    } catch (e) {
      toast.error(e.message || 'No se pudo asignar.')
    }
    setTick((t) => t + 1)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lista de espera</h1>
          <p className="page-subtitle">
            {listaEspera.length} equipos con reservas en espera ·{' '}
            {listaEspera.reduce((n, g) => n + g.cola.length, 0)} estudiantes en cola
          </p>
        </div>
      </div>

      {listaEspera.length === 0 && <p className="text-muted">No hay estudiantes en lista de espera.</p>}

      {listaEspera.map((grupo) => (
        <section key={grupo.equipoId} className="card card-flush">
          <div className="card-body" style={{ paddingBottom: 8 }}>
            <h2 className="card-title" style={{ margin: 0 }}>{grupo.equipo} · {grupo.cola.length} en espera</h2>
          </div>
          {grupo.aviso && <div className="alert alert-warning" style={{ margin: '0 24px 12px' }}>{grupo.aviso}</div>}
          <ol className="queue">
            {grupo.cola.map((p, i) => (
              <li key={p.id}>
                <span className="queue-pos">{i + 1}</span>
                <span className="strong">{p.nombre}</span>
                <span className="mono">{p.rango}</span>
                <span><EstadoCola estado={p.estado} onAsignar={() => asignar(p, grupo.equipo)} /></span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
