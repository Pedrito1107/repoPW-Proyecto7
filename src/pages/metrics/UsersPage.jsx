// src/pages/metrics/UsersPage.jsx
// HU-7 · 7.3 Gestión de usuarios: listado de estudiantes con filtros por
// carrera y estado, búsqueda, paginación y bloqueo / desbloqueo con motivo.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, Pagination, EmptyState, Spinner, ActiveFilters } from '../../components/ui.jsx'
import { useMetrics } from '../../context/MetricsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { CARRERAS, ESTADOS_USUARIO } from '../../shared/constants.js'
import { money, shortCarrera, plural } from '../../shared/format.js'
import { BlockModal } from './BlockModal.jsx'

const ESTADOS_ESTUDIANTE = ['habilitado', 'con_deuda', 'bloqueado']

export default function UsersPage() {
  const { listEstudiantes, bloquearCuenta, desbloquearCuenta, version } = useMetrics()
  const toast = useToast()
  const [filtros, setFiltros] = useState({ carrera: '', estado: '', q: '' })
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let vigente = true
    listEstudiantes({ ...filtros, page }).then((d) => { if (vigente) setData(d) })
    return () => { vigente = false }
  }, [filtros, page, version, listEstudiantes])

  function setFiltro(name, value) {
    setFiltros((f) => ({ ...f, [name]: value }))
    setPage(1)
  }

  async function onConfirm(datos) {
    const { usuario, desbloquear } = modal
    if (desbloquear) {
      const r = await desbloquearCuenta(usuario.id, datos)
      toast.success('Cuenta de ' + usuario.nombre + ' desbloqueada. Su estado ahora es «' + r.estadoLabel + '».')
    } else {
      await bloquearCuenta(usuario.id, datos)
      toast.success('Cuenta de ' + usuario.nombre + ' bloqueada. El motivo quedó registrado en su historial.')
    }
    setModal(null)
  }

  // Chips de filtros activos
  const activos = [
    filtros.carrera && 'Carrera: ' + filtros.carrera,
    filtros.estado && 'Estado: ' + ESTADOS_USUARIO[filtros.estado],
    filtros.q && 'Búsqueda: ' + filtros.q
  ].filter(Boolean)

  function quitarFiltro(chip) {
    if (chip.startsWith('Carrera')) setFiltro('carrera', '')
    else if (chip.startsWith('Estado')) setFiltro('estado', '')
    else setFiltro('q', '')
  }

  const r = data?.resumen

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de usuarios</h1>
          <p className="page-subtitle">
            {r
              ? plural(r.total, 'estudiante', 'estudiantes') + ' · ' + r.conDeuda + ' con deuda · ' +
                plural(r.bloqueados, 'bloqueado', 'bloqueados')
              : 'Cargando…'}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <label className="toolbar-select">
          <span>Carrera:</span>
          <select value={filtros.carrera} onChange={(e) => setFiltro('carrera', e.target.value)}>
            <option value="">todas</option>
            {CARRERAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="toolbar-select">
          <span>Estado:</span>
          <select value={filtros.estado} onChange={(e) => setFiltro('estado', e.target.value)}>
            <option value="">todos</option>
            {ESTADOS_ESTUDIANTE.map((k) => <option key={k} value={k}>{ESTADOS_USUARIO[k]}</option>)}
          </select>
        </label>
        <div className="toolbar-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Buscar por nombre, código o correo"
            aria-label="Buscar por nombre, código o correo"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
          />
        </div>
      </div>

      <ActiveFilters
        items={activos}
        onRemove={quitarFiltro}
        onClear={() => { setFiltros({ carrera: '', estado: '', q: '' }); setPage(1) }}
      />

      <div className="card card-flush">
        {!data ? <Spinner /> : data.total === 0 ? (
          <EmptyState
            title="No encontramos estudiantes"
            text="Ningún estudiante coincide con los filtros o la búsqueda."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => { setFiltros({ carrera: '', estado: '', q: '' }); setPage(1) }}>
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>USUARIO</th>
                    <th>CARRERA</th>
                    <th className="num">PRÉSTAMOS</th>
                    <th className="num">RETRASOS</th>
                    <th>DEUDA</th>
                    <th>ESTADO</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Link to={'/manager/usuarios/' + u.id} className="cell-title">{u.nombre}</Link>
                        <div className="cell-sub mono">{u.codigo}</div>
                      </td>
                      <td>{shortCarrera(u.carrera)}</td>
                      <td className="num mono">{u.prestamos}</td>
                      <td className={'num mono ' + (u.retrasos ? 'text-danger' : '')}>{u.retrasos}</td>
                      <td className={u.deuda ? 'strong' : 'text-muted'}>{u.deuda ? money(u.deuda) : '—'}</td>
                      <td><StatusBadge estado={u.estado} /></td>
                      <td className="actions">
                        {u.estado === 'habilitado' && <Link to={'/manager/usuarios/' + u.id}>Ver historial</Link>}
                        {u.estado === 'con_deuda' && (
                          <button type="button" className="btn-link danger" onClick={() => setModal({ usuario: u })}>Bloquear cuenta</button>
                        )}
                        {u.estado === 'bloqueado' && (
                          <button type="button" className="btn-link" onClick={() => setModal({ usuario: u, desbloquear: true })}>Desbloquear</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} noun="usuarios" onChange={setPage} />
          </>
        )}
      </div>

      {modal && (
        <BlockModal
          usuario={modal.usuario.nombre}
          desbloquear={modal.desbloquear}
          onClose={() => setModal(null)}
          onConfirm={onConfirm}
        />
      )}
    </div>
  )
}
