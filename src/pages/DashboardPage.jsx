import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { isBetOpen, timeLeft } from '../utils/index.js'
import { Link } from 'react-router-dom'

function KpiCard({ label, value, tone = 'default' }) {
  const toneStyles = {
    default: { color: 'var(--color-text)' },
    accent:  { color: 'var(--color-accent)' },
    warn:    { color: 'var(--color-warn)' },
    live:    { color: 'var(--color-live)' },
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
        border: '1px solid rgba(34,217,223,0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <p className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-2">
        {label}
      </p>
      <p className="font-display text-5xl leading-none" style={toneStyles[tone]}>
        {value}
      </p>
    </div>
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
      <div className="mb-10 animate-fade-in">
        <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide leading-none mb-3">
          HOLA, <span className="text-[var(--color-accent)]">{(user?.nombre || '').split(' ')[0].toUpperCase()}</span>
        </h1>
        <p className="text-[var(--color-text-muted)] font-body text-base">
          Acá está el resumen de tu actividad en Prode One.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in delay-1">
        <KpiCard label="Puntos totales"  value="—"             tone="accent" />
        <KpiCard label="Posición"        value="—"             tone="warn" />
        <KpiCard label="Aciertos"        value="—"             tone="default" />
        <KpiCard label="En vivo"         value={liveBets.length} tone="live" />
      </div>

      {/* En vivo ahora */}
      {liveBets.length > 0 && (
        <section className="mb-10 animate-fade-in delay-2">
          <h2 className="font-display text-2xl md:text-3xl mb-5 flex items-center gap-3 text-white tracking-wide">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse-live"
              style={{ background: 'var(--color-live)', boxShadow: '0 0 12px var(--color-live)' }}
            />
            EN VIVO AHORA
          </h2>

          <div className="grid gap-3">
            {liveBets.map(bet => {
              const liveMatch = bet.partidos?.find(p => p.estado === 'en_vivo') || bet.partidos?.[0]
              const myPred   = liveMatch ? predictions[liveMatch.id] : null

              return (
                <div
                  key={bet.id}
                  className="rounded-2xl p-5 md:p-6"
                  style={{
                    background: 'linear-gradient(145deg, rgba(15,43,79,0.9) 0%, rgba(15,33,69,0.95) 100%)',
                    border: '1px solid rgba(255,61,113,0.25)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 24px rgba(255,61,113,0.08)',
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    {/* Info del partido */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Badge LIVE */}
                      <span
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-body font-bold uppercase tracking-wider"
                        style={{
                          background: 'rgba(255,61,113,0.15)',
                          color: 'var(--color-live)',
                          border: '1px solid rgba(255,61,113,0.4)',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-pulse-live" />
                        LIVE
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs text-[var(--color-text-muted)] font-body uppercase tracking-wider mb-1">
                          {bet.titulo}
                        </p>
                        {liveMatch && (
                          <p className="font-body font-semibold text-white text-base md:text-lg truncate">
                            {liveMatch.equipo_local} <span className="text-[var(--color-text-muted)] font-normal">vs</span> {liveMatch.equipo_visitante}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score: tu predicción vs real */}
                    {liveMatch && (
                      <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
                            Tu predicción
                          </p>
                          <p className="font-display text-2xl md:text-3xl text-[var(--color-accent)] leading-none">
                            {myPred ? `${myPred.pred_local} - ${myPred.pred_visitante}` : '— - —'}
                          </p>
                        </div>
                        <div className="w-px h-10 bg-[var(--color-border)]" />
                        <div className="text-center">
                          <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
                            Real
                          </p>
                          <p className="font-display text-2xl md:text-3xl text-white leading-none">
                            {liveMatch.goles_local ?? 0} - {liveMatch.goles_visitante ?? 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Apuestas disponibles */}
      <section className="animate-fade-in delay-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
            APUESTAS DISPONIBLES
          </h2>
          <Link
            to="/apuestas"
            className="text-sm text-[var(--color-accent)] font-body font-semibold hover:text-[var(--color-accent-bright)] transition-colors"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid gap-3">
          {activeBets.slice(0, 3).map(bet => {
            const hasLive = bet.partidos?.some(p => p.estado === 'en_vivo')
            const matchCount = bet.partidos?.length || 0
            const remaining = timeLeft(bet.fecha_cierre)
            const isClosingSoon = remaining !== 'Cerrada' && !remaining.includes('d')

            return (
              <Link
                key={bet.id}
                to="/apuestas"
                className="block rounded-2xl p-5 transition-all group"
                style={{
                  background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                  border: '1px solid rgba(34,217,223,0.15)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,217,223,0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.4), 0 0 24px rgba(34,217,223,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,217,223,0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'
                }}
              >
                <div className="flex items-center justify-between gap-4">

                  {/* Info izquierda */}
                  <div className="flex items-center gap-4 min-w-0">
                    {hasLive && (
                      <span
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-body font-bold uppercase tracking-wider"
                        style={{
                          background: 'rgba(255,61,113,0.15)',
                          color: 'var(--color-live)',
                          border: '1px solid rgba(255,61,113,0.4)',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-pulse-live" />
                        LIVE
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="font-display text-xl md:text-2xl text-white tracking-wide leading-tight truncate">
                        {bet.titulo}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)] font-body">
                        <span>{matchCount} {matchCount === 1 ? 'partido' : 'partidos'}</span>
                        <span className="text-[var(--color-text-faint)]">·</span>
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Cierra en{' '}
                          <span
                            className="font-semibold"
                            style={{ color: isClosingSoon ? 'var(--color-warn)' : 'var(--color-accent)' }}
                          >
                            {remaining}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info derecha: premio + chevron */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {bet.premio && (
                      <div
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                          background: 'rgba(244,180,42,0.1)',
                          border: '1px solid rgba(244,180,42,0.3)',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                        <span className="text-xs font-body font-semibold text-[var(--color-warn)] max-w-[160px] truncate">
                          {bet.premio}
                        </span>
                      </div>
                    )}
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}

          {activeBets.length === 0 && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background: 'rgba(15,43,79,0.4)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <p className="text-[var(--color-text-muted)] font-body text-sm">
                No hay apuestas activas en este momento.
              </p>
              <p className="text-[var(--color-text-faint)] font-body text-xs mt-1">
                Las próximas apuestas van a aparecer acá cuando se publiquen.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  )
}
