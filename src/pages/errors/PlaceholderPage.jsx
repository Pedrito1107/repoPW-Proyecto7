// src/pages/errors/PlaceholderPage.jsx
// Marca el lugar de las vistas que pertenecen a otras historias, para que
// la navegación funcione mientras cada integrante integra la suya.
import { EmptyState } from '../../components/ui.jsx'

export default function PlaceholderPage({ title, story }) {
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
      <div className="card">
        <EmptyState
          icon="▤"
          title="Vista en construcción"
          text={'Esta sección corresponde a la ' + story + ' y la integrará el integrante responsable.'}
        />
      </div>
    </div>
  )
}
