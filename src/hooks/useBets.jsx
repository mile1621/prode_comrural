import { useState, useCallback, useEffect } from 'react'
import sheetsApi from '../services/sheetsApi.js'

/* ── Hook de Apuestas ───────────────────────────────────────
   Conectado a sheetsApi → Apps Script → Google Sheets.
   ─────────────────────────────────────────────────────────── */

export function useBets() {
  const [bets, setBets]               = useState([])
  const [matches, setMatches]         = useState([]) // Todos los partidos para selects admin
  const [predictions, setPredictions] = useState({}) // { partido_id: prediccion }
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // Carga inicial de apuestas y partidos
  useEffect(() => {
    loadBets()
  }, [])

  const loadBets = useCallback(async (estado = '') => {
    setLoading(true)
    setError(null)
    try {
      const [dataApuestas, dataPartidos] = await Promise.all([
        sheetsApi.apuestas.listar(estado),
        sheetsApi.partidos.listar()
      ])

      let allMatches = dataPartidos.partidos || []

      // MOCKEADO TEMPORAL: Partidos de prueba si la hoja de GS está vacía
      if (allMatches.length === 0) {
        allMatches = [
          { id: 'mock1', equipo_local: 'Boca Juniors', equipo_visitante: 'River Plate', estado: 'programado' },
          { id: 'mock2', equipo_local: 'Real Madrid', equipo_visitante: 'Barcelona', estado: 'programado' },
          { id: 'mock3', equipo_local: 'Inter Miami', equipo_visitante: 'LA Galaxy', estado: 'programado' }
        ]
      }
      
      setMatches(allMatches)

      const enrichedBets = (dataApuestas.apuestas || []).map(a => {
        const pIds = a.partidos_ids ? a.partidos_ids.split(',').map(id => id.trim()) : []
        const mappedMatches = pIds.map(id => allMatches.find(pm => pm.id === id)).filter(Boolean)
        return {
          ...a,
          partidos: mappedMatches
        }
      })

      setBets(enrichedBets)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyPredictions = useCallback(async (apuesta_id = '') => {
    try {
      const data = await sheetsApi.predicciones.mias(apuesta_id)
      // Convertir array a mapa { partido_id: prediccion }
      const map = {}
      ;(data.predicciones || []).forEach(p => { map[p.partido_id] = p })
      setPredictions(map)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  /**
   * Guarda o actualiza una predicción.
   * @param {{ apuesta_id, partido_id, pred_local, pred_visitante }} data
   */
  const savePrediction = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      await sheetsApi.predicciones.guardar(data)
      // Actualizar estado local optimistamente
      setPredictions(prev => ({
        ...prev,
        [data.partido_id]: {
          ...data,
          puntos: '',
        }
      }))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crea una nueva apuesta (admin).
   * @param {{ titulo, tipo, premio, fecha_cierre, partidos_ids, ... }} data
   */
  const createBet = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      await sheetsApi.apuestas.crear(data)
      await loadBets() // Recargar lista
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const closeBet = useCallback(async (apuesta_id) => {
    setLoading(true)
    try {
      await sheetsApi.apuestas.cerrar(apuesta_id)
      await loadBets()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const finalizeBet = useCallback(async (apuesta_id) => {
    setLoading(true)
    try {
      await sheetsApi.apuestas.finalizar(apuesta_id)
      await loadBets()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  return {
    bets,
    matches,
    predictions,
    loading,
    error,
    loadBets,
    loadMyPredictions,
    savePrediction,
    createBet,
    closeBet,
    finalizeBet,
  }
}
