import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBets } from '../hooks/useBets.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { isBetOpen, matchStateLabel, timeLeft } from '../utils/index.js'
import { Link } from 'react-router-dom'

function StatCard({ label, value, accent = false }) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
        {label}
      </p>
      <p className={`font-display text-4xl ${accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
        {value}
      </p>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { bets, predictions } = useBets()

  const activeBets   = bets.filter(b => isBetOpen(b))
  const liveBets     = bets.filter(b => b.partidos?.some(p => p.estado === 'en_vivo'))
  const myPredictions = Object.keys(predictions).length

  return (
    <AppLayout>
      {/* Bienvenida */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl mb-1">
          Hola, <span className="text-[var(--color-accent)]">{user?.nombre?.split(' ')[0]}</span>
        </h1>
        <p className="text-[var(--color-text-muted)] font-body">
          Acá está el resumen de tu actividad en Prode One.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Apuestas activas"   value={activeBets.length}   accent />
        <StatCard label="En vivo ahora"      value={liveBets.length} />
        <StatCard label="Mis predicciones"   value={myPredictions} />
        <StatCard label="Total apuestas"     value={bets.length} />
      </div>

      {/* Partidos en vivo */}
      {liveBets.length > 0 && (
        <section className="mb-8 animate-fade-in delay-1">
          <h2 className="font-display text-2xl mb-4 flex items-center gap-3">
            En Vivo
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-pulse-accent" />
          </h2>
          <div className="grid gap-3">
            {liveBets.map(bet => {
              const liveMatch = bet.partidos?.find(p => p.estado === 'en_vivo') || bet.partidos?.[0]
              
              return (
                <Card key={bet.id} glow className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-body font-semibold text-[var(--color-text)]">{bet.titulo}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-body mt-0.5">{bet.premio}</p>
                  </div>
                  {liveMatch && (
                    <div className="flex items-center gap-3 font-body font-semibold text-sm">
                      <span>{liveMatch.equipo_local}</span>
                      <span className="font-display text-2xl text-[var(--color-accent)] px-2">
                        {liveMatch.goles_local || 0} : {liveMatch.goles_visitante || 0}
                      </span>
                      <span>{liveMatch.equipo_visitante}</span>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Próximas apuestas */}
      <section className="animate-fade-in delay-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Apuestas disponibles</h2>
          <Link to="/apuestas" className="text-sm text-[var(--color-accent)] font-body hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-3">
          {activeBets.slice(0, 3).map(bet => {
            const betState = bet.partidos?.some(p => p.estado === 'en_vivo') 
              ? 'en_vivo' 
              : bet.partidos?.every(p => p.estado === 'finalizado') ? 'finalizado' : 'programado'
              
            return (
              <Card key={bet.id} className="flex items-center justify-between gap-4 hover:border-[var(--color-accent)] transition-colors">
                <div>
                  <p className="font-body font-semibold">{bet.titulo}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mt-0.5">
                    Cierra en <span className="text-[var(--color-warn)]">{timeLeft(bet.fecha_cierre)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={matchStateLabel(betState).label === 'EN VIVO' ? 'accent' : 'muted'}>
                    {matchStateLabel(betState).label}
                  </Badge>
                  <Badge variant="warn">{bet.premio}</Badge>
                </div>
              </Card>
            )
          })}
          {activeBets.length === 0 && (
            <p className="text-[var(--color-text-muted)] font-body text-sm py-6 text-center">
              No hay apuestas activas en este momento.
            </p>
          )}
        </div>
      </section>
    </AppLayout>
  )
}
