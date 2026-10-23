// src/pages/errors/AccessDeniedPage.jsx  (HU-1 · 1.7 Acceso denegado 403)
import { RoleLayout } from '../../components/layouts.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AccessDeniedPage() {
  const { user, homePath } = useAuth()
  const esEstudiante = user?.rol === 'estudiante'

  return (
    <RoleLayout>
      <div className="error-page">
        <div className="error-icon error-icon-danger">!</div>
        <span className="error-code">ERROR 403 · ACCESO DENEGADO</span>
        <h1>No tienes permiso para ver esta página</h1>
        <p>
          {esEstudiante
            ? 'Esta sección pertenece al panel del encargado de almacén. '
            : 'Esta sección pertenece a la vista del estudiante. '}
          Si crees que es un error, escribe a almacen.equipos@ulima.edu.pe
          {esEstudiante ? ' indicando tu código de estudiante.' : '.'}
        </p>
        <div className="error-actions">
          <a href={homePath} className="btn btn-primary">Ir a mi panel</a>
        </div>
      </div>
    </RoleLayout>
  )
}
