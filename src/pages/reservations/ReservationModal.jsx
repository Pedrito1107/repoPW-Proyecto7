// src/pages/reservations/ReservationModal.jsx
// HU-6 · 6.2 Modal de reserva con validación en vivo del solapamiento.

import { useMemo, useState } from 'react'
import { Modal, Field } from '../../components/ui.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getAll } from '../../services/db.js'
import { validarReserva, crearReserva } from '../../services/reservationsService.js'
import { dateOnly } from '../../shared/format.js'

export default function ReservationModal({ equipo, usuarioId, desde: desdeInicial, hasta: hastaInicial, onClose, onDone }) {
  const toast = useToast()
  const cursos = useMemo(() => getAll('cursos'), [])
  const [desde, setDesde] = useState(desdeInicial)
  const [hasta, setHasta] = useState(hastaInicial)
  const [curso, setCurso] = useState(cursos[0]?.nombre || '')
  const [motivo, setMotivo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')
  const [errorServicio, setErrorServicio] = useState('')

  // Se recalcula en cada cambio de fechas
  const v = validarReserva({ equipoId: equipo.id, usuarioId, desde, hasta })
  const sinLibres = v.ok && v.libres === 0

  function confirmar() {
    setErrorServicio('')
    if (motivo.trim().length < 10) {
      setErrorMotivo('Escribe al menos 10 caracteres.')
      return
    }
    setErrorMotivo('')
    try {
      const res = crearReserva({ equipoId: equipo.id, usuarioId, desde, hasta, motivo, curso })
      const rango = dateOnly(desde).slice(0, 5) + ' al ' + dateOnly(hasta)
      toast.success(res.enEspera
        ? 'Sin unidades libres del ' + rango + ': quedaste en lista de espera (' + res.puesto + '). La verás en «Mis reservas».'
        : 'Reserva confirmada del ' + rango + '. La verás en «Mis reservas».')
      onDone(res)
    } catch (e) {
      setErrorServicio(e.message || 'No se pudo registrar la reserva.')
    }
  }

  return (
    <Modal
      title="Reservar equipo"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={confirmar} disabled={!v.ok}>Reservar</button>
        </>
      }
    >
      <p className="modal-text"><strong>{equipo.nombre}</strong> · rango marcado en el calendario</p>

      <div className="form-grid">
        <Field label="DESDE" error={v.errores.desde}>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Field>
        <Field label="HASTA" error={v.errores.hasta}>
          <input type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} />
        </Field>
      </div>

      {v.ok && <p className="inline-note" style={{ color: 'var(--success)' }}>{v.dias} {v.dias === 1 ? 'día' : 'días'} · sin solapamiento con tus otras reservas.</p>}
      {v.solape && <div className="alert alert-danger">{v.solape}</div>}

      <Field label="CURSO ASOCIADO">
        <select value={curso} onChange={(e) => setCurso(e.target.value)}>
          {cursos.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
      </Field>
      <Field label="MOTIVO" error={errorMotivo}>
        <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: Mediciones del proyecto final del laboratorio de señales." />
      </Field>

      {sinLibres
        ? <div className="alert alert-warning">Todas las unidades están comprometidas en este rango: tu reserva pasará a lista de espera con el orden de tu registro.</div>
        : <div className="alert alert-warning">Si al llegar la fecha no hay unidades libres, tu reserva pasará a lista de espera con el orden de tu registro.</div>}
      {errorServicio && <div className="alert alert-danger">{errorServicio}</div>}
    </Modal>
  )
}
