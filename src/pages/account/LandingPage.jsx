// src/pages/account/LandingPage.jsx  (HU-1 · 1.1 Landing pública)
import './LandingPage.css'

const PASOS = [
  ['Solicita con anticipación', 'El encargado responde en un máximo de 24 horas hábiles.'],
  ['Recoge con tu carné', 'Verifica los accesorios en la entrega y firma la constancia.'],
  ['Devuelve a tiempo', 'Cada día de retraso genera penalidad y bloquea nuevos préstamos.']
]

function LandingPage() {
  return (
    <div className="landing-page">
      <main className="landing-main">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h2>Reserva el equipo del laboratorio antes de tu práctica</h2>
              <p>
                Crea tu cuenta con tu correo institucional para solicitar los
                equipos del laboratorio. Recojo en el Almacén H-102.
              </p>
            </div>
            <div className="hero-image">
              <span>fotografía del almacén · 520 × 300</span>
            </div>
          </div>
        </section>

        <section className="featured">
          <div className="landing-section-content">
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
