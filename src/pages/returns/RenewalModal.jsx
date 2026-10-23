// src/pages/returns/RenewalModal.jsx
// HU-5 · 5.3 Modal de renovación (posible / bloqueada)
// Primera entrega: solo se trabaja con datos del frontend.
// Todavía no se guarda la renovación en base de datos.
// (En la HU-6 también se bloquea si hay estudiantes en lista de espera.)

import { Modal } from '../../components/ui.jsx'
import { equipoDe } from '../../services/loansService.js'

export function RenewalModal({ prestamo, onClose }) {

  const equipo = equipoDe(prestamo.equipoId)

  // La renovación solamente es posible si las condiciones del equipo la admiten.
  const posible = Boolean(equipo?.condiciones.admiteRenovacion)


  return (
    <Modal
      title={'Renovar préstamo · ' + prestamo.codigo}
      onClose={onClose}

      footer={
        posible ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Renovar
            </button>
          </>
        ) : (
          // Cuando está bloqueada, Renovar queda deshabilitado.
          <button
            type="button"
            className="btn btn-primary"
            disabled
          >
            Renovar
          </button>
        )
      }
    >

      <p className="modal-text">
        {prestamo.estudiante}
        {' · '}
        {prestamo.equipo}
        {' · '}
        <span className="mono">{prestamo.unidad}</span>
      </p>


      {/* CASO 1: renovación permitida */}
      {posible && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}
          >

            <div>
              <label className="section-label">
                VENCIMIENTO ACTUAL
              </label>

              <input
                type="text"
                value={prestamo.vence}
                disabled
              />
            </div>


            <div>
              <label className="section-label">
                NUEVA FECHA
              </label>

              <input
                type="date"
                defaultValue="2026-09-24"
              />
            </div>

          </div>

          <div className="alert alert-success">
            Duración dentro del máximo permitido.
          </div>
        </>
      )}


      {/* CASO 2: el equipo no permite renovar */}
      {!posible && (
        <div className="alert alert-warning">

          <strong>Renovación no disponible.</strong>

          {' '}
          Las condiciones de este equipo no admiten renovación.
          El préstamo debe devolverse en la fecha pactada.

        </div>
      )}

    </Modal>
  )
}
