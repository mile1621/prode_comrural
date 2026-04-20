import { useState, useEffect } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

export default function PredictModal({ bet, onSubmit, onClose, loading }) {
  const [scores, setScores] = useState({})

  // Inicializar inputs
  useEffect(() => {
    if (bet?.partidos) {
      const initial = {}
      bet.partidos.forEach(p => {
        initial[p.id] = { local: '', visitante: '' }
      })
      setScores(initial)
    }
  }, [bet])

  if (!bet) return null

  function handleSubmit(e) {
    e.preventDefault()
    
    const matchPredictions = Object.entries(scores).map(([partido_id, vals]) => {
      return {
        partido_id,
        pred_local: parseInt(vals.local, 10),
        pred_visitante: parseInt(vals.visitante, 10)
      }
    }).filter(p => !isNaN(p.pred_local) && !isNaN(p.pred_visitante))

    if (matchPredictions.length === 0) {
      alert("Por favor ingresa predicciones válidas para al menos un partido.")
      return
    }
    onSubmit(bet.id, matchPredictions)
  }

  function updateScore(partidoId, side, value) {
    if (value !== '' && !/^\d+$/.test(value)) return // Solo números
    
    setScores(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [side]: value
      }
    }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[var(--shadow-md)] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl mb-1">{bet.titulo}</h2>
        <p className="text-sm text-[var(--color-text-muted)] font-body mb-5">
          Ingresá los goles exactos para cada partido de la apuesta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-4 mb-2">
            {bet.partidos?.map(match => (
              <div key={match.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
                <p className="text-xs text-[var(--color-text-muted)] font-body font-semibold text-center mb-3">
                  {match.equipo_local} vs {match.equipo_visitante}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                     <span className="text-xs mb-1 truncate w-20 text-center">{match.equipo_local}</span>
                     <Input 
                       type="text"
                       inputMode="numeric"
                       className="w-16 text-center font-display text-lg px-1" 
                       value={scores[match.id]?.local ?? ''}
                       onChange={e => updateScore(match.id, 'local', e.target.value)}
                       placeholder="0"
                     />
                  </div>
                  <span className="font-display text-xl text-[var(--color-text-muted)]">-</span>
                  <div className="flex flex-col items-center">
                     <span className="text-xs mb-1 truncate w-20 text-center">{match.equipo_visitante}</span>
                     <Input 
                       type="text"
                       inputMode="numeric"
                       className="w-16 text-center font-display text-lg px-1" 
                       value={scores[match.id]?.visitante ?? ''}
                       onChange={e => updateScore(match.id, 'visitante', e.target.value)}
                       placeholder="0"
                     />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
