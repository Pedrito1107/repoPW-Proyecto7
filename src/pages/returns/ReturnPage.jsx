// src/pages/returns/ReturnPage.jsx
// HU-5 · 5.1 Registro de devolución · 5.2 Daños o faltantes
// Solo diseño y navegación: muestra el préstamo vigente del código de la URL
// (por defecto PRE-2026-0291, el caso del mockup). El estado de retorno
// muestra u oculta la sección de daños (5.2); todavía no se registra nada.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Field, EmptyState } from '../../components/ui.jsx'
import { money, plural } from '../../shared/format.js'
import { buscarPrestamo, equipoDe, unidadesDe } from '../../services/loansService.js'
import { listarReservasAlmacen } from '../../services/reservationsService.js'
import { devolucionEnCurso } from '../../services/returnsService.js'

// Devolución en curso del mockup 5.1 / 5.2 y reservas del almacén (seed)
const CASO_MOCKUP = devolucionEnCurso()
const RESERVAS_ALMACEN = listarReservasAlmacen()

export default function ReturnPage() {
  const { codigo = CASO_MOCKUP.codigo } = useParams()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState(codigo)
  const prestamo = buscarPrestamo(codigo)

  function buscar() {
    const valor = busqueda.trim().toUpperCase()
    if (valor) navigate('/manager/devoluciones/' + valor)
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/prestamos">Préstamos vigentes</Link> / Registrar devolución
      </div>
      <h1 className="page-title">Registrar devolución</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="return-search">
          <Field label="BUSCAR PRÉSTAMO">
            <input
              className="mono"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') buscar() }}
            />
          </Field>
          <button type="button" className="btn btn-secondary" onClick={buscar}>Buscar</button>
        </div>
      </div>

      {prestamo
        // key: al buscar otro código el formulario empieza de nuevo
        ? <ReturnForm key={prestamo.codigo} prestamo={prestamo} />
        : (
          <div className="card">
            <EmptyState
              title="No encontramos un préstamo vigente con ese código"
              text={'Revisa el código ' + codigo + ' en la lista de préstamos vigentes.'}
              action={<Link to="/manager/prestamos" className="btn btn-primary">Ver préstamos vigentes</Link>}
            />
          </div>
        )}
    </div>
  )
}

