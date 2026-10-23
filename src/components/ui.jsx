// src/components/ui.jsx
// Componentes comunes: se definen una sola vez y se reutilizan en todas
// las pantallas (badges, modal, confirmación, estado vacío, paginación...).

import { useEffect } from 'react'
import { ESTADOS_UNIDAD, ESTADOS_USUARIO } from '../shared/constants.js'

// ---------- Etiquetas de estado ----------

const BADGE_CLASS = {
  disponible: 'badge-success',
  prestada: 'badge-info',
  mantenimiento: 'badge-warning',
  baja: 'badge-muted',
  habilitado: 'badge-success',
  con_deuda: 'badge-warning',
  bloqueado: 'badge-danger',
  pendiente: 'badge-warning',
  borrador: 'badge-muted'
}

export function StatusBadge({ estado }) {
  const label = ESTADOS_UNIDAD[estado] || ESTADOS_USUARIO[estado] || (estado === 'borrador' ? 'Borrador' : estado)
  return <span className={'badge ' + (BADGE_CLASS[estado] || 'badge-muted')}>{label}</span>
}

// ---------- Campo de formulario con error junto al campo ----------

export function Field({ label, error, help, children, className = '' }) {
  return (
    <div className={'field ' + (error ? 'field-has-error ' : '') + className}>
      {label && <label>{label}</label>}
      {children}
      {error && <span className="field-error">{error}</span>}
      {!error && help && <small className="field-help">{help}</small>}
    </div>
  )
}

// ---------- Mensaje dentro de una tarjeta ----------

export function Alert({ type = 'info', children }) {
  if (!children) return null
  return <div className={'alert alert-' + type}>{children}</div>
}

// ---------- Modal ----------

export function Modal({ title, onClose, children, footer, size = '' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal ' + size} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ---------- Confirmación de acciones destructivas ----------

export function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', busy, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="modal-text">{message}</p>
    </Modal>
  )
}

// ---------- Estado vacío ----------

export function EmptyState({ icon = '◻', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

// ---------- Paginación ----------

export function Pagination({ page, pageSize, total, onChange, noun = 'resultados' }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="pagination">
      <span>Mostrando {from} a {to} de {total} {noun}</span>
      <div className="pagination-pages">
        <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Anterior">‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={n === page ? 'active' : ''}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
        <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Siguiente">›</button>
      </div>
    </div>
  )
}

// ---------- Fotografía del equipo (o recuadro si no tiene) ----------

export function EquipmentPhoto({ equipo, size = 'sm' }) {
  const src = equipo?.fotos?.[0]
  return (
    <div className={'photo photo-' + size}>
      {src
        ? <img src={src} alt={equipo.nombre} onError={(e) => { e.currentTarget.style.display = 'none' }} />
        : <span>{size === 'xl' ? 'fotografía principal 1:1' : 'foto del equipo'}</span>}
    </div>
  )
}

export function Spinner({ text = 'Cargando…' }) {
  return <div className="loading">{text}</div>
}

// ---------- Estado de solicitud, préstamo y reserva (HU-3 a HU-6) ----------

const ESTADOS_SOLICITUD = {
  enviada: ['Enviada', 'badge-info'],
  aprobada: ['Aprobada', 'badge-success'],
  rechazada: ['Rechazada', 'badge-danger'],
  entregada: ['Entregada', 'badge-primary'],
  devuelta: ['Devuelta', 'badge-muted'],
  retirada: ['Retirada', 'badge-muted'],
  confirmada: ['Confirmada', 'badge-success'],
  en_espera: ['En espera', 'badge-warning'],
  cumplida: ['Cumplida', 'badge-muted'],
  cancelada: ['Cancelada', 'badge-muted'],
  en_pausa: ['En pausa', 'badge-muted']
}

export function RequestBadge({ estado }) {
  const [label, cls] = ESTADOS_SOLICITUD[estado] || [estado, 'badge-muted']
  return <span className={'badge ' + cls}>{label}</span>
}

// ---------- Indicador de vencimiento ----------
// dias > 0: faltan días · dias = 0: vence hoy · dias < 0: días de retraso
// Los vencidos siempre en rojo (#B4322B), con color y texto.

export function DueIndicator({ dias }) {
  if (dias < 0) return <span className="badge badge-danger">{-dias} d de retraso</span>
  if (dias === 0) return <span className="badge badge-warning">vence hoy</span>
  return <span className="badge badge-muted">vence en {dias} d</span>
}

// ---------- Tarjeta de equipo (catálogo, landing, destacados) ----------

export function EquipmentCard({ equipo, href }) {
  const libres = equipo.libres
  return (
    <a href={href} className="eq-card">
      <div className="photo eq-card-photo"><span>foto 1:1</span></div>
      <div className="eq-card-body">
        <strong className="eq-card-name">{equipo.nombre}</strong>
        <span className="cell-sub">{equipo.marca} · {equipo.modelo}</span>
        <div className="eq-card-footer">
          <span className="eq-card-cat">{equipo.categoria.toUpperCase()}</span>
          <span className={'eq-card-stock ' + (libres > 0 ? 'text-success' : 'text-danger')}>
            {libres} / {equipo.total} libres
          </span>
        </div>
      </div>
    </a>
  )
}

// ---------- Filtros activos ----------

export function ActiveFilters({ items, onRemove, onClear }) {
  if (!items.length) return null
  return (
    <div className="active-filters">
      {items.map((f) => (
        <span key={f} className="filter-chip">
          {f}
          <button type="button" aria-label={'Quitar ' + f} onClick={() => onRemove && onRemove(f)}>✕</button>
        </span>
      ))}
      <button type="button" className="btn-link" onClick={onClear}>Limpiar todo</button>
    </div>
  )
}

// ---------- Tarjeta de métrica ----------

export function StatCard({ label, value, hint, tone = '' }) {
  return (
    <div className={'card stat-card ' + (tone ? 'stat-card-' + tone : '')}>
      <span className="section-label">{label}</span>
      <strong className="stat-card-value">{value}</strong>
      {hint && <span className="cell-sub">{hint}</span>}
    </div>
  )
}
