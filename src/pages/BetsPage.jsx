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
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide leading-none mb-2">
            APUESTAS
          </h1>
          <p className="text-[var(--color-text-muted)] font-body text-sm">
            {bets.length} {bets.length === 1 ? 'apuesta disponible' : 'apuestas disponibles'}
          </p>
        </div>

        {/* Filtros */}
        <div
          className="inline-flex gap-1 p-1 rounded-xl self-start md:self-auto"
          style={{
            background: 'rgba(15,43,79,0.6)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider rounded-lg transition-all"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)'
                    : 'transparent',
                  color: active ? '#020F27' : 'var(--color-text-muted)',
                  boxShadow: active ? '0 4px 16px rgba(34,217,223,0.3)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-text)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {filtered.map((bet, i) => (
          <div
            key={bet.id}
            className={`animate-fade-in delay-${Math.min(i + 1, 5)}`}
          >
            <BetCard
              bet={bet}
              predictionsMap={predictions}
              onPredict={setActiveBet}
            />
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div
            className="rounded-2xl p-12 text-center animate-fade-in"
            style={{
              background: 'rgba(15,43,79,0.4)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <svg
              width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-faint)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="mx-auto mb-4"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <p className="text-[var(--color-text-muted)] font-body text-base mb-1">
              {filter === 'todas'
                ? 'Todavía no hay apuestas publicadas'
                : filter === 'activas'
                  ? 'No hay apuestas activas en este momento'
                  : 'No hay apuestas cerradas todavía'}
            </p>
            <p className="text-[var(--color-text-faint)] font-body text-xs">
              {filter === 'todas'
                ? 'Las próximas apuestas van a aparecer acá cuando se publiquen.'
                : filter === 'activas'
                  ? 'Probá cambiar el filtro o volvé a revisar más tarde.'
                  : 'Una vez que cierren las apuestas actuales vas a poder verlas acá.'}
            </p>
          </div>
        )}

        {filtered.length === 0 && loading && (
          <div className="text-center py-16">
            <span className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--color-text-muted)] font-body text-sm mt-3">Cargando apuestas...</p>
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
