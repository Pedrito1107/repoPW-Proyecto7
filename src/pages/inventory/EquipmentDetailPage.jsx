// src/pages/inventory/EquipmentDetailPage.jsx
// HU-2 · 2.3 Unidades del equipo · 2.5 Condiciones · historial de estados
import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useInventory } from '../../context/InventoryContext.jsx'
import { plural, dateTime } from '../../shared/format.js'
import { StatusBadge, EmptyState, Spinner, EquipmentPhoto } from '../../components/ui.jsx'
import { NotFoundContent } from '../errors/NotFoundPage.jsx'
import { UnitFormModal, UnitStateModal } from './UnitModals.jsx'
import ConditionsForm from './ConditionsForm.jsx'

const TABS = [
  ['unidades', 'Unidades'],
  ['condiciones', 'Condiciones del préstamo'],
  ['historial', 'Historial']
]

export default function EquipmentDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { getEquipo } = useInventory()

  const [equipo, setEquipo] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [modal, setModal] = useState(null) // { type: 'nueva' | 'editar' | 'estado', unidad }

  const tab = params.get('tab') || 'unidades'
  const resaltada = params.get('unidad')

  const cargar = useCallback(() => {
    return getEquipo(id).then(setEquipo).catch(() => setNotFound(true))
  }, [getEquipo, id])

  useEffect(() => { cargar() }, [cargar])

  function cerrarYRecargar() {
    setModal(null)
    cargar()
  }

  if (notFound) return <NotFoundContent message="El equipo no existe o fue eliminado del inventario." />
  if (!equipo) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/inventario">Inventario</Link>
        {equipo.categoria && <> / <Link to={'/manager/inventario?categoria=' + encodeURIComponent(equipo.categoria)}>{equipo.categoria}</Link></>}
        {' / '}{equipo.nombre}
      </div>

      <div className="page-header">
        <div className="page-header-main">
          <EquipmentPhoto equipo={equipo} size="md" />
          <div>
            <h1 className="page-title">
              {equipo.nombre} {equipo.borrador && <StatusBadge estado="borrador" />}
            </h1>
            <p className="page-subtitle">
              {[equipo.marca, equipo.modelo].filter(Boolean).join(' · ')} · {plural(equipo.resumen.total, 'unidad registrada', 'unidades registradas')} · {equipo.almacen}
            </p>
          </div>
        </div>
        <div className="page-header-actions">
          <Link to={'/manager/inventario/' + equipo.id + '/editar'} className="btn btn-secondary">Editar equipo</Link>
          <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'nueva' })}>Nueva unidad</button>
        </div>
      </div>

      {equipo.borrador && (
        <div className="alert alert-warning">
          Este equipo es un <strong>borrador</strong>: no aparece en el catálogo. Edítalo y usa «Guardar equipo» para publicarlo.
        </div>
      )}

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={'tab' + (tab === key ? ' active' : '')}
            onClick={() => setParams(key === 'unidades' ? {} : { tab: key })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={tab === 'condiciones' ? '' : 'card card-flush'}>
        {tab === 'unidades' && (
          equipo.unidades.length === 0 ? (
            <EmptyState
              icon="+"
              title="Este equipo aún no tiene unidades"
              text="Registra al menos una unidad con su código de inventario para que aparezca en el catálogo."
              action={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'nueva' })}>Registrar unidad</button>}
            />
          ) : (
            <div className="table-wrap">
              <table className="table table-units">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>UBICACIÓN</th>
                    <th>ESTADO</th>
                    <th>OBSERVACIONES</th>
                    <th>PRÉSTAMO VIGENTE</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {equipo.unidades.map((u) => (
                    <tr key={u.id} className={resaltada === u.codigo ? 'row-highlight' : ''}>
                      <td className="unit-code">{u.codigo}</td>
                      <td className="cell-muted">{u.ubicacion}</td>
                      <td><StatusBadge estado={u.estado} /></td>
                      <td className="cell-muted">{u.observaciones || '—'}</td>
                      <td className={u.prestamoVigente ? 'unit-loan' : 'cell-muted'}>{u.prestamoVigente || '—'}</td>
                      <td className="actions">
                        <button type="button" className="btn-link" onClick={() => setModal({ type: 'editar', unidad: u })}>Editar</button>
                        <span className="sep">·</span>
                        <button type="button" className="btn-link" onClick={() => setModal({ type: 'estado', unidad: u })}>Cambiar estado</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'condiciones' && (
          <ConditionsForm key={JSON.stringify(equipo.condiciones)} equipo={equipo} onSaved={cargar} />
        )}

        {tab === 'historial' && (
          equipo.historial.length === 0 ? (
            <EmptyState icon="▤" title="Sin cambios de estado registrados"
              text="Cada vez que una unidad cambie de estado, el motivo quedará registrado aquí." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>FECHA</th><th>UNIDAD</th><th>CAMBIO</th><th>MOTIVO</th><th>REGISTRADO POR</th></tr>
                </thead>
                <tbody>
                  {equipo.historial.map((h) => (
                    <tr key={h.id}>
                      <td className="mono">{dateTime(h.fecha)}</td>
                      <td className="mono strong">{h.codigo}</td>
                      <td className="nowrap">
                        <StatusBadge estado={h.desde} /> → <StatusBadge estado={h.hacia} />
                      </td>
                      <td>{h.motivo}</td>
                      <td>{h.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {modal?.type === 'nueva' && <UnitFormModal equipo={equipo} onClose={() => setModal(null)} onSaved={cerrarYRecargar} />}
      {modal?.type === 'editar' && <UnitFormModal equipo={equipo} unidad={modal.unidad} onClose={() => setModal(null)} onSaved={cerrarYRecargar} />}
      {modal?.type === 'estado' && <UnitStateModal unidad={modal.unidad} equipoNombre={equipo.nombre} onClose={() => setModal(null)} onSaved={cerrarYRecargar} />}

    </div>
  )
}
