import { useState, useCallback, useEffect } from 'react'
import sheetsApi from '../services/sheetsApi.js'

/* ── Hook de Apuestas ───────────────────────────────────────
   Conectado a sheetsApi → Apps Script → Google Sheets.
   ─────────────────────────────────────────────────────────── */

export function useBets() {
  const [bets, setBets]               = useState([])
  const [predictions, setPredictions] = useState({}) // { partido_id: prediccion }
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // Carga inicial de apuestas
  useEffect(() => {
    loadBets()
  }, [])

  const loadBets = useCallback(async (estado = '') => {
    setLoading(true)
    setError(null)
    try {
      const data = await sheetsApi.apuestas.listar(estado)
      setBets(data.apuestas || [])
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
