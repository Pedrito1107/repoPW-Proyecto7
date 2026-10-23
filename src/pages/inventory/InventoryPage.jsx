// src/pages/inventory/InventoryPage.jsx
// HU-2 · 2.1 Inventario de equipos

import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInventory } from '../../context/InventoryContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { CATEGORIAS, ESTADOS_UNIDAD } from '../../shared/constants.js'
import { plural } from '../../shared/format.js'
import {
  EmptyState,
  Pagination,
  EquipmentPhoto,
  StatusBadge,
  Spinner
} from '../../components/ui.jsx'

const PAGE_SIZE = 8


// "3 libres · 1 prestada · 1 mant." — cada estado con su color y en fuente mono
// (libres = verde · prestadas = azul · mant. = ámbar · de baja = gris)
function ResumenUnidades({ r }) {

  const partes = []

  if (r.disponible) {
    partes.push([
      'est-libre',
      r.disponible + (r.disponible === 1 ? ' libre' : ' libres')
    ])
  }

  if (r.prestada) {
    partes.push([
      'est-prestada',
      r.prestada + (r.prestada === 1 ? ' prestada' : ' prestadas')
    ])
  }

  if (r.mantenimiento) {
    partes.push(['est-mant', r.mantenimiento + ' mant.'])
  }

  if (r.baja) {
    partes.push(['est-baja', r.baja + ' de baja'])
  }

  if (!partes.length) {
    return <span className="est est-baja">Sin unidades</span>
  }

  return (
    <span className="est-resumen">
      {partes.map(([clase, texto], i) => (
        <span key={clase}>
          {i > 0 && <span className="est-sep"> · </span>}
          <span className={'est ' + clase}>{texto}</span>
        </span>
      ))}
    </span>
  )
}


