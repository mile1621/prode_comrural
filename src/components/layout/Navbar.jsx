import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import Button from '../ui/Button.jsx'

const NAV_LINKS = [
  { to: '/',         label: 'Dashboard' },
  { to: '/apuestas', label: 'Apuestas' },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { pathname } = useLocation()

  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('theme-light'))

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('theme-light')
    } else {
      document.documentElement.classList.remove('theme-light')
    }
  }, [isLight])

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--color-border)]"
      style={{ background: 'rgba(12,13,15,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {/* Logo PNG a agregar por el usuario */}
          {/* <img src="/tu-logo.png" alt="Prode Logo" className="h-8 w-auto" /> */}
          <div className="w-8 h-8 rounded bg-[var(--color-bg-2)] border border-[var(--color-border)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)]">PNG</div>
          <span className="font-display text-2xl text-[var(--color-accent)] tracking-wider mt-1">
            PRODE<span className="text-[var(--color-text)]">ONE</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`
                px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium font-body
                transition-colors duration-[var(--transition-fast)]
                ${pathname === link.to
                  ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
              `}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`
                px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium font-body
                transition-colors duration-[var(--transition-fast)]
                ${pathname === '/admin'
                  ? 'bg-[var(--color-warn-dim)] text-[var(--color-warn)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-warn)]'}
              `}
            >
              ⚙ Admin
            </Link>
          )}
        </div>

        {/* Usuario y Controles */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsLight(!isLight)}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-warn)] transition-colors rounded"
            title="Alternar Tema"
          >
            {isLight ? '🌙' : '☀️'}
          </button>

          {user && (
            <>
              <span className="text-sm text-[var(--color-text-muted)] font-body hidden sm:block">
                {user.nombre}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
