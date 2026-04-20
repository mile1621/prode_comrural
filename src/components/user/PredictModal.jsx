import { useState } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

export default function PredictModal({ bet, onSubmit, onClose, loading }) {
  const [value, setValue] = useState('')

  if (!bet) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(bet.id, { value })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 w-full max-w-md shadow-[var(--shadow-md)] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl mb-1">{bet.title}</h2>
        <p className="text-sm text-[var(--color-text-muted)] font-body mb-5">
          Ingresá tu predicción antes de que cierre la apuesta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {bet.type === 'libre' ? (
            <Input
              label="Tu predicción"
              placeholder="Ej: River 2 - Flamengo 1"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                Elegí un equipo
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[bet.match?.home, bet.match?.away].filter(Boolean).map(team => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setValue(team)}
                    className={`
                      py-3 rounded-[var(--radius-md)] text-sm font-semibold font-body border transition-all
                      ${value === team
                        ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                      }
                    `}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={loading} disabled={!value.trim()}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
