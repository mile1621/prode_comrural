const TABS = [
  {
    key: 'Apuestas',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  {
    key: 'Usuarios',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

export default function AdminTabs({ tab, setTab, pendingCount, betsCount, areasCount }) {
  const badges = {
    Usuarios: pendingCount,
    Apuestas: betsCount,
    Áreas:    areasCount,
  }

  return (
    <div className="mb-8 animate-fade-in delay-1">
      <div
        className="flex gap-1 p-1 rounded-2xl w-full overflow-x-auto"
        style={{
          background: '#fff',
          border: '1px solid #f0eadb',
          boxShadow: '0 1px 0 rgba(12,24,43,.04)',
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
                background: active ? '#0c182b' : 'transparent',
                color:      active ? '#ebc32b' : '#5f6e8a',
                boxShadow:  active ? '0 2px 8px rgba(12,24,43,.25)' : 'none',
                minWidth: 0,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#0c182b'; e.currentTarget.style.background = 'rgba(12,24,43,.04)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#5f6e8a'; e.currentTarget.style.background = 'transparent' } }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
              {key}
              {hasBadge && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: key === 'Usuarios' ? '#e03252' : '#ebc32b',
                    color:      key === 'Usuarios' ? '#fff'    : '#05090f',
                    boxShadow:  key === 'Usuarios' ? '0 2px 6px rgba(224,50,82,.4)' : '0 2px 6px rgba(235,195,43,.35)',
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
        style={{ background: 'linear-gradient(90deg,transparent,rgba(12,24,43,.08) 30%,rgba(12,24,43,.08) 70%,transparent)' }}
      />
    </div>
  )
}