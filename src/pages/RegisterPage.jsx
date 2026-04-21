import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'var(--violet-600)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'var(--gold-500)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded bg-[var(--color-bg-2)] border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">PNG</div>
            <h1 className="font-display text-5xl text-[var(--color-accent)] tracking-wider">
              PRODE<span className="text-[var(--color-text)]">ONE</span>
            </h1>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-md)]">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="font-display text-2xl mb-2">¡Registro enviado!</h2>
              <p className="text-sm text-[var(--color-text-muted)] font-body">
                Tu cuenta está pendiente de aprobación por el administrador.
                Te avisaremos cuando esté activa.
              </p>
              <Link
                to="/login"
                className="block mt-5 text-sm text-[var(--color-accent)] hover:underline font-body"
              >
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl mb-5">Crear cuenta</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nombre completo"
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                  autoFocus
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="tu@email.com"
                  required
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
                  Registrarme
                </Button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <p className="text-center text-sm text-[var(--color-text-muted)] font-body mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-[var(--color-accent)] hover:underline">
              Iniciá sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
