// src/pages/metrics/DateRangeFilter.jsx
// HU-7 · Rango de fechas del tablero y del ranking. El rango vive en el
// contexto, así se conserva al pasar del tablero al ranking.

import { useState, useEffect } from 'react'
import { Field } from '../../components/ui.jsx'
import { useMetrics } from '../../context/MetricsContext.jsx'
import { validateRango, hasErrors } from '../../shared/validators.js'
import { FECHA_CORTE } from '../../shared/constants.js'

export function DateRangeFilter() {
  const { rango, setRango } = useMetrics()
  const [form, setForm] = useState(rango)
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm(rango) }, [rango])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  function onSubmit(e) {
    e.preventDefault()
    const errs = validateRango(form, FECHA_CORTE)
    setErrors(errs)
    if (!hasErrors(errs)) setRango(form)
  }

  return (
    <form className="range-filter" onSubmit={onSubmit} noValidate aria-label="Rango de fechas">
      <Field label="DESDE" error={errors.desde}>
        <input type="date" name="desde" value={form.desde} max={FECHA_CORTE} onChange={onChange} />
      </Field>
      <Field label="HASTA" error={errors.hasta}>
        <input type="date" name="hasta" value={form.hasta} max={FECHA_CORTE} onChange={onChange} />
      </Field>
      <button type="submit" className="btn btn-secondary">Aplicar</button>
    </form>
  )
}
