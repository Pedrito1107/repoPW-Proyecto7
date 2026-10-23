// src/context/MetricsContext.jsx
// Estado de la HU-7 (métricas y usuarios). Las páginas no llaman a los
// servicios directamente: usan las acciones de este contexto.
// El rango de fechas se comparte entre el tablero y el ranking, así se
// conserva al pasar de una vista a la otra.

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as metricsService from '../services/metricsService.js'
import * as usersService from '../services/usersService.js'
import { useAuth } from './AuthContext.jsx'
import { PERIODO_INICIAL } from '../shared/constants.js'
import { shortName } from '../shared/format.js'

const MetricsContext = createContext(null)

export function MetricsProvider({ children }) {
  const { user } = useAuth()
  const [rango, setRango] = useState(PERIODO_INICIAL)
  // Cambia después de cada bloqueo / desbloqueo para que las vistas relean
  const [version, setVersion] = useState(0)

  const encargado = shortName(user)

  // Total de estudiantes para el contador «Usuarios» del menú lateral
  const [totalEstudiantes, setTotalEstudiantes] = useState(null)
  useEffect(() => {
    usersService.listEstudiantes({ pageSize: 1 })
      .then((r) => setTotalEstudiantes(r.resumen.total))
      .catch(() => setTotalEstudiantes(null))
  }, [version])

  const bloquearCuenta = useCallback(async (id, datos) => {
    const result = await usersService.bloquearCuenta(id, datos, encargado)
    setVersion((v) => v + 1)
    return result
  }, [encargado])

  const desbloquearCuenta = useCallback(async (id, datos) => {
    const result = await usersService.desbloquearCuenta(id, datos, encargado)
    setVersion((v) => v + 1)
    return result
  }, [encargado])

  const value = useMemo(() => ({
    rango,
    setRango,
    version,
    totalEstudiantes,
    getTablero: metricsService.getTablero,
    getRanking: metricsService.getRanking,
    exportarTablero: metricsService.exportarTablero,
    listEstudiantes: usersService.listEstudiantes,
    getEstudiante: usersService.getEstudiante,
    bloquearCuenta,
    desbloquearCuenta
  }), [rango, version, totalEstudiantes, bloquearCuenta, desbloquearCuenta])

  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>
}

export function useMetrics() {
  const context = useContext(MetricsContext)
  if (!context) throw new Error('useMetrics debe usarse dentro de <MetricsProvider>')
  return context
}

// Para componentes que también se muestran fuera del panel (p. ej. el menú lateral)
export function useMetricsOptional() {
  return useContext(MetricsContext)
}
