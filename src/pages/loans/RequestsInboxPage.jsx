// src/pages/loans/RequestsInboxPage.jsx
// HU-4 · 4.1 Bandeja de solicitudes (con aviso de deuda 5.5)
// Solo diseño y navegación: los filtros y contadores son de ejemplo;
// los modales se abren y cierran, pero aún no cambian el estado.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RequestBadge, Pagination } from '../../components/ui.jsx'
import { CATEGORIAS } from '../../shared/constants.js'
import { listarBandeja } from '../../services/loansService.js'
import { ApproveModal, RejectModal, RejectionReasonModal } from './RequestModals.jsx'

// Solicitudes del seed (HU-3 / HU-4)
const BANDEJA = listarBandeja()

const contar = (estado) => BANDEJA.filter((s) => s.estado === estado).length

export default function RequestsInboxPage() {
  const [aprobar, setAprobar] = useState(null)
  const [rechazar, setRechazar] = useState(null)
  const [verMotivo, setVerMotivo] = useState(null)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de solicitudes</h1>
          <p className="page-subtitle">{BANDEJA.length} solicitudes · Almacén H-102</p>
        </div>

        <div className="counter-tabs">
          <button type="button" className="counter-tab active">Enviadas <strong>{contar('enviada')}</strong></button>
          <button type="button" className="counter-tab">Aprobadas <strong>{contar('aprobada')}</strong></button>
          <button type="button" className="counter-tab">Rechazadas <strong>{contar('rechazada')}</strong></button>
        </div>
      </div>

      <div className="alert alert-danger">
        <strong>Aviso de deuda pendiente.</strong> 2 solicitantes de esta bandeja tienen penalidades sin regularizar
        por <strong>S/ 105.00</strong> en total. Sus filas están marcadas con el indicador de deuda.
      </div>

      {/* Filtros con la etiqueta dentro de la caja, como en el mockup 4.1 */}
      <div className="toolbar inbox-toolbar">
        <label className="toolbar-box">
          <span>Estado:</span>
          <select defaultValue="enviadas">
            <option value="enviadas">enviadas</option>
            <option value="aprobadas">aprobadas</option>
            <option value="rechazadas">rechazadas</option>
          </select>
        </label>
        <label className="toolbar-box">
          <span>Categoría:</span>
          <select defaultValue="">
            <option value="">todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="toolbar-box">
          <span>Fecha:</span>
          <input type="date" />
        </label>
        <div className="toolbar-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Buscar por estudiante, curso o equipo" />
        </div>
      </div>

      <div className="card card-flush">
        <div className="table-wrap">
          <table className="table table-inbox">
            <thead>
              <tr>
                <th>SOLICITANTE</th>
                <th>EQUIPO</th>
                <th>FECHAS</th>
                <th>MOTIVO</th>
                <th>ANTIGÜEDAD</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {BANDEJA.map((s) => (
                <tr key={s.id} className={s.deuda ? 'row-highlight' : ''}>
                  <td>
                    <span className="strong">{s.estudiante}</span>
                    {s.deuda
                      ? <div className="debt-flag">Deuda {s.deuda}</div>
                      : <div className="cell-sub">{s.carrera}</div>}
                  </td>
                  <td>{s.equipo}</td>
                  <td className="mono nowrap">{s.fechas}</td>
                  <td className="inbox-motivo" title={s.motivo}>{s.motivo}</td>
                  <td className="mono nowrap">{s.antiguedad}</td>
                  <td><RequestBadge estado={s.estado} /></td>
                  <td className="actions">
                    {s.estado === 'enviada' && (
                      <>
                        <button type="button" className="btn-approve" onClick={() => setAprobar(s)}>Aprobar</button>
                        <button type="button" className="btn-reject" onClick={() => setRechazar(s)}>Rechazar</button>
                      </>
                    )}
                    {s.estado === 'aprobada' && (
                      <Link to={'/manager/solicitudes/' + s.id + '/entrega'}>Registrar entrega</Link>
                    )}
                    {s.estado === 'rechazada' && (
                      <button type="button" className="btn-link" onClick={() => setVerMotivo(s)}>Ver motivo</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={1} pageSize={10} total={BANDEJA.length} noun="solicitudes" onChange={() => {}} />
      </div>

      {aprobar && <ApproveModal solicitud={aprobar} onClose={() => setAprobar(null)} />}
      {rechazar && <RejectModal solicitud={rechazar} onClose={() => setRechazar(null)} />}
      {verMotivo && <RejectionReasonModal solicitud={verMotivo} onClose={() => setVerMotivo(null)} />}
    </div>
  )
}
