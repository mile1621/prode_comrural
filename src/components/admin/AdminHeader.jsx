export default function AdminHeader({ bets = [], pendingUsers = [] }) {
  const activeBets    = bets.filter(b => b.estado === 'abierta').length
  const closedBets    = bets.filter(b => b.estado === 'cerrada').length
  const finishedBets  = bets.filter(b => b.estado === 'finalizada').length
  const totalBets     = bets.length

  const stats = [
    { label: 'Total Apuestas', value: totalBets,    color: '#ebc32b',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { label: 'Activas',        value: activeBets,   color: '#22d9df',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/></svg> },
    { label: 'Finalizadas',    value: finishedBets, color: '#f5d75a',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: 'Pendientes',     value: pendingUsers.length, color: pendingUsers.length > 0 ? '#ff4d6d' : 'rgba(255,255,255,.35)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]

  return (
    <div className="mb-8 animate-fade-in">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-live" />
            <span
              className="font-body font-bold text-xs uppercase tracking-widest"
              style={{ color: 'rgba(235,195,43,.7)' }}
            >
              Panel de administración · Mundial 2026
            </span>
          </div>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', color: '#fff', letterSpacing: '.02em' }}
          >
            PANEL <span style={{ color: '#ebc32b' }}>ADMIN</span>
          </h1>
          <p className="font-body text-sm mt-1.5" style={{ color: 'rgba(255,255,255,.45)' }}>
            Gestioná apuestas, usuarios y áreas de la plataforma.
          </p>
        </div>

        {/* Badge Admin */}
        <div
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: 'rgba(235,195,43,.1)', border: '1px solid rgba(235,195,43,.35)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#ebc32b' }}>
            Administrador
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, color, icon }) => (
          <div
            key={label}
            className="rounded-xl p-4 flex items-center gap-3 transition-all"
            style={{
              background: 'linear-gradient(155deg,rgba(66,91,139,.18),rgba(66,91,139,.05))',
              border: '1px solid rgba(255,255,255,.07)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = '' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, color }}
            >
              {icon}
            </div>
            <div>
              <p className="font-display leading-none" style={{ fontSize: '1.6rem', color }}>
                {value}
              </p>
              <p className="font-body text-xs uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,.35)' }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}