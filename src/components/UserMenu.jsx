// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from '../shared/format.js'

export default function UserMenu({ label, accountPath }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-menu-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="user-menu-name">{label}</span>
        <span className="avatar">{initials(user)}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-email">{user.correo}</div>
          <a href={accountPath}>Mi cuenta</a>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}
