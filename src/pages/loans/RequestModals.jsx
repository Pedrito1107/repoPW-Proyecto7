// src/pages/loans/RequestModals.jsx
// HU-4 · 4.2 Modal de aprobación (asignar unidad) · 4.3 Modal de rechazo
// Solo diseño: los botones cierran el modal, aún no aprueban ni rechazan.

import { useState } from 'react'
import { Modal, Field, StatusBadge } from '../../components/ui.jsx'
import { unidadesDe } from '../../services/loansService.js'

export function ApproveModal({ solicitud, onClose }) {
  const unidades = unidadesDe(solicitud.equipoId)
  const libres = unidades.filter((u) => u.estado === 'disponible')
  const [unidad, setUnidad] = useState(libres[0]?.codigo || '')

  const sinUnidades = libres.length === 0 || solicitud.estudiante?.includes('Alejandra')

  return (
    <Modal
      title={'Aprobar solicitud · ' + solicitud.id}
      onClose={onClose}
      footer={
        sinUnidades ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.6 }}>
              Aprobar y asignar
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ width: '100%', borderColor: '#17505c', color: '#17505c' }}>
              Proponer del 19/09 al 24/09
            </button>
          </div>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary" disabled={!libres.length} onClick={onClose}>Aprobar y asignar</button>
          </>
        )
      }
    >
      <p className="modal-text">
        {solicitud.estudiante} · {solicitud.equipo} · <span className="mono">{solicitud.fechas}</span>
      </p>

      {/* Alerta de penalidad / deuda pendiente */}
      {solicitud.deuda && (
        <div className="alert alert-danger" style={{ marginBottom: '10px' }}>
          El solicitante tiene una penalidad pendiente de <strong>{solicitud.deuda}</strong>.
        </div>
      )}

      {/* Renderizado condicional según disponibilidad */}
      {sinUnidades ? (
        <div className="alert alert-warning">
          No hay unidades libres en todo el rango. La primera se libera el <strong>19/09/2026</strong>.
        </div>
      ) : (
        <>
          <span className="section-label">UNIDAD A ASIGNAR</span>
          <div className="unit-options">
            {unidades.map((u) => {
              const libre = u.estado === 'disponible'
              return (
                <label key={u.codigo} className={'unit-option ' + (unidad === u.codigo ? 'selected' : '')}>
                  <span>
                    <input
                      type="radio"
                      name="unidad"
                      disabled={!libre}
                      checked={unidad === u.codigo}
                      onChange={() => setUnidad(u.codigo)}
                    />{' '}
                    <span className="mono">{u.codigo}</span>
                    <div className="cell-sub">{u.ubicacion}</div>
                  </span>
                  {libre
                    ? <span className="badge badge-success">Libre en el rango</span>
                    : <StatusBadge estado={u.estado} />}
                </label>
              )
            })}
          </div>
          <p className="inline-note">
            {libres.length} unidades libres en todo el rango solicitado.
          </p>
        </>
      )}
    </Modal>
  )
}

export function RejectModal({ solicitud, onClose }) {
  return (
    <Modal
      title={'Rechazar solicitud · ' + solicitud.id}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={onClose}>Rechazar solicitud</button>
        </>
      }
    >
      <p className="modal-text">{solicitud.estudiante} · {solicitud.equipo}</p>
      <Field label="MOTIVO DEL RECHAZO" help="El estudiante verá este motivo en «Mis solicitudes».">
        <select defaultValue="">
          <option value="" disabled>Selecciona un motivo</option>
          <option>Penalidad pendiente</option>
          <option>Sin unidades libres en el rango solicitado</option>
          <option>Solicitante con deuda pendiente</option>
          <option>Motivo insuficiente para el curso</option>
          <option>Otro</option>
        </select>
      </Field>
      <Field label="DETALLE">
        <textarea rows="3" placeholder="Explica el motivo al estudiante" />
      </Field>
      <div className="modal-info-box">
        Este texto será visible para la estudiante en su detalle de solicitud.
      </div>
    </Modal>
  )
}

// Solicitud ya rechazada: solo se consulta el motivo registrado
export function RejectionReasonModal({ solicitud, onClose }) {
  return (
    <Modal
      title={'Motivo del rechazo · ' + solicitud.id}
      onClose={onClose}
      footer={<button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>}
    >
      <dl className="details">
        <dt>Solicitante</dt><dd>{solicitud.estudiante}</dd>
        <dt>Equipo</dt><dd>{solicitud.equipo}</dd>
        <dt>Fechas</dt><dd className="mono">{solicitud.fechas}</dd>
        <dt>Motivo</dt><dd>{solicitud.motivoRechazo}</dd>
      </dl>
    </Modal>
  )
}
