// src/pages/account/LoginPage.jsx
// HU-1 · Inicio de sesión. Estados del mockup:
//  · error de credenciales: mensaje dentro de la tarjeta con los intentos que quedan
//  · cuenta bloqueada por deuda: aviso y botón para entrar a ver el historial
//  · botón en carga: «Ingresando…» con campos y enlaces deshabilitados
// El servidor valida y crea la sesión (POST /login → website/services.js).
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { plural } from '../../shared/format.js'
import './LoginPage.css'

function LoginPage() {

  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // { tipo: 'credenciales' | 'intentos' | 'campos' | 'servidor', texto }
  const [error, setError] = useState(
    searchParams.get('error') === '1'
      ? { tipo: 'credenciales', texto: 'Correo o contraseña incorrectos.' }
      : null
  )

  // Aviso de cuenta bloqueada: { deuda, prestamo, redirect }
  const [bloqueada, setBloqueada] = useState(null)


  async function onSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const { redirect, aviso } = await login(correo, password, searchParams.get('next') || '')
      if (aviso?.tipo === 'bloqueada') {
        setBloqueada({ ...aviso, redirect })
        setLoading(false)
        return
      }
      window.location.href = redirect
    } catch (err) {
      setPassword('')
      if (err.status === 401) {
        setError({
          tipo: 'credenciales',
          texto: 'Correo o contraseña incorrectos. Te ' +
            (err.intentosRestantes === 1 ? 'queda ' : 'quedan ') +
            plural(err.intentosRestantes, 'intento', 'intentos') + '.'
        })
      } else if (err.status === 429) {
        setError({ tipo: 'intentos', texto: err.message })
      } else if (err.status === 400) {
        setError({ tipo: 'campos', texto: err.message })
      } else {
        setError({ tipo: 'servidor', texto: err.message })
      }
      setLoading(false)
    }
  }


  const passwordConError = error?.tipo === 'credenciales'
  const enlace = loading ? 'login-link-disabled' : undefined


  return (

    <main className="login-content">

      <form
        className="login-card"
        action="/login"
        method="POST"
        onSubmit={onSubmit}
        noValidate
        aria-busy={loading}
      >

        {/* Si llegó desde una página que pedía sesión (?next=...), vuelve ahí */}
        <input
          type="hidden"
          name="next"
          value={searchParams.get('next') || ''}
        />

        <h1>
          Inicia sesión
        </h1>

        <p className="login-description">
          Usa tu correo institucional para solicitar y seguir tus préstamos.
        </p>


        {/* CUENTA BLOQUEADA POR DEUDA */}

        {bloqueada && (

          <div
            className="login-message login-message-blocked"
            role="alert"
          >

            {bloqueada.deuda
              ? <>Cuenta bloqueada: penalidad pendiente de <strong className="mono">{bloqueada.deuda}</strong>
                  {bloqueada.prestamo && <> por el préstamo <strong className="mono">{bloqueada.prestamo}</strong></>}.</>
              : <>Cuenta bloqueada por incumplimiento.</>}

            <br />

            <span>
              Puedes ingresar para ver tu historial, pero no solicitar equipos hasta regularizar en Tesorería.
            </span>

          </div>

        )}


        {/* ERROR DE CREDENCIALES / DEMASIADOS INTENTOS */}

        {error && !bloqueada && (

          <div
            className="login-message login-message-error"
            role="alert"
          >

            {error.texto}

          </div>

        )}


        {/* CORREO */}

        <div className="login-field">

          <label htmlFor="loginUser">
            CORREO INSTITUCIONAL
          </label>

          <input
            id="loginUser"
            name="username"
            type="email"
            autoComplete="username"
            placeholder="tucorreo@aloe.ulima.edu.pe"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={loading || !!bloqueada}
            required
          />

        </div>


        {/* CONTRASEÑA */}

        <div className="login-field">

          <label htmlFor="loginPassword">
            CONTRASEÑA
          </label>

          <input
            id="loginPassword"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (passwordConError) setError(null) }}
            className={passwordConError ? 'login-input-error' : undefined}
            aria-invalid={passwordConError}
            aria-describedby={passwordConError ? 'loginPasswordError' : undefined}
            disabled={loading || !!bloqueada}
            required
          />

          {passwordConError && (
            <small id="loginPasswordError" className="login-field-error">
              Verifica tus datos e inténtalo otra vez.
            </small>
          )}

        </div>


        {/* OPCIONES */}

        <div className="login-options">

          <label className={'login-remember' + (loading ? ' login-link-disabled' : '')}>

            <input
              name="remember"
              type="checkbox"
              disabled={loading}
            />

            <span>
              Recordarme
            </span>

          </label>


          <a href="/public/recover-password" className={enlace} aria-disabled={loading}>
            ¿Olvidaste tu contraseña?
          </a>

        </div>


        {/* BOTÓN */}

        {bloqueada ? (

          <button
            type="button"
            className="login-main-button"
            onClick={() => { window.location.href = bloqueada.redirect }}
          >
            Ingresar a ver mi historial
          </button>

        ) : (

          <button
            type="submit"
            className="login-main-button"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

        )}


        {/* CREAR CUENTA */}

        <div className="login-create-account">

          <span>
            ¿No tienes cuenta?
          </span>

          <a href="/public/register" className={enlace} aria-disabled={loading}>
            Crear cuenta
          </a>

        </div>

      </form>

    </main>
  )
}

export default LoginPage
