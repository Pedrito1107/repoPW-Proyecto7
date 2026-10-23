// src/pages/account/RegisterManagerPage.jsx  (HU-1 · 1.4 Registro de encargado)
import { useState } from 'react'
import './RegisterManagerPage.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { ALMACENES } from '../../shared/constants.js'
import { validateManagerRegistration, hasErrors, PASSWORD_RULE } from '../../shared/validators.js'

const EMPTY = {
  nombres: '',
  apellidos: '',
  correo: '',
  password: '',
  confirmar: '',
  almacen: '',
  anexo: ''
}

function RegisterManagerPage() {
  const { registerManager } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)

  function onChange(e) {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    if (errors[name]) {
      const nuevos = validateManagerRegistration(next)
      setErrors({ ...errors, [name]: nuevos[name] })
    }
  }

  function onBlur(e) {
    const { name } = e.target
    if (form[name] === '') return
    const nuevos = validateManagerRegistration(form)
    setErrors({ ...errors, [name]: nuevos[name] })
  }

  async function registrar(e) {
    e.preventDefault()
    setServerError('')
    const nuevos = validateManagerRegistration(form)
    setErrors(nuevos)
    if (hasErrors(nuevos)) return

    setSaving(true)
    try {
      const user = await registerManager(form)
      setCreated(user)
      setForm(EMPTY)
    } catch (err) {
      if (err.fields && hasErrors(err.fields)) setErrors(err.fields)
      setServerError(err.status === 409
        ? err.message + ' Inicia sesión o comunícate con el administrador.'
        : err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalErrores = Object.values(errors).filter(Boolean).length
  const inputClass = (name) => (errors[name] ? 'manager-register-input-error' : '')

  if (created) {
    return (
      <main className="manager-register-content">
        <div className="manager-register-success">
          <div className="manager-register-success-icon">✓</div>
          <h2>Solicitud de registro enviada</h2>
          <p>La cuenta de <strong>{created.correo}</strong> fue registrada correctamente.</p>
          <p>Almacén asignado: <strong>{created.almacen}</strong></p>
          <div className="manager-register-pending">Estado: Pendiente de aprobación</div>
          <p className="manager-register-success-help">
            El encargado podrá iniciar sus funciones cuando el jefe de laboratorio apruebe la cuenta.
          </p>
          <div className="manager-register-success-actions">
            <button type="button" className="manager-register-success-secondary" onClick={() => setCreated(null)}>
              Volver
            </button>
            <a href="/public/login" className="manager-register-success-button">Ir a iniciar sesión</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="manager-register-content">
      <form className="manager-register-card" onSubmit={registrar} noValidate>
        <h1>Registro de encargado de almacén</h1>
        <p className="manager-register-description">
          El alta queda pendiente hasta que el jefe de laboratorio la apruebe.
          Solo se admiten correos @aloe.ulima.edu.pe.
        </p>

        {serverError && (
          <div className="manager-register-result manager-register-result-error" role="alert">{serverError}</div>
        )}

        <h2 className="manager-register-section-title">DATOS PERSONALES</h2>
        <div className="manager-register-row">
          <div className="manager-register-field">
            <label htmlFor="managerNames">NOMBRES</label>
            <input id="managerNames" name="nombres" type="text" placeholder="Elena Sofía"
              value={form.nombres} onChange={onChange} className={inputClass('nombres')} />
            <span className="manager-register-field-error">{errors.nombres}</span>
          </div>
          <div className="manager-register-field">
            <label htmlFor="managerLastNames">APELLIDOS</label>
            <input id="managerLastNames" name="apellidos" type="text" placeholder="Rivas Talledo"
              value={form.apellidos} onChange={onChange} className={inputClass('apellidos')} />
            <span className="manager-register-field-error">{errors.apellidos}</span>
          </div>
        </div>

        <h2 className="manager-register-section-title">ACCESO</h2>
        <div className="manager-register-field">
          <label htmlFor="managerEmail">CORREO INSTITUCIONAL</label>
          <input id="managerEmail" name="correo" type="email" placeholder="encargado@aloe.ulima.edu.pe"
            value={form.correo} onChange={onChange} onBlur={onBlur} className={inputClass('correo')} />
          <span className="manager-register-field-error">{errors.correo}</span>
          {!errors.correo && <small>Debe terminar en @aloe.ulima.edu.pe</small>}
        </div>

        <div className="manager-register-row">
          <div className="manager-register-field">
            <label htmlFor="managerPassword">CONTRASEÑA</label>
            <input id="managerPassword" name="password" type="password" placeholder="••••••••" autoComplete="new-password"
              value={form.password} onChange={onChange} onBlur={onBlur} className={inputClass('password')} />
            <span className="manager-register-field-error">{errors.password}</span>
            {!errors.password && <small>{PASSWORD_RULE}</small>}
          </div>
          <div className="manager-register-field">
            <label htmlFor="managerConfirmPassword">CONFIRMAR CONTRASEÑA</label>
            <input id="managerConfirmPassword" name="confirmar" type="password" placeholder="••••••••" autoComplete="new-password"
              value={form.confirmar} onChange={onChange} onBlur={onBlur} className={inputClass('confirmar')} />
            <span className="manager-register-field-error">{errors.confirmar}</span>
          </div>
        </div>

        <h2 className="manager-register-section-title">ASIGNACIÓN</h2>
        <div className="manager-register-row">
          <div className="manager-register-field">
            <label htmlFor="managerWarehouse">ALMACÉN ASIGNADO</label>
            <select id="managerWarehouse" name="almacen" value={form.almacen} onChange={onChange} className={inputClass('almacen')}>
              <option value="">Selecciona un almacén</option>
              {ALMACENES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <span className="manager-register-field-error">{errors.almacen}</span>
          </div>
          <div className="manager-register-field">
            <label htmlFor="managerPhone">ANEXO TELEFÓNICO</label>
            <input id="managerPhone" name="anexo" type="text" inputMode="numeric" maxLength="4" placeholder="3120"
              value={form.anexo} onChange={onChange} onBlur={onBlur} className={inputClass('anexo')} />
            <span className="manager-register-field-error">{errors.anexo}</span>
          </div>
        </div>

        <div className="manager-register-warning">
          La cuenta se crea en estado <strong>«Pendiente de aprobación»</strong>.
          Hasta entonces no podrá aprobar solicitudes ni registrar entregas.
        </div>

        {totalErrores > 0 && (
          <div className="manager-register-summary manager-register-summary-error">
            Revisa {totalErrores} {totalErrores === 1 ? 'campo' : 'campos'} antes de continuar.
          </div>
        )}

        <div className="manager-register-actions">
          <a href="/public" className="manager-register-cancel">Cancelar</a>
          <button type="submit" className="manager-register-submit" disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar encargado'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default RegisterManagerPage
