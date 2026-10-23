// src/pages/inventory/ConditionsForm.jsx  (HU-2 · 2.5 Condiciones del préstamo)
import { useState } from 'react'
import { useInventory } from '../../context/InventoryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { CondicionesPreview } from '../../components/conditions.jsx'
import { Field } from '../../components/ui.jsx'

function toForm(c) {
  return {
    duracionMaxima: String(c.duracionMaxima),
    requiereAutorizacion: c.requiereAutorizacion,
    admiteRenovacion: c.admiteRenovacion,
    penalidadDia: Number(c.penalidadDia).toFixed(2)
  }
}

export default function ConditionsForm({ equipo, onSaved }) {
  const { updateCondiciones } = useInventory()
  const toast = useToast()
  const [form, setForm] = useState(() => toForm(equipo.condiciones))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const original = toForm(equipo.condiciones)
  const dirty = Object.keys(form).some((k) => form[k] !== original[k])

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setErrors({ ...errors, [name]: undefined })
  }

  async function guardar(e) {
    e.preventDefault()
    const nuevos = {}
    const dias = Number(form.duracionMaxima)
    if (!Number.isInteger(dias) || dias < 1 || dias > 60) nuevos.duracionMaxima = 'Ingresa un número entero de días entre 1 y 60.'
    if (form.penalidadDia === '' || Number(form.penalidadDia) < 0) nuevos.penalidadDia = 'Ingresa un monto mayor o igual a 0.'
    setErrors(nuevos)
    if (Object.keys(nuevos).length) return

    setSaving(true)
    try {
      await updateCondiciones(equipo.id, form)
      toast.success('Condiciones del préstamo actualizadas.')
      onSaved()
    } catch (err) {
      setErrors(err.fields || {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Vista previa en vivo con los valores que se están editando
  const preview = {
    duracionMaxima: Number(form.duracionMaxima) || 0,
    requiereAutorizacion: form.requiereAutorizacion,
    admiteRenovacion: form.admiteRenovacion,
    penalidadDia: Number(form.penalidadDia) || 0
  }

  return (
    <div className="card conditions-card">
      <h2>Condiciones del préstamo</h2>

      <form className="conditions" onSubmit={guardar} noValidate>
        <div className="conditions-fields">
          <Field label="DURACIÓN MÁXIMA" error={errors.duracionMaxima}>
            <div className="input-suffix">
              <input name="duracionMaxima" type="number" min="1" max="60" value={form.duracionMaxima} onChange={onChange} />
              <span>días calendario</span>
            </div>
          </Field>

          <label className="switch-row">
            <input type="checkbox" name="requiereAutorizacion" checked={form.requiereAutorizacion} onChange={onChange} />
            <span>Requiere autorización del docente</span>
          </label>
          <label className="switch-row">
            <input type="checkbox" name="admiteRenovacion" checked={form.admiteRenovacion} onChange={onChange} />
            <span>Admite renovación</span>
          </label>

          <Field label="PENALIDAD POR DÍA" error={errors.penalidadDia}>
            <div className="input-prefix">
              <span>S/</span>
              <input name="penalidadDia" type="number" min="0" step="0.5" value={form.penalidadDia} onChange={onChange} />
            </div>
          </Field>
        </div>

        <div className="conditions-side">
          <span className="section-label">VISTA PREVIA PARA EL ESTUDIANTE</span>
          <aside className="preview-box">
            <strong>Condiciones de este equipo</strong>
            <CondicionesPreview c={preview} />
          </aside>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" disabled={!dirty || saving}
              onClick={() => { setForm(original); setErrors({}) }}>
              Descartar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
              {saving ? 'Guardando…' : 'Guardar condiciones'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
