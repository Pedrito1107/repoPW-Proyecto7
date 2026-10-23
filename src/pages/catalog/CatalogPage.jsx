
import { useState, useEffect } from 'react'
import {
  EquipmentCard,
  ActiveFilters,
  Pagination
} from '../../components/ui.jsx'

import {
  getCatalogoActual,
  getCategoriasActuales
} from '../../services/catalogService.js'

export default function CatalogPage({ base = '/student' }) {

  const fichaBase = base === '/public'
    ? '/public/equipos/'
    : '/student/equipos/'

  // Datos actuales del inventario de HU2
  const [equipos, setEquipos] = useState(getCatalogoActual)
  const [conteoCategorias, setConteoCategorias] =
    useState(getCategoriasActuales)

  // Cargar nuevamente los datos al abrir el catálogo
  useEffect(() => {
    setEquipos(getCatalogoActual())
    setConteoCategorias(getCategoriasActuales())
  }, [])

  // Filtros seleccionados
  const [categorias, setCategorias] = useState([])
  const [disponibilidad, setDisponibilidad] = useState('libres')
  const [duracion, setDuracion] = useState('sin-limite')

  // Filtros aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    categorias: [],
    disponibilidad: 'libres',
    duracion: 'sin-limite'
  })

  // Buscador, orden y paginación
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('disponibles')
  const [pagina, setPagina] = useState(1)

  const pageSize = 8

  // Actualizar datos desde HU2
  const actualizarInventario = () => {
    setEquipos(getCatalogoActual())
    setConteoCategorias(getCategoriasActuales())
  }

  // Normalizar texto para búsquedas
  const normalizar = (texto) =>
    String(texto ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  // Aplicar filtros
  const aplicarFiltros = () => {
    actualizarInventario()

    setFiltrosAplicados({
      categorias: [...categorias],
      disponibilidad,
      duracion
    })

    setPagina(1)
  }

  // Cambiar categorías
  const cambiarCategorias = (cat, marcado) => {
    setCategorias((anteriores) =>
      marcado
        ? [...anteriores, cat]
        : anteriores.filter((c) => c !== cat)
    )
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    actualizarInventario()

    setCategorias([])
    setDisponibilidad('libres')
    setDuracion('sin-limite')

    setFiltrosAplicados({
      categorias: [],
      disponibilidad: 'libres',
      duracion: 'sin-limite'
    })

    setBusqueda('')
    setOrden('disponibles')
    setPagina(1)
  }

  // Filtrar los equipos actualizados
  const equiposFiltrados = equipos
    .filter((equipo) => {

      const coincideCategoria =
        filtrosAplicados.categorias.length === 0 ||
        filtrosAplicados.categorias.includes(equipo.categoria)

      const coincideDisponibilidad =
        filtrosAplicados.disponibilidad === 'todas' ||
        equipo.libres > 0

      const coincideDuracion =
        filtrosAplicados.duracion === 'sin-limite' ||
        equipo.duracion <= Number(filtrosAplicados.duracion)

      const textoEquipo = normalizar([
        equipo.nombre,
        equipo.marca,
        equipo.modelo,
        equipo.categoria
      ].join(' '))

      const coincideBusqueda =
        textoEquipo.includes(normalizar(busqueda.trim()))

      return (
        coincideCategoria &&
        coincideDisponibilidad &&
        coincideDuracion &&
        coincideBusqueda
      )
    })
    .sort((a, b) => {

      if (orden === 'nombre') {
        return a.nombre.localeCompare(b.nombre, 'es')
      }

      if (orden === 'categoria') {
        return (
          a.categoria.localeCompare(b.categoria, 'es') ||
          a.nombre.localeCompare(b.nombre, 'es')
        )
      }

      return b.libres - a.libres
    })

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(equiposFiltrados.length / pageSize)
  )

  const paginaActual = Math.min(pagina, totalPaginas)

  const equiposPagina = equiposFiltrados.slice(
    (paginaActual - 1) * pageSize,
    paginaActual * pageSize
  )

  // Filtros activos
  const filtrosActivos = [
    ...filtrosAplicados.categorias.map(
      (cat) => `Categoría: ${cat}`
    ),

    ...(filtrosAplicados.disponibilidad === 'libres'
      ? ['Disponibilidad: con unidades libres']
      : []),

    ...(filtrosAplicados.duracion !== 'sin-limite'
      ? [`Duración: hasta ${filtrosAplicados.duracion} días`]
      : [])
  ]

  return (
    <div className="page">
      <div className="catalog-layout">

        {/* FILTROS */}
        <aside className="card filter-panel">

          <h2>Filtros</h2>

          <span className="section-label">
            CATEGORÍA
          </span>

          {conteoCategorias.map(([cat, n]) => (
            <label key={cat} className="check">
              <input
                type="checkbox"
                checked={categorias.includes(cat)}
                onChange={(e) =>
                  cambiarCategorias(cat, e.target.checked)
                }
              />
              {cat} <small>({n})</small>
            </label>
          ))}

          <span className="section-label">
            DISPONIBILIDAD
          </span>

          <label className="check">
            <input
              type="radio"
              name="disp"
              checked={disponibilidad === 'libres'}
              onChange={() => setDisponibilidad('libres')}
            />
            Con unidades libres
          </label>

          <label className="check">
            <input
              type="radio"
              name="disp"
              checked={disponibilidad === 'todas'}
              onChange={() => setDisponibilidad('todas')}
            />
            Todas
          </label>

          <span className="section-label">
            DURACIÓN MÁXIMA
          </span>

          <label className="check">
            <input
              type="radio"
              name="dur"
              checked={duracion === '7'}
              onChange={() => setDuracion('7')}
            />
            Hasta 7 días
          </label>

          <label className="check">
            <input
              type="radio"
              name="dur"
              checked={duracion === '15'}
              onChange={() => setDuracion('15')}
            />
            Hasta 15 días
          </label>

          <label className="check">
            <input
              type="radio"
              name="dur"
              checked={duracion === 'sin-limite'}
              onChange={() => setDuracion('sin-limite')}
            />
            Sin límite
          </label>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            className="btn btn-tertiary btn-block"
            onClick={limpiarFiltros}
          >
            Limpiar todo
          </button>

        </aside>

        {/* RESULTADOS */}
        <section>

          <div className="catalog-head">
            <div>
              <h1 className="page-title">
                Catálogo de equipos
              </h1>

              <p className="page-subtitle">
                {equiposFiltrados.length} equipos encontrados
              </p>
            </div>

            <label className="toolbar-select">
              <span>Ordenar:</span>

              <select
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value)
                  setPagina(1)
                }}
              >
                <option value="disponibles">
                  más disponibles
                </option>
                <option value="nombre">
                  nombre
                </option>
                <option value="categoria">
                  categoría
                </option>
              </select>
            </label>
          </div>

          {/* BUSCADOR */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar equipo por nombre, marca, modelo o categoría..."
              aria-label="Buscar equipos"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D8E0E2',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* FILTROS ACTIVOS */}
          <ActiveFilters
            items={filtrosActivos}
            onClear={limpiarFiltros}
          />

          {/* TARJETAS */}
          <div className="catalog-grid">

            {equiposPagina.length > 0 ? (
              equiposPagina.map((equipo) => (
                <EquipmentCard
                  key={equipo.id}
                  equipo={equipo}
                  href={fichaBase + equipo.id}
                />
              ))
            ) : (
              <div className="empty-state">
                <h3>No se encontraron equipos</h3>
                <p>
                  Prueba buscando otro equipo o cambiando los filtros.
                </p>
              </div>
            )}

          </div>

          {/* PAGINACIÓN */}
          <Pagination
            page={paginaActual}
            pageSize={pageSize}
            total={equiposFiltrados.length}
            noun="equipos"
            onChange={setPagina}
          />

        </section>
      </div>
    </div>
  )
}
