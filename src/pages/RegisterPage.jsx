import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // TODO: conectar con authService.register(form.name, form.email, form.password)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-[var(--color-accent)]">
            PRODE<span className="text-white">ONE</span>
          </h1>
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
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
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
