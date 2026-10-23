// src/components/SmartLink.jsx
// Cada sección (/public, /student, /manager) es una app React distinta
// servida por Express. Este enlace navega sin recargar cuando el destino
// pertenece a la misma app, y con recarga completa cuando cambia de app.

import { useNavigate, useLocation } from 'react-router-dom'

function sameApp(href) {
  return window.location.pathname.split('/')[1] === href.split('/')[1]
}

export default function SmartLink({ href, className = '', activeClassName = 'active', exact = false, children, ...rest }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  function onClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return
    if (sameApp(href)) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <a href={href} className={(className + ' ' + (isActive ? activeClassName : '')).trim()} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}
