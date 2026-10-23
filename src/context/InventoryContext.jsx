// src/context/InventoryContext.jsx
// Estado del inventario (HU-2). Las páginas no llaman a los servicios
// directamente: usan las acciones de este contexto.

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as inventoryService from '../services/inventoryService.js'
import { useAuth } from './AuthContext.jsx'
import { shortName } from '../shared/format.js'

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const { user } = useAuth()
  const [equipos, setEquipos] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [listaEquipos, listaUnidades] = await Promise.all([
      inventoryService.listEquipos(),
      inventoryService.listUnidades()
    ])
    setEquipos(listaEquipos)
    setUnidades(listaUnidades)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Ejecuta una escritura y vuelve a leer el listado
  const withRefresh = useCallback((fn) => async (...args) => {
    const result = await fn(...args)
    await refresh()
    return result
  }, [refresh])

  const value = useMemo(() => {
    const totales = equipos.reduce((acc, e) => {
      Object.keys(acc).forEach((k) => { acc[k] += e.resumen[k] })
      return acc
    }, { total: 0, disponible: 0, prestada: 0, mantenimiento: 0, baja: 0 })

    return {
      equipos,
      unidades,
      loading,
      totales,
      refresh,
      getEquipo: inventoryService.getEquipo,
      getFichaPublica: inventoryService.getFichaPublica,
      findUnidadByCodigo: inventoryService.findUnidadByCodigo,
      suggestCodigo: inventoryService.suggestCodigo,
      createEquipo: withRefresh((data, opts) =>
        inventoryService.createEquipo(data, { ...opts, almacen: user?.almacen })),
      updateEquipo: withRefresh(inventoryService.updateEquipo),
      deleteEquipo: withRefresh(inventoryService.deleteEquipo),
      updateCondiciones: withRefresh(inventoryService.updateCondiciones),
      createUnidad: withRefresh(inventoryService.createUnidad),
      updateUnidad: withRefresh(inventoryService.updateUnidad),
      changeEstadoUnidad: withRefresh((id, hacia, motivo) =>
        inventoryService.changeEstadoUnidad(id, hacia, motivo, shortName(user)))
    }
  }, [equipos, unidades, loading, refresh, withRefresh, user])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory debe usarse dentro de <InventoryProvider>')
  return context
}

// Para componentes que también se muestran fuera del panel (p. ej. la cabecera)
export function useInventoryOptional() {
  return useContext(InventoryContext)
}
