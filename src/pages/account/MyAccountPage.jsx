// src/pages/account/MyAccountPage.jsx
// HU-1 · 1.6 Mi cuenta. La usan el estudiante (/student/cuenta) y el
// encargado (/manager/cuenta): los datos vienen de la sesión (window.USER)
// y los campos cambian según el rol.
import { useState } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Field, Alert, StatusBadge, EmptyState } from '../../components/ui.jsx'
import { CARRERAS, CICLOS } from '../../shared/constants.js'
import { money, plural } from '../../shared/format.js'
import { PASSWORD_RULE } from '../../shared/validators.js'


const EMPTY_PASSWORD = {
  actual: '',
  nueva: '',
  confirmar: ''
}


// Campos editables de cada rol (el correo nunca se edita)
function perfilInicial(user) {
  if (user.rol === 'encargado') {
    return {
      nombres: user.nombres,
      apellidos: user.apellidos,
      anexo: user.anexo || ''
    }
  }
  return {
    nombres: user.nombres,
    apellidos: user.apellidos,
    carrera: user.carrera,
    ciclo: String(user.ciclo),
    celular: user.celular || ''
  }
}


export default function MyAccountPage() {

  const { user, homePath } = useAuth()

  if (!user) {
    return (
      <div className="page">
        <h1 className="page-title">Mi cuenta</h1>
        <div className="card">
          <EmptyState
            title="No hay una sesión activa"
            text="Inicia sesión para ver los datos de tu cuenta."
            action={<a href="/public/login" className="btn btn-primary">Iniciar sesión</a>}
          />
        </div>
      </div>
    )
  }

  return <AccountForm user={user} homePath={homePath} />
}


