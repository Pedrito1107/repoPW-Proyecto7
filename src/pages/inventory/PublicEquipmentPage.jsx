// src/pages/inventory/PublicEquipmentPage.jsx  (HU-2 · 2.6 Ficha pública del equipo)
// Es la ficha que ve el visitante y el estudiante. HU-3 la reutiliza en su detalle.
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useInventory } from '../../context/InventoryContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { today } from '../../shared/format.js'
import { EquipmentPhoto, Spinner } from '../../components/ui.jsx'
import { CondicionesFicha } from '../../components/conditions.jsx'
import { ESTADOS_UNIDAD } from '../../shared/constants.js'
import { NotFoundContent } from '../errors/NotFoundPage.jsx'

export default function PublicEquipmentPage() {
  const { id } = useParams()
  const { getFichaPublica } = useInventory()
  const { user } = useAuth()
  const [equipo, setEquipo] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getFichaPublica(id).then(setEquipo).catch(() => setNotFound(true))
  }, [getFichaPublica, id])

  if (notFound) return <NotFoundContent />
  if (!equipo) return <div className="page"><Spinner /></div>

  const disponibles = equipo.unidades.filter((u) => u.estado === 'disponible').length

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/public">Inicio</a> / {equipo.categoria} / {equipo.nombre}
      </div>

      <div className="ficha">
        <div>
          <EquipmentPhoto equipo={equipo} size="xl" />

          <div className="ficha-thumbs">
            {equipo.fotos.length > 0
              ? equipo.fotos.map((url, i) => (
                  <div key={url} className={'photo' + (i === 0 ? ' sel' : '')}><img src={url} alt={equipo.nombre} /></div>
                ))
              : [0, 1, 2].map((i) => <div key={i} className={'photo' + (i === 0 ? ' sel' : '')}></div>)}
          </div>
        </div>

        <div className="card ficha-info">
          <h1 className="page-title">{equipo.nombre}</h1>
          <p className="page-subtitle">{equipo.marca} · {equipo.modelo} · <strong>{equipo.categoria}</strong></p>
          <p className="ficha-description">{equipo.descripcion}</p>

          <span className="section-label">ACCESORIOS INCLUIDOS</span>
          {equipo.accesorios.length ? (
            <div className="chips">
              {equipo.accesorios.map((a) => <span key={a} className="chip">{a}</span>)}
            </div>
          ) : <p className="text-muted">No incluye accesorios.</p>}

          <div className="ficha-conditions">
            <strong>Condiciones del préstamo</strong>
            <CondicionesFicha c={equipo.condiciones} />
          </div>
        </div>

        <aside className="card availability">
          <span className="section-label">DISPONIBILIDAD ACTUAL</span>
          <div className="availability-number">
            <span className={disponibles ? 'text-success' : 'text-danger'}>{disponibles} de {equipo.unidades.length}</span>
          </div>
          <p className="availability-note">unidades libres hoy, {today()}</p>

          <ul className="unit-list">
            {equipo.unidades.map((u) => (
              <li key={u.id} className={u.estado === 'disponible' ? 'on' : ''}>
                <span className="unit-code-line">{u.codigo}</span>
                <span className={'unit-status ' + u.estado}>{ESTADOS_UNIDAD[u.estado]}</span>
              </li>
            ))}
          </ul>

          {user?.rol === 'encargado' && (
            <a href={'/manager/inventario/' + equipo.id} className="btn btn-secondary btn-block">Gestionar en inventario</a>
          )}
          <p className="availability-pickup">Recojo en <strong>{equipo.almacen}</strong>, lunes a viernes de 08:00 a 19:00.</p>
        </aside>
      </div>
    </div>
  )
}
