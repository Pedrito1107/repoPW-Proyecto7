// src/pages/inventory/UnitModals.jsx
// 2.3 Alta / edición de unidad  ·  2.4 Cambio de estado de unidad
import { useState } from 'react'
import { useInventory } from '../../context/InventoryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ESTADOS_UNIDAD, TRANSICIONES_UNIDAD } from '../../shared/constants.js'
import { isInventoryCode } from '../../shared/validators.js'
import { Modal, Field, StatusBadge, Alert } from '../../components/ui.jsx'

export function UnitFormModal({ equipo, unidad, onClose, onSaved }) {
  const editando = Boolean(unidad)
  const { createUnidad, updateUnidad, suggestCodigo } = useInventory()
  const toast = useToast()
  const [form, setForm] = useState(() => ({
    codigo: unidad?.codigo || suggestCodigo(equipo.id, equipo.nombre),
    ubicacion: unidad?.ubicacion || equipo.almacen || '',
    observaciones: unidad?.observaciones || ''
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  async function guardar(e) {
    e.preventDefault()
    const nuevos = {}
    if (!editando && !isInventoryCode(form.codigo.trim().toUpperCase())) nuevos.codigo = 'Usa el formato INV-XXX-0000.'
    if (!form.ubicacion.trim()) nuevos.ubicacion = 'Indica la ubicación.'
    setErrors(nuevos)
    if (Object.keys(nuevos).length) return

    setSaving(true)
    try {
      const saved = editando ? await updateUnidad(unidad.id, form) : await createUnidad(equipo.id, form)
      toast.success(editando ? 'Unidad ' + saved.codigo + ' actualizada.' : 'Unidad ' + saved.codigo + ' registrada como disponible.')
      onSaved()
    } catch (err) {
      setErrors(err.fields || {})
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      title={editando ? 'Editar unidad' : 'Nueva unidad'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form="unit-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar unidad'}
          </button>
        </>
      }
    >
      <form id="unit-form" onSubmit={guardar} noValidate>
        <p className="modal-text modal-sub">{equipo.nombre}</p>
        <div className="form-row-b">
          <Field label="CÓDIGO DE INVENTARIO" error={errors.codigo}>
            <input name="codigo" className="mono-input" value={form.codigo} onChange={onChange} disabled={editando}
              onBlur={() => setForm({ ...form, codigo: form.codigo.trim().toUpperCase() })} />
          </Field>
          <Field label="UBICACIÓN" error={errors.ubicacion}>
            <input name="ubicacion" value={form.ubicacion} onChange={onChange} placeholder="Almacén H-102 · anaquel 3" />
          </Field>
        </div>
        <p className="field-help modal-help">
          {editando ? 'El código no se puede modificar.' : 'Formato INV-XXX-0000, único en el almacén.'}
        </p>
        <Field label="OBSERVACIONES" help="Opcional. Estado físico, faltantes, etc.">
          <textarea name="observaciones" rows="3" value={form.observaciones} onChange={onChange} />
        </Field>
      </form>
    </Modal>
  )
}

const ETIQUETA_OPCION = {
  disponible: 'Disponible',
  mantenimiento: 'En mantenimiento',
  baja: 'Dada de baja'
}

const AYUDA_ESTADO = {
  prestada: 'La unidad está prestada. Volverá a «Disponible» cuando se registre su devolución (HU-5).',
  baja: 'La unidad fue dada de baja. Es un estado final y no admite cambios.'
}

export function UnitStateModal({ unidad, equipoNombre, onClose, onSaved }) {
  const { changeEstadoUnidad } = useInventory()
  const toast = useToast()
  const opciones = TRANSICIONES_UNIDAD[unidad.estado]
  const [hacia, setHacia] = useState(opciones[0] || '')
  const [motivo, setMotivo] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    if (motivo.trim().length < 10) {
      setErrors({ motivo: 'Describe el motivo (mínimo 10 caracteres).' })
      return
    }
    setSaving(true)
    try {
      await changeEstadoUnidad(unidad.id, hacia, motivo)
      toast.success('La unidad ' + unidad.codigo + ' pasó a «' + ESTADOS_UNIDAD[hacia] + '».')
      onSaved()
    } catch (err) {
      setErrors(err.fields || {})
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Cambiar estado de la unidad"
      onClose={onClose}
      footer={opciones.length > 0 && (
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form="state-form"
            className={'btn ' + (hacia === 'baja' ? 'btn-danger' : 'btn-primary')} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar estado'}
          </button>
        </>
      )}
    >
      <p className="modal-text modal-sub">
        {unidad.codigo}{equipoNombre ? '  ·  ' + equipoNombre : ''}
      </p>

      {opciones.length > 0 && (
        <p className="modal-current">
          Estado actual: <StatusBadge estado={unidad.estado} />
        </p>
      )}

      {opciones.length === 0 ? (
        <Alert type="info">{AYUDA_ESTADO[unidad.estado]}</Alert>
      ) : (
        <form id="state-form" onSubmit={guardar} noValidate>
          <Field label="NUEVO ESTADO" error={errors.hacia}>
            <div className="segmented">
              {opciones.map((op) => (
                <label key={op} className={(hacia === op ? 'on ' : '') + 'is-' + op}>
                  <input type="radio" name="hacia" value={op} checked={hacia === op} onChange={() => setHacia(op)} />
                  <span className="dot"></span>
                  {ETIQUETA_OPCION[op] || ESTADOS_UNIDAD[op]}
                </label>
              ))}
            </div>
          </Field>
          <Field label="MOTIVO DEL CAMBIO" error={errors.motivo} help="Queda registrado en el historial de la unidad.">
            <textarea rows="3" value={motivo} onChange={(e) => { setMotivo(e.target.value); setErrors({}) }}
              placeholder="Sonda 2 con falso contacto; se envía a servicio técnico." />
          </Field>
          {hacia === 'baja' && (
            <Alert type="danger">
              Dar de baja es definitivo: la unidad dejará de contarse en la disponibilidad y no podrá volver a prestarse.
            </Alert>
          )}
          {hacia === 'mantenimiento' && (
            <Alert type="warning">
              La disponibilidad del equipo bajará en una unidad mientras dure el mantenimiento.
            </Alert>
          )}
        </form>
      )}
    </Modal>
  )
}