export default function InventoryPage() {

  const {
    equipos,
    unidades,
    loading,
    totales
  } = useInventory()

  const { user } = useAuth()

  const [params, setParams] = useSearchParams()


  // -------------------------
  // FILTROS
  // -------------------------

  const categoria =
    params.get('categoria') || ''

  const estado =
    params.get('estado') || ''

  const codigo =
    (params.get('codigo') || '')
      .trim()
      .toUpperCase()

  const pageParam =
    Number(params.get('page')) || 1


  function setFiltro(name, value) {

    const next =
      new URLSearchParams(params)

    if (value) {
      next.set(name, value)
    } else {
      next.delete(name)
    }

    if (name !== 'page') {
      next.delete('page')
    }

    setParams(next)
  }


  const [codigoInput, setCodigoInput] =
    useState(codigo)


  useEffect(() => {

    setCodigoInput(codigo)

  }, [codigo])


  // -------------------------
  // EQUIPOS FILTRADOS
  // -------------------------

  const filtrados = useMemo(() => {

    return equipos.filter((e) => {

      if (
        categoria &&
        e.categoria !== categoria
      ) {
        return false
      }


      if (estado === 'sin_unidades') {
        return e.resumen.total === 0
      }


      if (
        estado &&
        !e.resumen[estado]
      ) {
        return false
      }


      if (codigo) {

        return unidades.some(
          (u) =>
            u.equipoId === e.id &&
            u.codigo.includes(codigo)
        )

      }


      return true

    })

  }, [
    equipos,
    unidades,
    categoria,
    estado,
    codigo
  ])


  // -------------------------
  // PAGINACIÓN
  // -------------------------

  const page = Math.min(

    Math.max(
      1,
      pageParam
    ),

    Math.max(
      1,
      Math.ceil(
        filtrados.length / PAGE_SIZE
      )
    )

  )


  const unidadExacta =
    codigo
      ? unidades.find(
          (u) => u.codigo === codigo
        )
      : null


  const visibles =
    filtrados.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    )


  const hayFiltros =
    Boolean(
      categoria ||
      estado ||
      codigo
    )


  return (

    <div className="page">


      {/* CABECERA */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Inventario de equipos
          </h1>


          <p
            className="page-subtitle"
            hidden={loading}
          >

            {plural(
              equipos.length,
              'modelo',
              'modelos'
            )}

            {' · '}

            {plural(
              totales.total,
              'unidad registrada',
              'unidades registradas'
            )}

            {user?.almacen
              ? ' en el ' + user.almacen
              : ''}

          </p>

        </div>


        <Link
          to="/manager/inventario/nuevo"
          className="btn btn-primary"
        >
          Nuevo equipo
        </Link>

      </div>


      {/* FILTROS */}

      <div className="toolbar">


        <label className="toolbar-select">

          <select
            aria-label="Categoría"
            value={categoria}
            onChange={(e) =>
              setFiltro(
                'categoria',
                e.target.value
              )
            }
          >

            <option value="">
              Categoría: todas
            </option>


            {CATEGORIAS.map((c) => (

              <option
                key={c}
                value={c}
              >
                {c}
              </option>

            ))}

          </select>

        </label>


        <label className="toolbar-select">

          <select
            aria-label="Estado"
            value={estado}
            onChange={(e) =>
              setFiltro(
                'estado',
                e.target.value
              )
            }
          >

            <option value="">
              Estado: todos
            </option>


            {Object.entries(
              ESTADOS_UNIDAD
            ).map(([k, v]) => (

              <option
                key={k}
                value={k}
              >
                Con unidades: {v.toLowerCase()}
              </option>

            ))}


            <option value="sin_unidades">
              Sin unidades
            </option>

          </select>

        </label>


        <form
          className="toolbar-search"
          role="search"
          onSubmit={(e) => {

            e.preventDefault()

            setFiltro(
              'codigo',
              codigoInput
                .trim()
                .toUpperCase()
            )

          }}
        >

          <span aria-hidden="true">
            ⌕
          </span>


          <input
            type="search"
            placeholder="Código de inventario"
            value={codigoInput}
            onChange={(e) => {

              setCodigoInput(
                e.target.value
              )

              if (
                e.target.value === ''
              ) {

                setFiltro(
                  'codigo',
                  ''
                )

              }

            }}
            aria-label="Buscar por código de inventario"
          />

        </form>


        {hayFiltros && (

          <button
            type="button"
            className="btn-link"
            onClick={() => {

              setCodigoInput('')

              setParams({})

            }}
          >
            Limpiar filtros
          </button>

        )}

      </div>


      {/* UNIDAD EXACTA */}

      {unidadExacta && (

        <div className="alert alert-info">

          La unidad{' '}

          <span className="mono">
            {unidadExacta.codigo}
          </span>

          {' '}está{' '}

          <StatusBadge
            estado={unidadExacta.estado}
          />

          {' '}

          <Link
            to={
              '/manager/inventario/' +
              unidadExacta.equipoId +
              '?unidad=' +
              unidadExacta.codigo
            }
          >
            Ver la unidad →
          </Link>

        </div>

      )}


      {/* TABLA */}

      <div className="card card-flush">


        {loading ? (

          <Spinner
            text="Cargando inventario…"
          />

        ) : filtrados.length === 0 ? (

          hayFiltros ? (

            <EmptyState
              title="Ningún equipo coincide con estos filtros"
              text={
                codigo
                  ? 'No hay unidades con el código «' +
                    codigo +
                    '».'
                  : 'Prueba con otra categoría o estado.'
              }
              action={

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {

                    setCodigoInput('')

                    setParams({})

                  }}
                >
                  Limpiar filtros
                </button>

              }
            />

          ) : (

            <EmptyState
              title="Aún no hay equipos en el inventario"
              text="Registra el primer equipo y luego sus unidades."
              action={

                <Link
                  to="/manager/inventario/nuevo"
                  className="btn btn-primary"
                >
                  Nuevo equipo
                </Link>

              }
            />

          )

        ) : (

          <>


            <div className="table-wrap">


              <table className="table table-inventory">


                <thead>

                  <tr>

                    <th>
                      FOTO
                    </th>

                    <th>
                      EQUIPO
                    </th>

                    <th>
                      MARCA Y MODELO
                    </th>

                    <th>
                      CATEGORÍA
                    </th>

                    <th>
                      UNIDADES POR ESTADO
                    </th>

                    <th>
                      ACCIONES
                    </th>

                  </tr>

                </thead>


                <tbody>


                  {visibles.map((e) => (

                    <tr key={e.id}>


                      <td>

                        <EquipmentPhoto
                          equipo={e}
                        />

                      </td>


                      <td>

                        <Link
                          to={
                            '/manager/inventario/' +
                            e.id
                          }
                          className="cell-title"
                        >
                          {e.nombre}
                        </Link>


                        {e.borrador && (

                          <StatusBadge
                            estado="borrador"
                          />

                        )}

                      </td>


                      <td className="cell-muted">

                        {
                          [
                            e.marca,
                            e.modelo
                          ]
                            .filter(Boolean)
                            .join(' · ') ||
                          '—'
                        }

                      </td>


                      <td className="cell-muted">

                        {e.categoria || '—'}

                      </td>


                      <td>

                        <ResumenUnidades
                          r={e.resumen}
                        />

                      </td>


                      <td className="actions">

                        <Link
                          to={
                            '/manager/inventario/' +
                            e.id
                          }
                        >
                          Unidades
                        </Link>

                        <span className="sep">·</span>

                        <Link
                          to={
                            '/manager/inventario/' +
                            e.id +
                            '?tab=condiciones'
                          }
                        >
                          Condiciones
                        </Link>

                        <span className="sep">·</span>

                        <Link
                          to={
                            '/manager/inventario/' +
                            e.id +
                            '/editar'
                          }
                        >
                          Editar
                        </Link>

                      </td>


                    </tr>

                  ))}


                </tbody>


              </table>


            </div>


            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtrados.length}
              noun="equipos"
              onChange={(n) =>
                setFiltro(
                  'page',
                  String(n)
                )
              }
            />


          </>

        )}


      </div>

    </div>

  )
}