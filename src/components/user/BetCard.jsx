import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { timeLeft, isBetOpen, matchStateLabel } from '../../utils/index.js'

export default function BetCard({ bet, userPrediction, onPredict }) {
  const open     = isBetOpen(bet)
  const matchInfo = matchStateLabel(bet.match?.state)

  return (
    <Card
      glow={bet.match?.state === 'live'}
      className="animate-fade-in hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-glow)] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-display text-xl text-[var(--color-text)]">{bet.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <Badge variant={bet.match?.state === 'live' ? 'accent' : 'muted'}>
            {matchInfo.label}
          </Badge>
          <Badge variant={open ? 'accent' : 'muted'}>
            {open ? timeLeft(bet.deadline) : 'Cerrada'}
          </Badge>
        </div>
      </div>

      {/* Marcador */}
      {bet.match && (
        <div className="bg-[var(--color-bg-2)] rounded-[var(--radius-md)] p-4 mb-4 flex items-center justify-between">
          <span className="font-body font-semibold text-[var(--color-text)]">{bet.match.home}</span>
          <span className="font-display text-3xl text-[var(--color-accent)] px-4">
            {bet.match.homeScore ?? '–'} : {bet.match.awayScore ?? '–'}
          </span>
          <span className="font-body font-semibold text-[var(--color-text)]">{bet.match.away}</span>
        </div>
      )}

      {/* Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-body uppercase tracking-wider mb-0.5">Premio</p>
          <p className="text-sm font-semibold text-[var(--color-warn)] font-body">{bet.prize}</p>
        </div>

        {userPrediction ? (
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)] font-body uppercase tracking-wider mb-0.5">Tu predicción</p>
            <p className="text-sm font-semibold text-[var(--color-accent)] font-body">{userPrediction.value}</p>
          </div>
        ) : open ? (
          <Button size="sm" onClick={() => onPredict(bet)}>
            Apostar
          </Button>
        ) : (
          <span className="text-xs text-[var(--color-text-faint)] font-body">Sin predicción</span>
        )}
      </div>
    </Card>
  )
}
