// src/components/layouts.jsx
// Cabeceras, navegación y pie de página de los tres tipos de vista:
// pública (visitante), estudiante y panel del encargado.

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SmartLink from './SmartLink.jsx'
import { useInventoryOptional } from '../context/InventoryContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { shortName, dateTime } from '../shared/format.js'
import UserMenu from './UserMenu.jsx'
import { listarBandeja, listarPrestamosVigentes } from '../services/loansService.js'

// Datos del seed para los contadores del menú del encargado
const BANDEJA = listarBandeja()
const PRESTAMOS = listarPrestamosVigentes()


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

  const location = useLocation()

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

              {/* la ficha de un equipo también pertenece al catálogo */}
              <SmartLink
                href="/public/catalogo"
                className={location.pathname.startsWith('/public/equipos') ? 'active' : ''}
              >
                Catálogo
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

            <Brand href="/student/catalogo" />

            <nav className="site-nav">

              <SmartLink href="/student/catalogo">
                Catálogo
              </SmartLink>

              <SmartLink href="/student/solicitudes">
                Mis solicitudes
              </SmartLink>

            </nav>

          </div>


          <div className="site-header-actions">

            <input
              className="header-search"
              type="search"
              placeholder="⌕ Buscar equipo o código de inventario"
              aria-label="Buscar equipo"
            />

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

// Contadores del menú. «tone» pinta el contador como etiqueta de color:
// info (azul) = hay solicitudes por atender · danger (rojo) = hay vencidos.
// Los datos salen del seed a través de los servicios de cada historia.
const SOLICITUDES_PENDIENTES =
  BANDEJA.filter((s) => s.estado === 'enviada').length

const PRESTAMOS_VENCIDOS =
  PRESTAMOS.filter((p) => p.dias < 0).length

const SIDEBAR = [

  { group: 'OPERACIÓN' },

  {
    href: '/manager/inventario',
    label: 'Inventario',
    count: (inv) => (inv ? inv.totales.total : '—')
  },

  {
    href: '/manager/solicitudes',
    label: 'Solicitudes',
    count: () => SOLICITUDES_PENDIENTES,
    tone: 'info'
  },

  {
    href: '/manager/prestamos',
    label: 'Préstamos vigentes',
    count: () => PRESTAMOS.length
  },

  {
    href: '/manager/vencidos',
    label: 'Vencidos',
    count: () => PRESTAMOS_VENCIDOS,
    tone: 'danger'
  }

]


export function ManagerLayout({ children }) {

  const { user } = useAuth()

  const inventory = useInventoryOptional()

  const navigate = useNavigate()

  const [codigo, setCodigo] = useState('')


  function buscar(e) {

    e.preventDefault()

    const value =
      codigo.trim().toUpperCase()

    if (!value) return


    const target =
      '/manager/inventario?codigo=' +
      encodeURIComponent(value)


    if (
      window.location.pathname.startsWith('/manager')
    ) {

      navigate(target)

    } else {

      window.location.href = target

    }


    setCodigo('')

  }


  return (
    <div className="app-shell">


      <header className="site-header manager-header">

        <div className="site-header-inner manager-header-inner">


          <div className="site-header-left">

            <Brand href="/manager/inventario" />

            <span className="panel-label">
              PANEL DEL ENCARGADO
            </span>

          </div>


          <form
            className="manager-search"
            onSubmit={buscar}
            role="search"
          >

            <span aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value)
              }
              placeholder="Buscar por código de inventario: INV-OSC-0042"
              aria-label="Buscar por código de inventario"
            />

          </form>


          <div className="site-header-actions">

            {/* Solicitudes por atender, siempre visible (mockup 2.1) */}
            <SmartLink
              href="/manager/solicitudes"
              className="header-pending"
              activeClassName=""
            >
              Solicitudes pendientes
              <span className="header-pending-count">
                {SOLICITUDES_PENDIENTES}
              </span>
            </SmartLink>

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
                    {item.count(inventory)}
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