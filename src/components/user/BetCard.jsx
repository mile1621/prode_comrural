import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { timeLeft, isBetOpen, matchStateLabel } from '../../utils/index.js'

export default function BetCard({ bet, predictionsMap, onPredict }) {
  const open     = isBetOpen(bet)
  const isLive   = bet.partidos?.some(p => p.estado === 'en_vivo')
  const betState = isLive ? 'en_vivo' : bet.partidos?.every(p => p.estado === 'finalizado') ? 'finalizado' : 'programado'
  const matchInfo = matchStateLabel(betState)

  const hasAnyPrediction = bet.partidos?.some(p => predictionsMap?.[p.id])

  return (
    <Card
      glow={isLive}
      className="animate-fade-in hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-glow)] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-display text-xl text-[var(--color-text)]">{bet.titulo}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <Badge variant={isLive ? 'accent' : 'muted'}>
            {matchInfo.label}
          </Badge>
          <Badge variant={open ? 'accent' : 'muted'}>
            {open ? timeLeft(bet.fecha_cierre) : 'Cerrada'}
          </Badge>
        </div>
      </div>

      {/* Marcadores */}
      {bet.partidos && bet.partidos.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {bet.partidos.map((match) => {
            const pred = predictionsMap?.[match.id]
            return (
              <div key={match.id} className="bg-[var(--color-bg-2)] rounded-[var(--radius-md)] p-3 flex flex-col gap-2 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-[var(--color-text)] text-sm flex-1">{match.equipo_local}</span>
                  <div className="bg-[var(--color-bg)] px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] shadow-sm">
                    <span className="font-display text-2xl text-[var(--color-accent)]">
                      {match.goles_local ?? '-'} <span className="text-[var(--color-text-faint)]">:</span> {match.goles_visitante ?? '-'}
                    </span>
                  </div>
                  <span className="font-body font-semibold text-[var(--color-text)] text-sm flex-1 text-right">{match.equipo_visitante}</span>
                </div>
                {pred && (
                  <div className="text-center text-xs text-[var(--color-text-muted)] font-body">
                    Tu predicción: <span className="text-[var(--color-accent)] font-semibold">{pred.pred_local} - {pred.pred_visitante}</span>
                    {pred.puntos !== '' && <span className="ml-2 px-1 bg-[var(--color-warn)] text-black rounded text-[10px]">Pts: {pred.puntos}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-body uppercase tracking-wider mb-0.5">Premio</p>
          <p className="text-sm font-semibold text-[var(--color-warn)] font-body">{bet.premio}</p>
        </div>

        {open ? (
          <Button size="sm" onClick={() => onPredict(bet)}>
            {hasAnyPrediction ? 'Editar predicción' : 'Apostar'}
          </Button>
        ) : (
          <span className="text-xs text-[var(--color-text-faint)] font-body">Apuesta cerrada</span>
        )}
      </div>
    </Card>
  )
}
