import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import BetCard from '../components/user/BetCard.jsx'
import PredictModal from '../components/user/PredictModal.jsx'
import { useBets } from '../hooks/useBets.jsx'

const FILTERS = ['todas', 'activas', 'cerradas']

export default function BetsPage() {
  const { bets, predictions, loading, savePrediction } = useBets()
  const [filter, setFilter]     = useState('todas')
  const [activeBet, setActiveBet] = useState(null) // apuesta seleccionada para modal

  const filtered = bets.filter(b => {
    if (filter === 'activas')  return b.estado === 'abierta'
    if (filter === 'cerradas') return b.estado === 'cerrada' || b.estado === 'finalizada'
    return true
  })

  async function handlePredict(betId, matchPredictions) {
    try {
      await Promise.all(
        matchPredictions.map(p => savePrediction({
          apuesta_id: betId,
          partido_id: p.partido_id,
          pred_local: p.pred_local,
          pred_visitante: p.pred_visitante
        }))
      )
      setActiveBet(null)
      alert('Tus predicciones se han guardado con éxito.')
    } catch (err) {
      alert(err.message || 'No se pudieron guardar las predicciones')
    }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-brand-grad rounded-[var(--radius-lg)] p-6 mb-6 text-white shadow-md animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white">Apuestas</h1>
          <p className="text-white opacity-80 font-body text-sm mt-1">
            {bets.length} apuestas en total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-white/10 p-1 rounded-[var(--radius-md)] backdrop-blur-sm border border-white/20">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 text-xs font-semibold font-body capitalize rounded-[var(--radius-sm)] transition-all
                ${filter === f
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {filtered.map((bet, i) => (
          <div key={bet.id} className={`delay-${Math.min(i + 1, 5)}`}>
            <BetCard
              bet={bet}
              predictionsMap={predictions}
              onPredict={setActiveBet}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--color-text-muted)] font-body">
            <p className="text-4xl mb-3">🏟️</p>
            <p>No hay apuestas en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Modal de predicción */}
      <PredictModal
        bet={activeBet}
        onSubmit={handlePredict}
        onClose={() => setActiveBet(null)}
        loading={loading}
      />
    </AppLayout>
  )
}
