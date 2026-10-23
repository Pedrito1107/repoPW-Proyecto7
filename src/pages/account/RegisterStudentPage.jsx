// src/pages/account/RegisterStudentPage.jsx  (HU-1 · 1.3 Registro de estudiante)
import { useState } from 'react'
import './RegisterStudentPage.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { CARRERAS, CICLOS } from '../../shared/constants.js'
import { validateStudentRegistration, hasErrors, PASSWORD_RULE } from '../../shared/validators.js'

const EMPTY = {
  nombres: '',
  apellidos: '',
  carrera: '',
  ciclo: '',
  correo: '',
  password: '',
  confirmar: '',
  reglamento: false
}

function RegisterStudentPage() {
  const { registerStudent } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)

  function onChange(e) {
    const { name, value, type, checked } = e.target
    const next = { ...form, [name]: type === 'checkbox' ? checked : value }
    setForm(next)
    // Validación en línea: si el campo ya tenía error, se revalida al escribir
    if (errors[name]) {
      const nuevos = validateStudentRegistration(next)
      setErrors({ ...errors, [name]: nuevos[name] })
    }
  }

  // Valida el campo al salir de él (correo, contraseñas)
  function onBlur(e) {
    const { name } = e.target
    if (form[name] === '') return
    const nuevos = validateStudentRegistration(form)
    setErrors({ ...errors, [name]: nuevos[name] })
  }

  async function crearCuenta(e) {
    e.preventDefault()
    setServerError('')
    const nuevos = validateStudentRegistration(form)
    setErrors(nuevos)
    if (hasErrors(nuevos)) return

    setSaving(true)
    try {
      const user = await registerStudent(form)
      setCreated(user)
      setForm(EMPTY)
    } catch (err) {
      if (err.fields && hasErrors(err.fields)) setErrors(err.fields)
      setServerError(err.status === 409
        ? err.message + ' Inicia sesión o recupera tu contraseña.'
        : err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalErrores = Object.values(errors).filter(Boolean).length
  const inputClass = (name) => (errors[name] ? 'student-register-input-error' : '')

  if (created) {
    return (
      <main className="student-register-content">
        <div className="student-register-success">
          <div className="student-register-success-icon">✓</div>
          <h2>Cuenta creada</h2>
          <p>
            Enviamos un enlace de verificación a <strong>{created.correo}</strong>. Válido por 24 horas.
          </p>
          <div className="student-register-success-actions">
            <button type="button" className="student-register-success-secondary" onClick={() => setCreated(null)}>
              Volver
            </button>
            <a href="/public/login" className="student-register-success-button">Ir a iniciar sesión</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="student-register-content">
      <form className="student-register-card" onSubmit={crearCuenta} noValidate>
        <h1>Crea tu cuenta de estudiante</h1>
        <p className="student-register-description">
          Solo se admiten correos @aloe.ulima.edu.pe. La cuenta se activa con el enlace de verificación.
        </p>

        {serverError && (
          <div className="student-register-result student-register-result-error" role="alert">{serverError}</div>
        )}

        <h2 className="student-register-section-title">DATOS PERSONALES</h2>

        <div className="student-register-row">
          <div className="student-register-field">
            <label htmlFor="studentNames">NOMBRES</label>
            <input id="studentNames" name="nombres" type="text" placeholder="Renzo Andrés"
              value={form.nombres} onChange={onChange} className={inputClass('nombres')} />
            <span className="student-register-field-error">{errors.nombres}</span>
          </div>
          <div className="student-register-field">
            <label htmlFor="studentLastNames">APELLIDOS</label>
            <input id="studentLastNames" name="apellidos" type="text" placeholder="Mendoza Cárdenas"
              value={form.apellidos} onChange={onChange} className={inputClass('apellidos')} />
            <span className="student-register-field-error">{errors.apellidos}</span>
          </div>
        </div>

        <div className="student-register-row">
          <div className="student-register-field">
            <label htmlFor="studentCareer">CARRERA</label>
            <select id="studentCareer" name="carrera" value={form.carrera} onChange={onChange} className={inputClass('carrera')}>
              <option value="">Selecciona una carrera</option>
              {CARRERAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="student-register-field-error">{errors.carrera}</span>
          </div>
          <div className="student-register-field">
            <label htmlFor="studentCycle">CICLO</label>
            <select id="studentCycle" name="ciclo" value={form.ciclo} onChange={onChange} className={inputClass('ciclo')}>
              <option value="">Selecciona</option>
              {CICLOS.map((c) => <option key={c} value={c}>{c}.º</option>)}
            </select>
            <span className="student-register-field-error">{errors.ciclo}</span>
          </div>
        </div>

        <h2 className="student-register-section-title student-register-access-title">ACCESO</h2>

        <div className="student-register-field">
          <label htmlFor="studentEmail">CORREO INSTITUCIONAL</label>
          <input id="studentEmail" name="correo" type="email" placeholder="nombre@aloe.ulima.edu.pe"
            value={form.correo} onChange={onChange} onBlur={onBlur} className={inputClass('correo')} />
          <span className="student-register-field-error">{errors.correo}</span>
        </div>

        <div className="student-register-row">
          <div className="student-register-field">
            <label htmlFor="studentPassword">CONTRASEÑA</label>
            <input id="studentPassword" name="password" type="password" placeholder="••••••••" autoComplete="new-password"
              value={form.password} onChange={onChange} onBlur={onBlur} className={inputClass('password')} />
            <span className="student-register-field-error">{errors.password}</span>
            {!errors.password && <small>{PASSWORD_RULE}</small>}
          </div>
          <div className="student-register-field">
            <label htmlFor="studentConfirmPassword">CONFIRMAR CONTRASEÑA</label>
            <input id="studentConfirmPassword" name="confirmar" type="password" placeholder="••••••••" autoComplete="new-password"
              value={form.confirmar} onChange={onChange} onBlur={onBlur} className={inputClass('confirmar')} />
            <span className="student-register-field-error">{errors.confirmar}</span>
          </div>
        </div>

        <label className="student-register-rules">
          <input name="reglamento" type="checkbox" checked={form.reglamento} onChange={onChange} />
          <span>
            Acepto el reglamento de préstamo de equipos y me responsabilizo por el cuidado y la devolución
            de las unidades asignadas.
          </span>
        </label>
        <span className="student-register-field-error">{errors.reglamento}</span>

        {totalErrores > 0 && (
          <div className="student-register-summary student-register-summary-error">
            Revisa {totalErrores} {totalErrores === 1 ? 'campo' : 'campos'} antes de continuar.
          </div>
        )}

        <div className="student-register-actions">
          <a href="/public" className="student-register-cancel">Cancelar</a>
          <button type="submit" className="student-register-submit" disabled={saving}>
            {saving ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </div>

        <p className="register-switch">
          ¿Eres personal del almacén? <a href="/public/register-manager">Regístrate como encargado</a>
        </p>
      </form>
    </main>
  )
}

export default RegisterStudentPage
