import { useState, useEffect } from 'react'
import { useBets } from '../../hooks/useBets.jsx'
import { timeLeft, isBetOpen } from '../../utils/index.js'

export default function PredictModal({ bet, onSubmit, onClose, loading }) {
  const { predictions } = useBets()
  const [scores, setScores] = useState({})

  // Inicializar inputs: si el usuario ya predijo, precargar sus valores
  useEffect(() => {
    if (bet?.partidos) {
      const initial = {}
      bet.partidos.forEach(p => {
        const existingPred = predictions?.[p.id]
        initial[p.id] = {
          local: existingPred?.pred_local != null ? String(existingPred.pred_local) : '',
          visitante: existingPred?.pred_visitante != null ? String(existingPred.pred_visitante) : '',
        }
      })
      setScores(initial)
    }
  }, [bet, predictions])

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!bet) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bet, onClose])

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (!bet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [bet])

  if (!bet) return null

  const open = isBetOpen(bet)
  const remaining = timeLeft(bet.fecha_cierre)
  const isClosingSoon = open && remaining !== 'Cerrada' && !remaining.includes('d')

  // Conteo de predicciones válidas (para el footer)
  const totalMatches = bet.partidos?.length || 0
  const filledCount = Object.values(scores).filter(
    v => v.local !== '' && v.visitante !== ''
  ).length

  // Detectar si el usuario ya tenía predicciones cargadas
  const hadPredictions = bet.partidos?.some(p => predictions?.[p.id]) ?? false

  function handleSubmit(e) {
    e.preventDefault()

    const matchPredictions = Object.entries(scores).map(([partido_id, vals]) => ({
      partido_id,
      pred_local: parseInt(vals.local, 10),
      pred_visitante: parseInt(vals.visitante, 10),
    })).filter(p => !isNaN(p.pred_local) && !isNaN(p.pred_visitante))

    if (matchPredictions.length === 0) {
      alert('Ingresá al menos una predicción válida.')
      return
    }
    onSubmit(bet.id, matchPredictions)
  }

  function updateScore(partidoId, side, value) {
    if (value !== '' && !/^\d{1,2}$/.test(value)) return // Solo números de 0-99
    setScores(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [side]: value,
      },
    }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      style={{
        background: 'rgba(2,15,39,0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="predict-modal-title"
    >
      <div
        className="w-full md:max-w-[720px] md:w-auto h-[92vh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(145deg, rgba(15,43,79,0.98) 0%, rgba(15,33,69,0.98) 100%)',
          border: '1px solid rgba(34,217,223,0.2)',
          borderRadius: window.innerWidth < 768 ? '16px 16px 0 0' : '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(34,217,223,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div
          className="flex items-start justify-between gap-4 p-5 md:p-6 flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, rgba(15,43,79,0.95) 0%, rgba(15,33,69,0.9) 100%)',
            borderBottom: '1px solid rgba(34,217,223,0.15)',
          }}
        >
          <div className="min-w-0 flex-1">
            {open && (
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={isClosingSoon ? 'var(--color-warn)' : 'var(--color-accent)'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Cierra en
                </span>
                <span
                  className="font-display text-base tracking-wide"
                  style={{ color: isClosingSoon ? 'var(--color-warn)' : 'var(--color-accent)' }}
                >
                  {remaining}
                </span>
              </div>
            )}

            {!open && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-body font-bold uppercase tracking-wider"
                  style={{
                    background: 'rgba(132,153,194,0.1)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Apuesta cerrada
                </span>
              </div>
            )}

            <h2
              id="predict-modal-title"
              className="font-display text-2xl md:text-3xl text-white tracking-wide leading-tight truncate"
            >
              {bet.titulo}
            </h2>

            <p className="text-xs md:text-sm text-[var(--color-text-muted)] font-body mt-1">
              {open
                ? hadPredictions
                  ? 'Revisá tus predicciones o ajustalas antes del cierre.'
                  : 'Ingresá el resultado exacto de cada partido.'
                : 'Podés ver tus predicciones pero ya no se pueden editar.'}
            </p>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(2,15,39,0.4)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,77,109,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,77,109,0.4)'
              e.currentTarget.style.color = 'var(--color-danger)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(2,15,39,0.4)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <form onSubmit={handleSubmit} id="predict-form" className="flex flex-col gap-3">

            {bet.partidos?.map((match, idx) => {
              const isLive       = match.estado === 'en_vivo'
              const isFinished   = match.estado === 'finalizado'
              const isDisabled   = !open || isLive || isFinished
              const hasPred      = scores[match.id]?.local !== '' && scores[match.id]?.visitante !== ''
              const matchState   = isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : null

              return (
                <div
                  key={match.id}
                  className="rounded-xl p-4 md:p-5 transition-all"
                  style={{
                    background: 'rgba(2,15,39,0.45)',
                    border: `1px solid ${isLive ? 'rgba(255,61,113,0.35)' : hasPred ? 'rgba(34,217,223,0.3)' : 'var(--color-border)'}`,
                  }}
                >
                  {/* Cabecera del partido: índice + fecha/estado */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                      Partido {idx + 1}
                    </span>

                    {matchState && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-body font-bold uppercase tracking-wider"
                        style={{
                          background: isLive ? 'rgba(255,61,113,0.15)' : 'rgba(244,180,42,0.1)',
                          color: isLive ? 'var(--color-live)' : 'var(--color-warn)',
                          border: `1px solid ${isLive ? 'rgba(255,61,113,0.35)' : 'rgba(244,180,42,0.3)'}`,
                        }}
                      >
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-pulse-live" />}
                        {matchState}
                      </span>
                    )}

                    {!matchState && hasPred && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Guardada
                      </span>
                    )}
                  </div>

                  {/* Fila marcador: equipo local · score · vs · score · equipo visitante */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2 md:gap-3">

                    {/* Equipo local */}
                    <span className="font-body font-semibold text-white text-sm md:text-base truncate">
                      {match.equipo_local}
                    </span>

                    {/* Input local */}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={scores[match.id]?.local ?? ''}
                      onChange={e => updateScore(match.id, 'local', e.target.value)}
                      placeholder="—"
                      disabled={isDisabled}
                      aria-label={`Goles ${match.equipo_local}`}
                      className="w-14 h-14 md:w-16 md:h-16 text-center font-display text-3xl md:text-4xl rounded-lg outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: 'rgba(15,43,79,0.8)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-accent)',
                      }}
                      onFocus={e => {
                        if (isDisabled) return
                        e.target.style.borderColor = 'var(--color-accent)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.2)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--color-border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />

                    {/* Separador vs */}
                    <span className="font-display text-xl md:text-2xl text-[var(--color-warn)] px-1">
                      vs
                    </span>

                    {/* Input visitante */}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={scores[match.id]?.visitante ?? ''}
                      onChange={e => updateScore(match.id, 'visitante', e.target.value)}
                      placeholder="—"
                      disabled={isDisabled}
                      aria-label={`Goles ${match.equipo_visitante}`}
                      className="w-14 h-14 md:w-16 md:h-16 text-center font-display text-3xl md:text-4xl rounded-lg outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: 'rgba(15,43,79,0.8)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-accent)',
                      }}
                      onFocus={e => {
                        if (isDisabled) return
                        e.target.style.borderColor = 'var(--color-accent)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.2)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--color-border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />

                    {/* Equipo visitante */}
                    <span className="font-body font-semibold text-white text-sm md:text-base truncate text-right">
                      {match.equipo_visitante}
                    </span>
                  </div>

                  {/* Score real si el partido está en vivo o finalizado */}
                  {(isLive || isFinished) && (match.goles_local != null || match.goles_visitante != null) && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-center gap-2 text-xs font-body">
                      <span className="text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">
                        {isLive ? 'En vivo' : 'Resultado'}:
                      </span>
                      <span
                        className="font-display text-lg tracking-wide"
                        style={{ color: isLive ? 'var(--color-live)' : 'var(--color-text)' }}
                      >
                        {match.goles_local ?? 0} - {match.goles_visitante ?? 0}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            </form>
        </div>

        {/* Footer sticky */}
        <div
          className="flex-shrink-0 p-4 md:p-5"
          style={{
            background: 'linear-gradient(0deg, rgba(15,33,69,0.98) 0%, rgba(15,43,79,0.92) 100%)',
            borderTop: '1px solid rgba(34,217,223,0.15)',
          }}
        >
          {/* Contador de progreso */}
          {open && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Progreso
                </span>
                <span className="text-xs font-body text-[var(--color-text-muted)]">
                  Predijiste{' '}
                  <span className="font-display text-sm text-[var(--color-accent)] tracking-wide">
                    {filledCount}
                  </span>
                  {' '}de {totalMatches} partidos
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(2,15,39,0.6)' }}
              >
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: totalMatches > 0 ? `${(filledCount / totalMatches) * 100}%` : '0%',
                    background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                    boxShadow: '0 0 12px rgba(34,217,223,0.4)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-lg font-body font-semibold text-sm transition-all"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(34,217,223,0.3)'
                e.currentTarget.style.color = 'var(--color-text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              Cancelar
            </button>

            {open && (
              <button
                type="submit"
                form="predict-form"
                disabled={loading || filledCount === 0}
                className="flex-1 py-3 rounded-lg font-body font-bold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: (loading || filledCount === 0)
                    ? 'var(--color-accent-dim)'
                    : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                  color: '#020F27',
                  boxShadow: (loading || filledCount === 0)
                    ? 'none'
                    : '0 6px 24px rgba(34,217,223,0.35)',
                }}
                onMouseEnter={e => {
                  if (!loading && filledCount > 0) {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,217,223,0.55)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!loading && filledCount > 0) {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.35)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : hadPredictions ? (
                  'Actualizar predicciones'
                ) : (
                  'Guardar predicciones'
                )}
              </button>
            )}
          </div>

          {open && (
            <p className="text-[10px] text-[var(--color-text-faint)] font-body text-center mt-3">
              Podés editar tus predicciones mientras la apuesta siga abierta
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
