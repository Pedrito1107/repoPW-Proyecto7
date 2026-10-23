// src/pages/metrics/BlockModal.jsx
// HU-7 · 7.3 Modal de bloqueo / desbloqueo con motivo (también se usa desde
// la ficha del estudiante, HU-5). Valida junto al campo y muestra el error
// del servicio (p. ej. préstamo entregado sin devolver).

import { useState } from 'react'
import { Modal, Field, Alert } from '../../components/ui.jsx'
import { MOTIVOS_BLOQUEO, MOTIVOS_DESBLOQUEO } from '../../shared/constants.js'
import { validateBloqueo, hasErrors, MAX_DETALLE_BLOQUEO } from '../../shared/validators.js'

export function BlockModal({ usuario, desbloquear = false, onClose, onConfirm }) {
  const accion = desbloquear ? 'Desbloquear cuenta' : 'Bloquear cuenta'
  const motivos = desbloquear ? MOTIVOS_DESBLOQUEO : MOTIVOS_BLOQUEO
  const [form, setForm] = useState({ motivo: '', detalle: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
    setServerError('')
  }

  async function submit() {
    const errs = validateBloqueo(form, motivos)
    setErrors(errs)
    if (hasErrors(errs)) return
    if (!onConfirm) return onClose()
    setBusy(true)
    try {
      await onConfirm(form)
    } catch (err) {
      setErrors(err.fields || {})
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={accion}
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancelar</button>
          <button type="button" className={'btn ' + (desbloquear ? 'btn-primary' : 'btn-danger')} onClick={submit} disabled={busy}>
            {busy ? 'Procesando…' : accion}
          </button>
        </>
      }
    >
      <p className="modal-text">
        {desbloquear
          ? '¿Desbloquear la cuenta de ' + usuario + '? Podrá volver a solicitar equipos.'
          : '¿Bloquear la cuenta de ' + usuario + '? No podrá solicitar ni reservar equipos hasta que se desbloquee.'}
      </p>
      <Alert type="danger">{serverError}</Alert>
      <Field label="MOTIVO" error={errors.motivo} help="Queda registrado en el historial del estudiante.">
        <select name="motivo" value={form.motivo} onChange={onChange}>
          <option value="" disabled>Selecciona un motivo</option>
          {motivos.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="DETALLE" error={errors.detalle} help={form.detalle.length + ' / ' + MAX_DETALLE_BLOQUEO}>
        <textarea name="detalle" rows="3" maxLength={MAX_DETALLE_BLOQUEO} placeholder="Describe el motivo" value={form.detalle} onChange={onChange} />
      </Field>
    </Modal>
  )
}
