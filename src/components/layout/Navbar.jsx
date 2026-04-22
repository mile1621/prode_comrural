import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/apuestas', label: 'Apuestas' },
  { to: '/partidos', label: 'Partidos' },
]

const ADMIN_LINKS = [
  { to: '/admin', label: 'Admin' },
  { to: '/ranking', label: 'Ranking' },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--color-border)]"
      style={{ background: 'rgba(2,15,39,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4 md:gap-6">

        {/* Logo del cliente + marca */}
        <Link to="/dashboard" className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[var(--color-text-muted)] text-[10px] tracking-widest font-body whitespace-nowrap">
            LOGO EMPRESA
          </div>
          <div className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />
          <span className="font-display text-xl text-[var(--color-accent)] tracking-wider whitespace-nowrap">
            PRODE<span className="text-[var(--color-text)]">ONE</span>
          </span>
        </Link>

        {/* Links de navegación */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                px-3 py-1.5 rounded-md text-sm font-medium font-body whitespace-nowrap
                transition-colors duration-[var(--transition-fast)]
                ${isActive
                  ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
              `}
            >
              {link.label}
            </NavLink>
          ))}

          {isAdmin && ADMIN_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                px-3 py-1.5 rounded-md text-sm font-medium font-body whitespace-nowrap
                transition-colors duration-[var(--transition-fast)]
                ${isActive
                  ? 'bg-[var(--color-warn-dim)] text-[var(--color-warn)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-warn)]'}
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user && (
            <>
              <span className="text-sm text-[var(--color-text-muted)] font-body hidden sm:block">
                {user.nombre}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm font-body font-medium rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}