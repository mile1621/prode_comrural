import CreateBetForm from './CreateBetForm.jsx'
import { isBetOpen, timeLeft } from '../../utils/index.js'

function getBetStatus(bet) {
  if (bet.estado === 'abierta' && isBetOpen(bet))
    return { color: '#22d9df', bg: 'rgba(34,217,223,.1)', border: 'rgba(34,217,223,.3)', label: 'Activa', dot: true }
  if (bet.estado === 'finalizada')
    return { color: '#ebc32b', bg: 'rgba(235,195,43,.1)', border: 'rgba(235,195,43,.3)', label: 'Finalizada', dot: false }
  if (bet.estado === 'cerrada')
    return { color: 'rgba(255,255,255,.4)', bg: 'rgba(66,91,139,.12)', border: 'rgba(66,91,139,.3)', label: 'Cerrada', dot: false }
  return { color: 'rgba(255,255,255,.4)', bg: 'rgba(66,91,139,.12)', border: 'rgba(66,91,139,.25)', label: bet.estado || '—', dot: false }
}

function BetRow({ bet, onClose, onFinalize }) {
  const status     = getBetStatus(bet)
  const matchCount = bet.partidos_ids ? bet.partidos_ids.split(',').filter(Boolean).length : (bet.partidos?.length || 0)
  const remaining  = bet.fecha_cierre ? timeLeft(bet.fecha_cierre) : null
  const isOpen     = isBetOpen(bet)

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: 'linear-gradient(155deg,rgba(66,91,139,.18),rgba(66,91,139,.05))',
        border: `1px solid ${status.border}`,
        boxShadow: '0 6px 20px rgba(0,0,0,.25)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,.35)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.25)' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
            >
              {status.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }} />}
              {status.label}
            </span>
            {/* Type badge */}
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.1)' }}
            >
              {bet.tipo === 'grupos' ? 'Áreas' : 'Libre'}
            </span>
          </div>

          <p className="font-display text-lg text-white truncate" style={{ letterSpacing: '.01em' }}>
            {bet.titulo}
          </p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {matchCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-body" style={{ color: 'rgba(255,255,255,.4)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
              </span>
            )}
            {bet.premio && (
              <span className="flex items-center gap-1 text-xs font-body" style={{ color: 'rgba(235,195,43,.6)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                {bet.premio}
              </span>
            )}
            {remaining && isOpen && (
              <span className="flex items-center gap-1 text-xs font-body" style={{ color: 'rgba(255,255,255,.35)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Cierra en {remaining}
              </span>
            )}
            {bet.participantes > 0 && (
              <span className="text-xs font-body" style={{ color: 'rgba(235,195,43,.5)' }}>
                {bet.participantes} participantes
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {isOpen && onClose && (
            <button
              onClick={() => onClose(bet.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-semibold transition-all"
              style={{ fontSize: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.55)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,109,.4)'; e.currentTarget.style.color = '#ff4d6d'; e.currentTarget.style.background = 'rgba(255,77,109,.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}
            >
              Cerrar
            </button>
          )}
          {bet.estado === 'cerrada' && onFinalize && (
            <button
              onClick={() => onFinalize(bet.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-body font-bold transition-all"
              style={{ fontSize: 11, background: 'rgba(235,195,43,.12)', border: '1px solid rgba(235,195,43,.4)', color: '#ebc32b' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.12)'; e.currentTarget.style.color = '#ebc32b' }}
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BetsTab({ bets, loading, createBet, matches, closeBet, finalizeBet }) {
  const openBets     = bets.filter(b => isBetOpen(b))
  const closedBets   = bets.filter(b => b.estado === 'cerrada' && !isBetOpen(b))
  const finishedBets = bets.filter(b => b.estado === 'finalizada')

  async function handleClose(id) {
    if (!window.confirm('¿Cerrar esta apuesta? Los usuarios ya no podrán cargar predicciones.')) return
    try { await closeBet(id) }
    catch (e) { alert('Error al cerrar: ' + e.message) }
  }

  async function handleFinalize(id) {
    if (!window.confirm('¿Finalizar esta apuesta? Esto calculará los puntajes finales.')) return
    try { await finalizeBet(id) }
    catch (e) { alert('Error al finalizar: ' + e.message) }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in delay-2">

      {/* ── Formulario nueva apuesta ── */}
      <div
        className="rounded-2xl p-6 h-fit"
        style={{
          background: 'linear-gradient(155deg,rgba(66,91,139,.22),rgba(66,91,139,.05))',
          border: '1px solid rgba(235,195,43,.2)',
          boxShadow: '0 10px 30px rgba(0,0,0,.3)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(235,195,43,.12)', border: '1px solid rgba(235,195,43,.25)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-white" style={{ letterSpacing: '.02em' }}>
            NUEVA APUESTA
          </h2>
        </div>
        <CreateBetForm onSubmit={createBet} loading={loading} matches={matches} />
      </div>

      {/* ── Lista de apuestas ── */}
      <div className="flex flex-col gap-5">

        {loading && bets.length === 0 && (
          <div className="text-center py-16">
            <span className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-sm mt-3" style={{ color: 'rgba(255,255,255,.4)' }}>Cargando apuestas...</p>
          </div>
        )}

        {!loading && bets.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'rgba(66,91,139,.08)', border: '1px dashed rgba(235,195,43,.2)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(235,195,43,.08)', border: '1px solid rgba(235,195,43,.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <p className="font-body text-sm font-semibold" style={{ color: 'rgba(255,255,255,.5)' }}>Todavía no creaste apuestas.</p>
            <p className="font-body text-xs mt-1" style={{ color: 'rgba(255,255,255,.3)' }}>Usá el formulario para crear la primera.</p>
          </div>
        )}

        {/* Activas */}
        {openBets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d9df]" style={{ boxShadow: '0 0 6px #22d9df' }} />
              <h3 className="font-display text-xl text-white" style={{ letterSpacing: '.02em' }}>ACTIVAS</h3>
              <span className="font-display text-lg" style={{ color: '#22d9df' }}>({openBets.length})</span>
            </div>
            <div className="flex flex-col gap-3">
              {openBets.map(bet => (
                <BetRow key={bet.id} bet={bet} onClose={handleClose} />
              ))}
            </div>
          </div>
        )}

        {/* Cerradas */}
        {closedBets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display text-xl text-white" style={{ letterSpacing: '.02em' }}>CERRADAS</h3>
              <span className="font-display text-lg" style={{ color: 'rgba(255,255,255,.4)' }}>({closedBets.length})</span>
            </div>
            <div className="flex flex-col gap-3">
              {closedBets.map(bet => (
                <BetRow key={bet.id} bet={bet} onFinalize={handleFinalize} />
              ))}
            </div>
          </div>
        )}

        {/* Finalizadas */}
        {finishedBets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display text-xl text-white" style={{ letterSpacing: '.02em' }}>FINALIZADAS</h3>
              <span className="font-display text-lg" style={{ color: '#ebc32b' }}>({finishedBets.length})</span>
            </div>
            <div className="flex flex-col gap-3">
              {finishedBets.map(bet => (
                <BetRow key={bet.id} bet={bet} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}