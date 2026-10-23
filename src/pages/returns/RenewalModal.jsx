// src/pages/returns/RenewalModal.jsx
// HU-5 · 5.3 Modal de renovación (posible / bloqueada)
// Primera entrega: solo se trabaja con datos del frontend.
// Todavía no se guarda la renovación en base de datos.

import { Modal } from '../../components/ui.jsx'
import { equipoDe } from '../../services/loansService.js'
import { listarListaEspera } from '../../services/reservationsService.js'

// Lista de espera del seed (HU-6): no se renueva si alguien espera el equipo
const LISTA_ESPERA = listarListaEspera()

export function RenewalModal({ prestamo, onClose }) {

  const equipo = equipoDe(prestamo.equipoId)

  // Verifica si las condiciones del equipo permiten renovación.
  const admite = equipo?.condiciones.admiteRenovacion

  // Busca si este equipo tiene estudiantes en lista de espera.
  const grupoEspera = LISTA_ESPERA.find(
    (grupo) => grupo.equipoId === prestamo.equipoId
  )

  const enEspera = grupoEspera?.cola.length || 0

  // NUEVO:
  // La renovación solamente es posible si el equipo la admite
  // y no hay estudiantes esperando por ese equipo.
  const posible = admite && enEspera === 0


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
          <>
            {/* NUEVO:
                Cuando está bloqueada, Renovar queda deshabilitado. */}
            <button
              type="button"
              className="btn btn-primary"
              disabled
            >
              Renovar
            </button>

            {/* NUEVO:
                Si existe lista de espera mostramos el botón
                que aparece en el mockup. */}
            {enEspera > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
              >
                Ver lista de espera
              </button>
            )}
          </>
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
            No hay solicitudes ni reservas en espera en el nuevo rango.
          </div>
        </>
      )}


      {/* CASO 2: existe lista de espera */}
      {enEspera > 0 && (
        <div className="alert alert-warning">

          Hay <strong>{enEspera} solicitudes en espera</strong>
          {' '}por este equipo.

          {!admite && (
            <>
              {' '}
              Además, sus condiciones no admiten renovación.
            </>
          )}

        </div>
      )}


      {/* CASO 3:
          No hay lista de espera, pero el equipo no permite renovar. */}
      {!admite && enEspera === 0 && (
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