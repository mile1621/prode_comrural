import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import BetCard from '../components/user/BetCard.jsx'
import PredictModal from '../components/user/PredictModal.jsx'
import { useBets } from '../hooks/useBets.jsx'

const FILTERS = ['todas', 'activas', 'cerradas']

export default function BetsPage() {
  const { bets, predictions, loading, placePrediction } = useBets()
  const [filter, setFilter]     = useState('todas')
  const [activeBet, setActiveBet] = useState(null) // apuesta seleccionada para modal

  const filtered = bets.filter(b => {
    if (filter === 'activas')  return b.status === 'active'
    if (filter === 'cerradas') return b.status === 'closed' || b.status === 'finished'
    return true
  })

  async function handlePredict(betId, prediction) {
    await placePrediction(betId, prediction)
    setActiveBet(null)
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-4xl">Apuestas</h1>
          <p className="text-[var(--color-text-muted)] font-body text-sm mt-1">
            {bets.length} apuestas en total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 text-xs font-semibold font-body capitalize rounded-[var(--radius-sm)] transition-all
                ${filter === f
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
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
              userPrediction={predictions[bet.id]}
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
