// src/pages/errors/NotFoundPage.jsx  (HU-1 · 1.7 Página no encontrada 404)
import { RoleLayout } from '../../components/layouts.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Solo el contenido: se usa dentro de una vista que ya tiene su layout
export function NotFoundContent({ message }) {
  const { homePath } = useAuth()
  return (
    <div className="error-page">
      <div className="error-icon">?</div>
      <span className="error-code">ERROR 404 · PÁGINA NO ENCONTRADA</span>
      <h1>No encontramos esta página</h1>
      <p>{message || 'El enlace pudo cambiar o la ficha del equipo ya no está publicada en el catálogo.'}</p>
      <div className="error-actions">
        <a href={homePath} className="btn btn-primary">Ir al inicio</a>
        <a href="/public/catalogo" className="btn btn-secondary">Buscar un equipo</a>
      </div>
    </div>
  )
}

export default function NotFoundPage({ message }) {
  return (
    <RoleLayout>
      <NotFoundContent message={message} />
    </RoleLayout>
  )
}
