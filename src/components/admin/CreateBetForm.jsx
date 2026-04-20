import { useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const INITIAL = { title: '', type: 'libre', prize: '', deadline: '', matchHome: '', matchAway: '' }

export default function CreateBetForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      match: { home: form.matchHome, away: form.matchAway, state: 'scheduled', homeScore: null, awayScore: null },
    })
    setForm(INITIAL)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Título de la apuesta" value={form.title} onChange={set('title')} required placeholder="Ej: Final Copa Libertadores" />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
          Tipo
        </label>
        <div className="flex gap-3">
          {['libre', 'equipos'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(p => ({ ...p, type: t }))}
              className={`
                flex-1 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold font-body border capitalize transition-all
                ${form.type === t
                  ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Equipo local" value={form.matchHome} onChange={set('matchHome')} placeholder="River Plate" />
        <Input label="Equipo visitante" value={form.matchAway} onChange={set('matchAway')} placeholder="Flamengo" />
      </div>

      <Input label="Premio / Incentivo" value={form.prize} onChange={set('prize')} required placeholder="Ej: Gift card $50" />
      <Input label="Fecha límite" type="datetime-local" value={form.deadline} onChange={set('deadline')} required />

      <Button type="submit" loading={loading} className="w-full mt-2">
        Crear Apuesta
      </Button>
    </form>
  )
}