function ReturnForm({ prestamo }) {
  const navigate = useNavigate()
  const equipo = equipoDe(prestamo.equipoId)
  const esCasoMockup = prestamo.codigo === CASO_MOCKUP.codigo
  const faltantes = esCasoMockup ? CASO_MOCKUP.faltantes : []
  const [estado, setEstado] = useState(esCasoMockup ? 'faltantes' : 'sin_novedades')

  // NUEVO: guardamos en React qué accesorios fueron devueltos.
  // En esta primera entrega NO se guarda en base de datos; solo sirve para que
  // la interfaz cambie visualmente cuando el encargado marca o desmarca un accesorio.
  const [accesoriosDevueltos, setAccesoriosDevueltos] = useState(() => {
    const inicial = {}

    equipo.accesorios.forEach((nombre) => {
      // El caso del mockup inicia con Cable USB como faltante.
      inicial[nombre] = !faltantes.includes(nombre)
    })

    return inicial
  })

  // NUEVO: cambia únicamente el estado visual del accesorio seleccionado.
  // Si queda desmarcado se mostrará "faltante" y la fila se resaltará en rojo.
  function cambiarAccesorio(nombre) {
    setAccesoriosDevueltos((actuales) => ({
      ...actuales,
      [nombre]: !actuales[nombre],
    }))
  }

  const retraso = Math.max(0, -prestamo.dias)
  const penalidadDia = equipo.condiciones.penalidadDia
  const libres = unidadesDe(prestamo.equipoId).filter((u) => u.estado === 'disponible').length
  const reserva = RESERVAS_ALMACEN.find((r) => r.equipo === equipo.nombre && r.estado === 'confirmada')

  function guardar(e) {
    e.preventDefault()
    // Pendiente (funcionamiento): registrar devolución, penalidad y estado de la unidad
    navigate('/manager/prestamos')
  }

  return (
    <form onSubmit={guardar}>
      <div className="card">
        <dl className="receipt-grid" style={{ marginTop: 0 }}>
          <div><dt className="section-label">CÓDIGO DE PRÉSTAMO</dt><dd className="mono" style={{ margin: 0 }}>{prestamo.codigo}</dd></div>
          <div><dt className="section-label">ESTUDIANTE</dt><dd style={{ margin: 0 }}>{prestamo.estudiante}</dd></div>
          <div><dt className="section-label">EQUIPO Y UNIDAD</dt><dd style={{ margin: 0 }}>{prestamo.equipo} · <span className="mono">{prestamo.unidad}</span></dd></div>
          <div><dt className="section-label">DEVOLUCIÓN PACTADA</dt><dd className="mono" style={{ margin: 0 }}>{prestamo.vence}</dd></div>
          <div><dt className="section-label">RETORNO REAL</dt><dd className="mono" style={{ margin: 0 }}>14/09/2026</dd></div>
        </dl>

        <span className="section-label">VERIFICACIÓN DE ACCESORIOS</span>
        {equipo.accesorios.map((nombre) => {
          // NUEVO: "falta" ya no depende solo del dato fijo del mockup.
          // Ahora depende del checkbox actual que el encargado marque o desmarque.
          const devuelto = accesoriosDevueltos[nombre]
          const falta = !devuelto

          return (
            <label
              key={nombre}
              className="check-row"
              // NUEVO: si el accesorio está faltante resaltamos la fila en rojo.
              style={falta
                ? {
                    border: '1px solid #B4322B',
                    background: '#FCEDEC',
                    color: '#B4322B',
                  }
                : undefined}
            >
              <input
                type="checkbox"
                checked={devuelto}
                onChange={() => cambiarAccesorio(nombre)}
              />
              <span>{nombre}</span>

              {/* NUEVO: aparece automáticamente cuando el accesorio queda desmarcado. */}
              {falta && (
                <small className="text-danger" style={{ marginLeft: 'auto' }}>
                  faltante
                </small>
              )}
            </label>
          )
        })}

        <span className="section-label">ESTADO DE RETORNO</span>
        <div className="radio-group">
          {[['sin_novedades', 'Sin novedades'], ['danos', 'Con daños'], ['faltantes', 'Faltantes']].map(([v, l]) => (
            <label key={v} className="radio">
              <input type="radio" name="estado" checked={estado === v} onChange={() => setEstado(v)} /> {l}
            </label>
          ))}
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field label="FECHA DE RETORNO"><input type="date" defaultValue="2026-09-14" /></Field>
        </div>

        {retraso > 0 ? (
          <div className="penalty-box">
            <strong>{plural(retraso, 'día', 'días')} de retraso.</strong> Penalidad calculada:{' '}
            {money(retraso * penalidadDia)} ({money(penalidadDia)} por día). La cuenta quedará bloqueada hasta regularizar.
          </div>
        ) : (
          <div className="alert alert-success" style={{ marginTop: 8 }}>
            Devolución a tiempo · 0 días de retraso. Sin penalidad. La unidad{' '}
            <span className="mono">{prestamo.unidad}</span> vuelve al estado «Disponible».
          </div>
        )}

        {estado === 'sin_novedades' && (
          <div className="form-actions">
            <Link to="/manager/prestamos" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary">Registrar devolución</button>
          </div>
        )}
      </div>

      {/* 5.2 · Paso siguiente cuando el retorno no es «sin novedades» */}
      {estado !== 'sin_novedades' && (
        <div className="card">
          <h2 className="card-title">Registrar daños o faltantes</h2>
          <Field label="DESCRIPCIÓN DEL DAÑO">
            <textarea
              rows="3"
              defaultValue={esCasoMockup ? CASO_MOCKUP.descripcion : ''}
              placeholder="Describe el daño o lo que falta"
            />
          </Field>

          <span className="section-label">ACCESORIOS FALTANTES</span>
          {equipo.accesorios.map((nombre) => {
            // NUEVO: esta sección usa el mismo estado visual de 5.1.
            // Así, lo que se desmarcó arriba aparece marcado aquí como faltante.
            const falta = !accesoriosDevueltos[nombre]

            return (
              <label key={nombre} className="check-row">
                <input type="checkbox" checked={falta} readOnly /> {nombre}
              </label>
            )
          })}

          <span className="section-label">FOTOGRAFÍA DEL DAÑO</span>
          <div className="photo photo-md" style={{ marginBottom: 16 }}><span>fotografía del daño</span></div>

          <label className="switch-row"><input type="checkbox" defaultChecked /> Derivar la unidad a mantenimiento</label>

          <div className="alert alert-warning">
            <strong>Efecto sobre el inventario.</strong> La unidad <span className="mono">{prestamo.unidad}</span> pasará
            a «En mantenimiento» en lugar de volver a «Disponible»; el equipo seguirá con{' '}
            {plural(libres, 'unidad libre', 'unidades libres')}.
            {reserva && <> Hay 1 reserva del {reserva.rango} ({reserva.estudiante}) que deberá reasignarse.</>}
          </div>

          <div className="form-actions">
            <Link to="/manager/prestamos" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary">Guardar y cerrar devolución</button>
          </div>
        </div>
      )}
    </form>
  )
}
