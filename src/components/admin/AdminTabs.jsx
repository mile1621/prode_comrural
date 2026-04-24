const TABS = [
  {
    key: 'Apuestas',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  {
    key: 'Usuarios',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    key: 'Áreas',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/></svg>,
  },
  {
    key: 'Partidos',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
]

export default function AdminTabs({ tab, setTab, pendingCount, betsCount, areasCount }) {
  const badges = {
    Usuarios: pendingCount,
    Apuestas: betsCount,
    Áreas: areasCount,
  }

  return (
    <div className="mb-8 animate-fade-in delay-1">
      {/* Mobile: scrollable row; Desktop: inline pills */}
      <div
        className="flex gap-1.5 p-1.5 rounded-2xl w-full overflow-x-auto"
        style={{
          background: 'rgba(12,24,43,.8)',
          border: '1px solid rgba(235,195,43,.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {TABS.map(({ key, icon }) => {
          const active   = tab === key
          const badge    = badges[key]
          const hasBadge = badge > 0

          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative flex items-center gap-2 px-4 py-2.5 text-xs font-body font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: active
                  ? 'linear-gradient(135deg, #ebc32b 0%, #c99f16 100%)'
                  : 'transparent',
                color:     active ? '#05090f' : 'rgba(255,255,255,.5)',
                boxShadow: active ? '0 4px 16px rgba(235,195,43,.3)' : 'none',
                minWidth: 0,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,.85)'; e.currentTarget.style.background = 'rgba(255,255,255,.05)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,.5)';  e.currentTarget.style.background = 'transparent' } }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
              {key}
              {hasBadge && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: key === 'Usuarios' ? '#ff4d6d' : '#ebc32b',
                    color:      key === 'Usuarios' ? '#fff'    : '#05090f',
                    boxShadow:  key === 'Usuarios' ? '0 2px 8px rgba(255,77,109,.5)' : '0 2px 8px rgba(235,195,43,.4)',
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active tab indicator line */}
      <div
        className="h-px mt-0 mb-0"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(235,195,43,.2) 30%,rgba(235,195,43,.2) 70%,transparent)' }}
      />
    </div>
  )
}