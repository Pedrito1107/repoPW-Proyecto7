// src/pages/account/RecoverPasswordPage.jsx
import { useState, useEffect } from 'react'
import './RecoverPasswordPage.css'

import {
  isInstitutionalEmail,
  isStrongPassword,
  PASSWORD_RULE
} from '../../shared/validators.js'


const REENVIO_SEGUNDOS = 45


function Progress({ step }) {

  const item = (n) => {

    if (n < step) {
      return (
        <div className="recover-progress-item completed">
          ✓
        </div>
      )
    }

    return (
      <div
        className={
          'recover-progress-item' +
          (n === step ? ' active' : '')
        }
      >
        {n}
      </div>
    )
  }


  return (
    <div className="recover-progress">

      {item(1)}

      <div
        className={
          'recover-progress-line' +
          (step > 1 ? ' active-line' : '')
        }
      ></div>

      {item(2)}

      <div
        className={
          'recover-progress-line' +
          (step > 2 ? ' active-line' : '')
        }
      ></div>

      {item(3)}

    </div>
  )
}


function RecoverPasswordPage() {

  const [step, setStep] = useState(1)

  const [correo, setCorreo] = useState('')

  const [password, setPassword] = useState('')

  const [confirmar, setConfirmar] = useState('')

  const [errors, setErrors] = useState({})

  const [generalError, setGeneralError] = useState('')

  const [loading, setLoading] = useState(false)

  const [segundos, setSegundos] = useState(0)


  // Usuarios temporales para la primera entrega
  // Más adelante esto vendrá de la base de datos
  // (mismos correos que las cuentas de website/controllers.js)
  const usuarios = [
    'estudiante@aloe.ulima.edu.pe',
    'rmendoza@aloe.ulima.edu.pe',
    'bloqueado@aloe.ulima.edu.pe',
    'encargado@aloe.ulima.edu.pe'
  ]


  // Cuenta regresiva para reenviar enlace
  useEffect(() => {

    if (segundos <= 0) return


    const timer = setTimeout(() => {

      setSegundos(segundos - 1)

    }, 1000)


    return () => clearTimeout(timer)

  }, [segundos])


  // ========================================
  // PASO 1
  // VALIDAR CORREO
  // ========================================

  function enviarEnlace(e) {

    e?.preventDefault()

    setErrors({})
    setGeneralError('')


    if (correo.trim() === '') {

      setErrors({
        correo: 'Ingresa tu correo institucional.'
      })

      return
    }


    if (!isInstitutionalEmail(correo)) {

      setErrors({
        correo: 'Ingresa un correo institucional válido.'
      })

      return
    }


    const correoLimpio =
      correo.trim().toLowerCase()


    let existe = false


    for (let i = 0; i < usuarios.length; i++) {

      if (usuarios[i] === correoLimpio) {

        existe = true

      }

    }


    if (!existe) {

      setErrors({
        correo: true
      })

      setGeneralError(
        'No encontramos una cuenta asociada a ese correo.'
      )

      return
    }


    setLoading(true)


    // Simulación de envío de correo
    setTimeout(() => {

      setStep(2)

      setSegundos(REENVIO_SEGUNDOS)

      setLoading(false)

    }, 500)

  }


  // ========================================
  // PASO 3
  // GUARDAR NUEVA CONTRASEÑA
  // ========================================

  function guardarContrasena(e) {

    e.preventDefault()

    setGeneralError('')


    const nuevos = {}


    if (!isStrongPassword(password)) {

      nuevos.nueva = PASSWORD_RULE

    }


    if (
      confirmar === '' ||
      password !== confirmar
    ) {

      nuevos.confirmar =
        'Las contraseñas no coinciden.'

    }


    setErrors(nuevos)


    if (Object.keys(nuevos).length > 0) {

      return

    }


    setLoading(true)


    /*
      POR AHORA:
      solo simulamos que la contraseña cambió.

      Después lo conectaremos al backend
      para que también cambie en el login real.
    */

    setTimeout(() => {

      setLoading(false)

      setStep(4)

    }, 500)

  }


  const fuerza =
    password === ''
      ? null
      : isStrongPassword(password)
        ? 'safe'
        : 'weak'


  const mmss =
    '00:' +
    String(segundos).padStart(2, '0')


  return (

    <main className="recover-content">


      {/* =====================================
          PASO 1
          INGRESAR CORREO
      ===================================== */}

      {step === 1 && (

        <form
          className="recover-card"
          onSubmit={enviarEnlace}
          noValidate
        >

          <Progress step={1} />


          <h1>
            Recupera tu acceso
          </h1>


          <p className="recover-description">

            Te enviaremos un enlace para crear una contraseña nueva.
            El enlace expira en 60 minutos.

          </p>


          {generalError && (

            <div
              className="
                recover-general-message
                recover-general-error
              "
              role="alert"
            >

              {generalError}

            </div>

          )}


          <div className="recover-field">

            <label htmlFor="recoverEmail">
              CORREO INSTITUCIONAL
            </label>


            <input
              id="recoverEmail"
              type="email"

              placeholder="nombre@aloe.ulima.edu.pe"

              value={correo}

              onChange={(e) =>
                setCorreo(e.target.value)
              }

              disabled={loading}

              className={
                errors.correo
                  ? 'recover-input-error'
                  : ''
              }
            />


            <span className="recover-field-error">

              {
                typeof errors.correo === 'string'
                  ? errors.correo
                  : ''
              }

            </span>

          </div>


          <button
            type="submit"
            className="recover-main-button"
            disabled={loading}
          >

            {
              loading
                ? 'Enviando…'
                : 'Enviar enlace'
            }

          </button>


          <a
            href="/public/login"
            className="recover-back-login"
          >
            Volver al inicio de sesión
          </a>

        </form>

      )}



      {/* =====================================
          PASO 2
          REVISAR CORREO
      ===================================== */}

      {step === 2 && (

        <div className="recover-card">

          <Progress step={2} />


          <div className="recover-mail-icon">
            ✉
          </div>


          <h2>
            Revisa tu correo
          </h2>


          <p className="recover-step2-text">

            Enviamos el enlace a{' '}

            <strong>
              {correo.trim()}
            </strong>.

            <br />


            {
              segundos > 0
                ? (
                  <>
                    Podrás reenviarlo en {mmss}.
                  </>
                )
                : (
                  <button
                    type="button"
                    className="recover-link-button"
                    onClick={enviarEnlace}
                    disabled={loading}
                  >
                    Reenviar enlace
                  </button>
                )
            }

          </p>


          <button
            type="button"
            className="
              recover-main-button
              recover-open-link
            "
            onClick={() => setStep(3)}
          >
            Simular apertura del enlace
          </button>


          <a
            href="/public/login"
            className="recover-back-login"
          >
            Volver al inicio de sesión
          </a>

        </div>

      )}



      {/* =====================================
          PASO 3
          NUEVA CONTRASEÑA
      ===================================== */}

      {step === 3 && (

        <form
          className="recover-card"
          onSubmit={guardarContrasena}
          noValidate
        >

          <Progress step={3} />


          <h1>
            Crea una nueva contraseña
          </h1>


          <p className="recover-description">

            Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.

          </p>


          {generalError && (

            <div
              className="
                recover-general-message
                recover-general-error
              "
              role="alert"
            >

              {generalError}

            </div>

          )}


          <div className="recover-field">

            <label htmlFor="recoverNewPassword">
              NUEVA CONTRASEÑA
            </label>


            <input
              id="recoverNewPassword"

              type="password"

              autoComplete="new-password"

              placeholder="••••••••"

              value={password}

              onChange={(e) =>
                setPassword(e.target.value)
              }

              className={
                errors.nueva
                  ? 'recover-input-error'
                  : ''
              }
            />


            <span className="recover-field-error">
              {errors.nueva}
            </span>

          </div>


          <div className="recover-strength">

            <div className="recover-strength-track">

              <div
                className={
                  'recover-strength-fill' +
                  (
                    fuerza
                      ? ' recover-strength-' + fuerza
                      : ''
                  )
                }
              ></div>

            </div>


            <span
              className={
                'recover-strength-text' +
                (
                  fuerza
                    ? ' recover-strength-text-' + fuerza
                    : ''
                )
              }
            >

              {
                fuerza === 'safe'
                  ? 'Segura'
                  : fuerza === 'weak'
                    ? 'Débil'
                    : ''
              }

            </span>

          </div>


          <div className="recover-field">

            <label htmlFor="recoverConfirmPassword">
              CONFIRMAR CONTRASEÑA
            </label>


            <input
              id="recoverConfirmPassword"

              type="password"

              autoComplete="new-password"

              placeholder="••••••••"

              value={confirmar}

              onChange={(e) =>
                setConfirmar(e.target.value)
              }

              className={
                errors.confirmar
                  ? 'recover-input-error'
                  : ''
              }
            />


            <span className="recover-field-error">
              {errors.confirmar}
            </span>

          </div>


          <button
            type="submit"
            className="recover-main-button"
            disabled={loading}
          >

            {
              loading
                ? 'Guardando…'
                : 'Guardar contraseña'
            }

          </button>

        </form>

      )}



      {/* =====================================
          PASO 4
          ÉXITO
      ===================================== */}

      {step === 4 && (

        <div className="recover-success">

          <div className="recover-success-icon">
            ✓
          </div>


          <h2>
            Contraseña actualizada
          </h2>


          <p>
            Tu contraseña se cambió correctamente.
            Ya puedes iniciar sesión con tu nueva contraseña.

           
          </p>


          <button
  type="button"
  className="btn btn-primary recover-login-btn"
  onClick={() => navigate('/public/login')}
>
  Ir a iniciar sesión
</button>

        </div>

      )}

    </main>

  )

}

export default RecoverPasswordPage