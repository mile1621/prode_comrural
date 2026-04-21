import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (_) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'var(--violet-600)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'var(--gold-500)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <div className="w-10 h-10 rounded bg-[var(--color-bg-2)] border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">PNG</div>
            <h1 className="font-display text-5xl text-[var(--color-accent)] tracking-wider">
              PRODE<span className="text-[var(--color-text)]">ONE</span>
            </h1>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-body">
            Plataforma de apuestas deportivas
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="font-display text-2xl mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="tu@email.com"
              required
              autoFocus
            />
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-[var(--color-danger)] font-body bg-[var(--color-danger-dim)] px-3 py-2 rounded-[var(--radius-sm)]">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] font-body mt-4">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-[var(--color-accent)] hover:underline">
            Registrate
          </Link>
        </p>

        {/* Hint de desarrollo */}
        <div className="mt-6 bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 text-xs text-[var(--color-text-muted)] font-body">
          <p className="font-semibold text-[var(--color-warn)] mb-1">🧪 Demo</p>
          <p>Admin: <code className="text-[var(--color-accent)]">admin@prode.one</code></p>
          <p>User: <code className="text-[var(--color-accent)]">juan@prode.one</code></p>
          <p className="mt-1 text-[var(--color-text-faint)]">Cualquier contraseña</p>
        </div>
      </div>
    </div>
  )
}