function AccountForm({ user, homePath }) {

  const esEncargado = user.rol === 'encargado'

  const toast = useToast()

  const [profile, setProfile] = useState(() => perfilInicial(user))

  const [pwd, setPwd] = useState(EMPTY_PASSWORD)


  function onProfileChange(e) {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })

  }


  function descartar() {

    setProfile(perfilInicial(user))

  }


  function guardarPerfil(e) {

    e.preventDefault()

    toast.success(
      'Datos actualizados correctamente.'
    )

  }


  function onPwdChange(e) {

    setPwd({
      ...pwd,
      [e.target.name]: e.target.value
    })

  }


  function actualizarContrasena(e) {

    e.preventDefault()


    if (
      pwd.actual === '' ||
      pwd.nueva === '' ||
      pwd.confirmar === ''
    ) {

      toast.error(
        'Completa todos los campos de contraseña.'
      )

      return

    }


    if (pwd.nueva !== pwd.confirmar) {

      toast.error(
        'Las contraseñas no coinciden.'
      )

      return

    }


    setPwd(EMPTY_PASSWORD)

    toast.success(
      'Contraseña actualizada correctamente.'
    )

  }


  return (

    <div className="page">


      <div className="breadcrumb">

        <a href={homePath}>Inicio</a> / Mi cuenta

      </div>


      <h1 className="page-title">

        Mi cuenta

      </h1>



      {/* AVISOS SEGÚN EL ESTADO DE LA CUENTA */}

      {!esEncargado && user.deuda > 0 && (

        <Alert type="warning">

          Tienes una penalidad pendiente de{' '}

          {money(user.deuda)}

          {user.diasRetraso
            ? ' por ' +
              plural(
                user.diasRetraso,
                'día',
                'días'
              ) +
              ' de retraso'
            : ''}

          {user.prestamoDeuda
            ? ' en ' + user.prestamoDeuda
            : ''}.

          Regularízala en Tesorería para volver
          a solicitar equipos.

        </Alert>

      )}


      {!esEncargado && user.estado === 'bloqueado' && (

        <Alert type="danger">

          Tu cuenta está bloqueada. Puedes ver tu historial,
          pero no solicitar ni reservar equipos hasta regularizar.

        </Alert>

      )}


      {esEncargado && user.estado === 'pendiente' && (

        <Alert type="warning">

          Tu cuenta está pendiente de aprobación del jefe de laboratorio.
          Hasta entonces no podrás aprobar solicitudes ni registrar entregas.

        </Alert>

      )}



      <div className="account-layout">


        {/* DATOS PERSONALES */}

        <form
          className="card"
          onSubmit={guardarPerfil}
        >

          <h2 className="card-title">

            Datos personales

          </h2>


          <div className="form-grid">


            <Field label="NOMBRES">

              <input
                name="nombres"
                value={profile.nombres}
                onChange={onProfileChange}
              />

            </Field>


            <Field label="APELLIDOS">

              <input
                name="apellidos"
                value={profile.apellidos}
                onChange={onProfileChange}
              />

            </Field>


            {esEncargado ? (

              <>

                <Field
                  label="ALMACÉN ASIGNADO"
                  help="Lo cambia el jefe de laboratorio."
                >

                  <input
                    value={user.almacen || ''}
                    disabled
                  />

                </Field>


                <Field label="ANEXO TELEFÓNICO">

                  <input
                    name="anexo"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="3120"
                    value={profile.anexo}
                    onChange={onProfileChange}
                  />

                </Field>

              </>

            ) : (

              <>

                <Field label="CARRERA">

                  <select
                    name="carrera"
                    value={profile.carrera}
                    onChange={onProfileChange}
                  >

                    {CARRERAS.map((c) => (

                      <option
                        key={c}
                        value={c}
                      >

                        {c}

                      </option>

                    ))}

                  </select>

                </Field>


                <Field label="CICLO">

                  <select
                    name="ciclo"
                    value={profile.ciclo}
                    onChange={onProfileChange}
                  >

                    {CICLOS.map((c) => (

                      <option
                        key={c}
                        value={String(c)}
                      >

                        {c}.º

                      </option>

                    ))}

                  </select>

                </Field>

              </>

            )}


            <Field
              label="CORREO INSTITUCIONAL"
              help="No editable."
            >

              <input
                type="email"
                value={user.correo}
                disabled
              />

            </Field>


            {!esEncargado && (

              <Field
                label="CELULAR"
              >

                <input
                  name="celular"
                  inputMode="numeric"
                  maxLength="9"
                  placeholder="987654321"
                  value={profile.celular}
                  onChange={onProfileChange}
                />

              </Field>

            )}


          </div>


          <div className="form-actions">


            <button
              type="button"
              className="btn btn-secondary"
              onClick={descartar}
            >

              Descartar

            </button>


            <button
              type="submit"
              className="btn btn-primary"
            >

              Guardar cambios

            </button>


          </div>


        </form>



        {/* COLUMNA DERECHA */}

        <div className="account-side">


          {/* CAMBIAR CONTRASEÑA */}

          <form
            className="card"
            onSubmit={actualizarContrasena}
          >

            <h2 className="card-title">

              Cambiar contraseña

            </h2>


            <Field label="CONTRASEÑA ACTUAL">

              <input
                name="actual"
                type="password"
                placeholder="••••••••"
                value={pwd.actual}
                onChange={onPwdChange}
              />

            </Field>


            <div className="form-grid">


              <Field label="NUEVA">

                <input
                  name="nueva"
                  type="password"
                  placeholder="••••••••"
                  value={pwd.nueva}
                  onChange={onPwdChange}
                />

              </Field>


              <Field label="CONFIRMAR">

                <input
                  name="confirmar"
                  type="password"
                  placeholder="••••••••"
                  value={pwd.confirmar}
                  onChange={onPwdChange}
                />

              </Field>


            </div>


            <small className="field-help">

              {PASSWORD_RULE}

            </small>


            <button
              type="submit"
              className="btn btn-outline btn-block"
            >

              Actualizar contraseña

            </button>


          </form>



          {esEncargado ? (

            /* ESTADO DE LA CUENTA DEL ENCARGADO */

            <section className="card">

              <h2 className="card-title">

                Estado de la cuenta

              </h2>

              <dl className="details">

                <dt>Rol</dt>
                <dd>Encargado de almacén</dd>

                <dt>Almacén</dt>
                <dd>{user.almacen}</dd>

                <dt>Estado</dt>
                <dd><StatusBadge estado={user.estado} /></dd>

              </dl>

            </section>

          ) : (

            /* RESUMEN DE PRÉSTAMOS DEL ESTUDIANTE */

            <section className="card">

              <h2 className="card-title">

                Resumen de préstamos

              </h2>


              <div className="stats">


                <div className="stat">

                  <strong>
                    {user.prestamos || 0}
                  </strong>

                  <span>
                    préstamos
                  </span>

                </div>


                <div className="stat stat-danger">

                  <strong>
                    {user.retrasos || 0}
                  </strong>

                  <span>
                    retrasos
                  </span>

                </div>


                <div className="stat stat-warning">

                  <strong>
                    {money(user.deuda)}
                  </strong>

                  <span>
                    deuda
                  </span>

                </div>


              </div>

            </section>

          )}


        </div>

      </div>

    </div>

  )

}
