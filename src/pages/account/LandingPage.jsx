// src/pages/account/LandingPage.jsx  (HU-1 · 1.1 Landing pública)
import { Link } from 'react-router-dom'
import './LandingPage.css'
import { useInventory } from '../../context/InventoryContext.jsx'

const PASOS = [
  ['Solicita con anticipación', 'El encargado responde en un máximo de 24 horas hábiles.'],
  ['Recoge con tu carné', 'Verifica los accesorios en la entrega y firma la constancia.'],
  ['Devuelve a tiempo', 'Cada día de retraso genera penalidad y bloquea nuevos préstamos.']
]

function LandingPage() {
  const { equipos, loading } = useInventory()

  // Destacados: equipos publicados con unidades activas (los 4 primeros)
  const destacados = equipos
    .filter((e) => !e.borrador && e.resumen.total - e.resumen.baja > 0)
    .slice(0, 4)

  return (
    <div className="landing-page">
      <main className="landing-main">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h2>Reserva el equipo del laboratorio antes de tu práctica</h2>
              <p>
                Revisa los equipos del almacén y cuántas unidades hay libres.
                Recojo en el Almacén H-102.
              </p>
            </div>
            <div className="hero-image">
              <span>fotografía del almacén · 520 × 300</span>
            </div>
          </div>
        </section>

        <section className="featured">
          <div className="landing-section-content">
            <div className="featured-header">
              <h2>Equipos destacados</h2>
            </div>

            {loading ? (
              <div className="loading">Cargando equipos…</div>
            ) : (
              <div className="equipment-grid">
                {destacados.map((e) => {
                  const activas = e.resumen.total - e.resumen.baja
                  return (
                    <Link key={e.id} to={'/public/equipos/' + e.id} className="equipment-card equipment-card-link">
                      <div className="equipment-thumb"></div>
                      <div className="equipment-info">
                        <h3>{e.nombre}</h3>
                        <p>{e.marca} · {e.categoria.toLowerCase()}</p>
                        <strong className={'stock ' + (e.resumen.disponible > 0 ? 'available' : 'warning')}>
                          {e.resumen.disponible} / {activas} libres
                        </strong>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            <section className="steps">
              {PASOS.map(([titulo, texto], i) => (
                <div className="step" key={titulo}>
                  <span className="step-number">{i + 1}</span>
                  <div>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </section>
      </main>

      
    </div>
  )
}

export default LandingPage