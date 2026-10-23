// src/components/layouts.jsx
// Cabeceras, navegación y pie de página de los tres tipos de vista:
// pública (visitante), estudiante y panel del encargado.

import { useLocation } from 'react-router-dom'
import SmartLink from './SmartLink.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { shortName, dateTime } from '../shared/format.js'
import UserMenu from './UserMenu.jsx'


function Brand({ href = '/public' }) {
  return (
    <a href={href} className="brand">
      <span className="brand-square"></span>
      <span>Almacén de Equipos</span>
    </a>
  )
}


function PublicFooter() {
  const location = useLocation()

  const esLanding =
    location.pathname === '/public' ||
    location.pathname === '/public/'

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        <div className="site-footer-left">
          <strong>
            Almacén de Equipos · Facultad de Ingeniería
          </strong>

          {esLanding && (
            <span>
              Universidad de Lima · Av. Javier Prado Este 4600, Santiago de Surco
            </span>
          )}
        </div>

        <div className="site-footer-right">
          <a href="/public/reglas">Reglamento de préstamo</a>
          <span>almacen.equipos@ulima.edu.pe</span>
          <span>Anexo 3120</span>
        </div>

      </div>
    </footer>
  )
}

// ---------- VISITANTE ----------

export function PublicLayout({ children }) {

  // Si ya inició sesión, no se le ofrece entrar o registrarse de nuevo
  const { user, homePath } = useAuth()

  return (
    <div className="app-shell">

      <header className="site-header">

        <div className="site-header-inner">

          <div className="site-header-left">

            <Brand />

            <nav className="site-nav">

              <SmartLink
                href="/public"
                exact
              >
                Inicio
              </SmartLink>

              <SmartLink href="/public/reglas">
                Reglas del préstamo
              </SmartLink>

              <SmartLink href="/public/ayuda">
                Ayuda
              </SmartLink>

            </nav>

          </div>


          <div className="site-header-actions">

            {user ? (

              <>

                <span className="header-user">
                  {shortName(user)}
                </span>

                <a
                  href={homePath}
                  className="btn btn-primary"
                >
                  Ir a mi panel
                </a>

                <a href="/logout-project">
                  Salir
                </a>

              </>

            ) : (

              <>

                <SmartLink
                  href="/public/login"
                  className="btn btn-secondary"
                  activeClassName=""
                >
                  Iniciar sesión
                </SmartLink>

                <SmartLink
                  href="/public/register"
                  className="btn btn-primary"
                  activeClassName=""
                >
                  Crear cuenta
                </SmartLink>

              </>

            )}

          </div>

        </div>

      </header>


      <div className="app-content">
        {children}
      </div>


      <PublicFooter />

    </div>
  )
}


// ---------- ESTUDIANTE ----------

export function StudentLayout({ children }) {

  const { user } = useAuth()

  return (
    <div className="app-shell">

      <header className="site-header">

        <div className="site-header-inner">

          <div className="site-header-left">

            <Brand href="/student/cuenta" />

            <nav className="site-nav">

              <SmartLink href="/student/cuenta">
                Mi cuenta
              </SmartLink>

            </nav>

          </div>


          <div className="site-header-actions">

            {/* «Renzo Mendoza» + avatar con menú (Mi cuenta / Cerrar sesión),
                igual que en la cabecera del encargado */}
            <UserMenu
              label={shortName(user)}
              accountPath="/student/cuenta"
            />

          </div>

        </div>

      </header>


      <div className="app-content">
        {children}
      </div>


      <PublicFooter />

    </div>
  )
}


// ---------- SEGÚN LA SECCIÓN ----------
// Usado por las páginas de error (403/404) para mostrarse con el
// layout de la sección en la que está el usuario.

export function RoleLayout({ children }) {

  const path = window.location.pathname

  if (path.startsWith('/manager')) {
    return <ManagerLayout>{children}</ManagerLayout>
  }

  if (path.startsWith('/student')) {
    return <StudentLayout>{children}</StudentLayout>
  }

  return <PublicLayout>{children}</PublicLayout>
}


// ---------- ENCARGADO ----------

// Opciones del menú lateral. «count» muestra un contador junto a la opción.
const SIDEBAR = [

  { group: 'CUENTA' },

  {
    href: '/manager/cuenta',
    label: 'Mi cuenta'
  }

]


export function ManagerLayout({ children }) {

  const { user } = useAuth()

  return (
    <div className="app-shell">


      <header className="site-header manager-header">

        <div className="site-header-inner manager-header-inner">


          <div className="site-header-left">

            <Brand href="/manager/cuenta" />

            <span className="panel-label">
              PANEL DEL ENCARGADO
            </span>

          </div>


          <div className="site-header-actions">

            {/* «Elena Rivas · H-102» + avatar con menú (Mi cuenta / Cerrar sesión) */}
            <UserMenu
              accountPath="/manager/cuenta"
              label={
                shortName(user) +
                (user?.almacen
                  ? ' · ' + user.almacen.replace('Almacén ', '')
                  : '')
              }
            />

          </div>


        </div>

      </header>


      <div className="manager-body">


        <aside className="sidebar">

          {SIDEBAR.map((item, i) =>

            item.group ? (

              <div
                key={item.group}
                className={
                  'sidebar-group' +
                  (i > 0 ? ' sidebar-group-rule' : '')
                }
              >
                {item.group}
              </div>

            ) : (

              <SmartLink
                key={item.href}
                href={item.href}
                className="sidebar-link"
              >

                <span>
                  {item.label}
                </span>


                {item.count && (

                  <span
                    className={
                      item.tone
                        ? 'sidebar-badge sidebar-badge-' + item.tone
                        : 'sidebar-counter'
                    }
                  >
                    {item.count()}
                  </span>

                )}

              </SmartLink>

            )

          )}

        </aside>


        <main className="manager-main">

          {children}

        </main>


      </div>


      <footer className="site-footer manager-footer">

        <div className="site-footer-inner">


          <div className="site-footer-left">

            <strong>
              Almacén de Equipos · Panel del encargado
              {user?.almacen ? ' · ' + user.almacen : ''}
            </strong>

          </div>


          <div className="site-footer-right">

            <span>
              Manual del encargado
            </span>

            <span>
              Soporte: sistemas@ulima.edu.pe
            </span>

            <span>
              Última sincronización: {dateTime(new Date().toISOString())}
            </span>

          </div>


        </div>

      </footer>


    </div>
  )
}