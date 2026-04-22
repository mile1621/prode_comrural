import { useState } from 'react'
import { Link } from 'react-router-dom'
import sheetsApi from '../services/sheetsApi.js'

export default function RegisterPage() {
  const [form, setForm]       = useState({ nombre: '', email: '', password: '' })
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await sheetsApi.auth.registro(form.nombre, form.email, form.password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[var(--color-bg)] relative overflow-hidden">

      {/* Fondo decorativo: glows cyan sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: 'var(--color-accent)', filter: 'blur(120px)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'var(--color-accent-bright)', filter: 'blur(120px)' }}
        />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">

        {/* Header: logo del cliente + marca */}
        <div className="text-center mb-8">

          <div
            className="inline-block px-4 py-2 rounded-full text-[10px] tracking-[0.2em] font-body font-semibold mb-6"
            style={{
              background: 'rgba(34,217,223,0.08)',
              border: '1px solid rgba(34,217,223,0.25)',
              color: 'var(--color-text-muted)'
            }}
          >
            LOGO DEL CLIENTE
          </div>

          <h1
            className="font-display text-6xl md:text-7xl text-white tracking-wider leading-none mb-3"
            style={{ textShadow: '0 4px 32px rgba(0,0,0,0.6)' }}
          >
            PRODE <span className="text-[var(--color-accent)]">ONE</span>
          </h1>

          <p className="text-sm text-[var(--color-text-muted)] font-body">
            Prode empresarial — Mundial 2026
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 md:p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(15,43,79,0.95) 0%, rgba(15,33,69,0.95) 100%)',
            border: '1px solid rgba(34,217,223,0.18)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(34,217,223,0.08)'
          }}
        >
          {done ? (
            /* ── Estado: registro completado ───────────── */
            <div className="text-center py-4">
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(34,217,223,0.12)',
                  border: '2px solid rgba(34,217,223,0.4)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide mb-3">
                ¡REGISTRO ENVIADO!
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] font-body leading-relaxed mb-6 max-w-xs mx-auto">
                Tu cuenta está pendiente de aprobación por el administrador.
                Te avisaremos por email cuando esté activa.
              </p>

              <Link
                to="/login"
                className="inline-block font-body font-semibold text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-bright)] transition-colors"
              >
                ← Volver al login
              </Link>
            </div>
          ) : (
            /* ── Estado: formulario ─────────────────────── */
            <>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide mb-6">
                CREAR CUENTA
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Nombre */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="nombre"
                    className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Juan Pérez"
                    required
                    autoFocus
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-lg text-sm font-body text-white outline-none transition-all placeholder:text-[var(--color-text-faint)]"
                    style={{
                      background: 'rgba(2,15,39,0.6)',
                      border: '1px solid var(--color-border)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="tu@empresa.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg text-sm font-body text-white outline-none transition-all placeholder:text-[var(--color-text-faint)]"
                    style={{
                      background: 'rgba(2,15,39,0.6)',
                      border: '1px solid var(--color-border)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg text-sm font-body text-white outline-none transition-all placeholder:text-[var(--color-text-faint)]"
                    style={{
                      background: 'rgba(2,15,39,0.6)',
                      border: '1px solid var(--color-border)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <p className="text-[10px] text-[var(--color-text-faint)] font-body mt-0.5">
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm font-body"
                    style={{
                      background: 'rgba(255,77,109,0.1)',
                      border: '1px solid rgba(255,77,109,0.3)',
                      color: 'var(--color-danger)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Botón Registrarme */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 font-body font-bold text-base py-3.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: loading
                      ? 'var(--color-accent-dim)'
                      : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                    color: '#020F27',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(34,217,223,0.35)',
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,217,223,0.55)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.35)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Link a login (solo si no se completó el registro) */}
        {!done && (
          <p className="text-center text-sm text-[var(--color-text-muted)] font-body mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-bright)] transition-colors"
            >
              Iniciá sesión
            </Link>
          </p>
        )}

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-[var(--color-text-faint)] font-body mt-8">
          Solo mayores de 18 años · Juego responsable
        </p>

      </div>
    </div>
  )
}
