import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { isBetOpen, timeLeft } from '../utils/index.js'
import { Link } from 'react-router-dom'

/* ──────────────────────────────────────────────────────────
   KPI CARD — grande, con ícono y número prominente
────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, gold = false, live = false }) {
  const accentColor  = live ? '#ff4d6d' : gold ? '#ebc32b' : 'rgba(255,255,255,.7)'
  const borderColor  = live ? 'rgba(255,61,109,.3)' : gold ? 'rgba(235,195,43,.3)' : 'rgba(255,255,255,.08)'
  const iconBg       = live ? 'rgba(255,61,109,.12)' : gold ? 'rgba(235,195,43,.12)' : 'rgba(255,255,255,.06)'

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{
        background: 'linear-gradient(155deg,rgba(66,91,139,.22),rgba(66,91,139,.06))',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 8px 28px rgba(0,0,0,.3)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 38px rgba(0,0,0,.4)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.3)' }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>

      {/* Value */}
      <div>
        <p className="font-display leading-none mb-1"
          style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', color: accentColor }}>
          {value}
        </p>
        <p className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.4)' }}>
          {label}
        </p>
        {sub && <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.25)' }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   BET ROW — fila compacta de apuesta
────────────────────────────────────────────────────────── */
function BetRow({ bet }) {
  const matchCount  = bet.partidos?.length || 0
  const remaining   = timeLeft(bet.fecha_cierre)
  const closingSoon = remaining !== 'Cerrada' && !remaining.includes('d')
  const hasLive     = bet.partidos?.some(p => p.estado === 'en_vivo')

  return (
    <Link to="/apuestas"
      className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
      style={{
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.07)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(235,195,43,.07)'; e.currentTarget.style.borderColor = 'rgba(235,195,43,.3)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)' }}
    >
      {/* Dot status */}
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: hasLive ? '#ff4d6d' : '#ebc32b', boxShadow: hasLive ? '0 0 8px #ff4d6d' : '0 0 6px rgba(235,195,43,.6)' }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm text-white truncate">{bet.titulo}</p>
        <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.38)' }}>
          {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
          {bet.premio && <span> · 🏆 {bet.premio}</span>}
        </p>
      </div>

      {/* Time */}
      <span className="font-body text-xs font-semibold flex-shrink-0"
        style={{ color: closingSoon ? '#f5a623' : '#ebc32b' }}>
        {remaining}
      </span>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(235,195,43,.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 transition-transform group-hover:translate-x-1">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  )
}

/* ──────────────────────────────────────────────────────────
   LIVE CARD — partido en vivo destacado
────────────────────────────────────────────────────────── */
function LiveCard({ bet, predictions }) {
  const liveMatch = bet.partidos?.find(p => p.estado === 'en_vivo') || bet.partidos?.[0]
  const myPred    = liveMatch ? predictions[liveMatch.id] : null

  return (
    <div className="rounded-2xl p-4 md:p-5"
      style={{
        background: 'linear-gradient(145deg,rgba(66,91,139,.22),rgba(66,91,139,.06))',
        border: '1px solid rgba(255,61,109,.3)',
        boxShadow: '0 8px 28px rgba(0,0,0,.35), 0 0 24px rgba(255,61,109,.06)',
      }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#ff4d6d] animate-pulse-live" />
        <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#ff4d6d' }}>EN VIVO</span>
        <span className="font-body text-xs ml-auto truncate" style={{ color: 'rgba(255,255,255,.4)' }}>{bet.titulo}</span>
      </div>
      {liveMatch && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-body font-semibold text-white text-sm truncate">
              {liveMatch.equipo_local} <span style={{ color: 'rgba(255,255,255,.35)' }}>vs</span> {liveMatch.equipo_visitante}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' }} className="font-body mb-0.5">Mi pred.</p>
              <p className="font-display text-xl leading-none" style={{ color: '#ebc32b' }}>
                {myPred ? `${myPred.pred_local}-${myPred.pred_visitante}` : '—'}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,.1)' }} />
            <div className="text-center">
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' }} className="font-body mb-0.5">Real</p>
              <p className="font-display text-xl leading-none text-white">
                {liveMatch.goles_local ?? 0}-{liveMatch.goles_visitante ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   EMPTY STATE
────────────────────────────────────────────────────────── */
function Empty({ icon, text, sub, to, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl"
      style={{ background: 'rgba(66,91,139,.06)', border: '1px dashed rgba(235,195,43,.2)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.2)' }}>
        <div style={{ color: '#ebc32b' }}>{icon}</div>
      </div>
      <p className="font-body font-semibold text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{text}</p>
      {sub && <p className="font-body text-xs mt-1" style={{ color: 'rgba(255,255,255,.28)' }}>{sub}</p>}
      {to && cta && (
        <Link to={to} className="mt-4 inline-flex items-center gap-1.5 font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all"
          style={{ background: '#ebc32b', color: '#05090f', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b' }}>
          {cta}
        </Link>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   SECTION HEADER
────────────────────────────────────────────────────────── */
function SectionHead({ title, to, cta }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display" style={{ fontSize: '1.5rem', color: '#fff', letterSpacing: '.02em' }}>
        {title}
      </h2>
      {to && (
        <Link to={to} className="font-body font-semibold text-xs flex items-center gap-1.5 transition-colors"
          style={{ color: '#ebc32b', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f5d75a' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#ebc32b' }}>
          {cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth()
  const { bets, predictions } = useBets()

  const activeBets = bets.filter(b => isBetOpen(b))
  const liveBets   = bets.filter(b => b.partidos?.some(p => p.estado === 'en_vivo'))
  const myPredCount = Object.keys(predictions).length
  const nombre = (user?.nombre || '').split(' ')[0].toUpperCase()

  return (
    <AppLayout>

      {/* ═══════════════════════════════════════════
          HERO STRIP — bienvenida + stats rápidas
      ═══════════════════════════════════════════ */}
      <div className="rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden animate-fade-in"
        style={{
          background: 'linear-gradient(135deg,rgba(66,91,139,.35) 0%,rgba(12,24,43,.6) 100%)',
          border: '1px solid rgba(235,195,43,.2)',
          boxShadow: '0 12px 40px rgba(0,0,0,.4)',
        }}>
        {/* Decorativo gold glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(235,195,43,.12), transparent 65%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-live" />
              <span className="font-body font-bold text-xs uppercase tracking-widest"
                style={{ color: 'rgba(235,195,43,.7)' }}>
                Mundial 2026
              </span>
            </div>
            <h1 className="font-display leading-none mb-1"
              style={{ fontSize: 'clamp(2.2rem,6vw,3.5rem)', letterSpacing: '.02em' }}>
              <span className="text-white">HOLA, </span>
              <span style={{ color: '#ebc32b' }}>{nombre}</span>
            </h1>
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
              {activeBets.length > 0
                ? `Tenés ${activeBets.length} apuesta${activeBets.length > 1 ? 's' : ''} activa${activeBets.length > 1 ? 's' : ''} disponible${activeBets.length > 1 ? 's' : ''}.`
                : 'Acá está el resumen de tu actividad en Prode Talento.'}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Link to="/apuestas"
              className="inline-flex items-center gap-2 font-body font-bold text-sm px-5 py-3 rounded-full transition-all"
              style={{ background: '#ebc32b', color: '#05090f', boxShadow: '0 6px 20px rgba(235,195,43,.3)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' }}>
              Pronosticar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link to="/ranking"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm px-5 py-3 rounded-full transition-all"
              style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.4)'; e.currentTarget.style.color = '#ebc32b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}>
              Ranking
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          STAT CARDS — 4 en fila
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in delay-1">
        <StatCard
          label="Puntos totales"
          value="—"
          sub="Sin partidos finalizados"
          gold
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <StatCard
          label="Posición"
          value="—"
          sub="Ranking global"
          gold
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
        />
        <StatCard
          label="Predicciones"
          value={myPredCount || '—'}
          sub="Cargadas hasta ahora"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
        />
        <StatCard
          label="En vivo"
          value={liveBets.length}
          sub="Partidos ahora mismo"
          live={liveBets.length > 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>}
        />
      </div>

      {/* ═══════════════════════════════════════════
          LIVE AHORA (si hay)
      ═══════════════════════════════════════════ */}
      {liveBets.length > 0 && (
        <div className="mb-8 animate-fade-in delay-2">
          <SectionHead title="EN VIVO AHORA" />
          <div className="grid gap-3">
            {liveBets.map(bet => (
              <LiveCard key={bet.id} bet={bet} predictions={predictions} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          2-COLUMN: Apuestas activas + Accesos rápidos
      ═══════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-in delay-2">

        {/* ── Col principal: Apuestas activas ── */}
        <div className="lg:col-span-2">
          <SectionHead title="APUESTAS ACTIVAS" to="/apuestas" cta="Ver todas" />

          {activeBets.length === 0 ? (
            <Empty
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              text="No hay apuestas activas"
              sub="Aparecerán acá cuando el admin publique una."
              to="/apuestas"
              cta="Ver apuestas"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {activeBets.slice(0, 5).map(bet => <BetRow key={bet.id} bet={bet} />)}
              {activeBets.length > 5 && (
                <Link to="/apuestas" className="text-center font-body text-sm py-2 transition-colors"
                  style={{ color: 'rgba(235,195,43,.6)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(235,195,43,.6)' }}>
                  +{activeBets.length - 5} más →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Col lateral: Accesos rápidos ── */}
        <div>
          <SectionHead title="ACCESOS RÁPIDOS" />
          <div className="flex flex-col gap-3">
            {[
              { to: '/apuestas',          label: 'Apuestas',         sub: 'Cargá tus pronósticos',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
              { to: '/partidos',          label: 'Fixture',          sub: 'Partidos del Mundial',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { to: '/mis-predicciones',  label: 'Mis Predicciones', sub: 'Historial de pronósticos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { to: '/ranking',           label: 'Ranking',          sub: 'Tabla de posiciones',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
            ].map(({ to, label, sub, icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(235,195,43,.08)'; e.currentTarget.style.borderColor = 'rgba(235,195,43,.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(235,195,43,.1)', color: '#ebc32b' }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-white">{label}</p>
                  <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>{sub}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(235,195,43,.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0 transition-transform group-hover:translate-x-1">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </AppLayout>
  )
}