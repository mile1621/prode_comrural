import { useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const INITIAL = { titulo: '', type: 'por_equipos', premio: '', fecha_cierre: '', partidos_ids: [] }

export default function CreateBetForm({ onSubmit, loading, matches = [] }) {
  const [form, setForm] = useState(INITIAL)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleMatchToggle(id) {
    setForm(prev => ({
      ...prev,
      partidos_ids: prev.partidos_ids.includes(id) 
        ? prev.partidos_ids.filter(mId => mId !== id)
        : [...prev.partidos_ids, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.partidos_ids.length === 0) {
      alert("Seleccioná al menos un partido para la apuesta.")
      return
    }
    try {
      await onSubmit({
        titulo: form.titulo,
        tipo: form.type,
        premio: form.premio,
        fecha_cierre: form.fecha_cierre,
        partidos_ids: form.partidos_ids.join(',')
      })
      alert("Apuesta creada exitosamente")
      setForm(INITIAL)
    } catch(err) {
      alert("Error al crear apuesta: " + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Título de la apuesta" value={form.titulo} onChange={set('titulo')} required placeholder="Ej: Final Copa Libertadores" />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
          Seleccionar Partidos
        </label>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto bg-[var(--color-bg-2)] p-2 rounded-[var(--radius-md)] border border-[var(--color-border)]">
           {matches.length === 0 && <p className="text-xs text-[var(--color-text-faint)]">No hay partidos disponibles.</p>}
           {matches.map(m => (
             <label key={m.id} className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
               <input 
                 type="checkbox" 
                 checked={form.partidos_ids.includes(m.id)}
                 onChange={() => handleMatchToggle(m.id)}
                 className="accent-[var(--color-accent)] cursor-pointer w-4 h-4 rounded"
               />
               <span>{m.equipo_local} vs {m.equipo_visitante} <span className="text-[10px] text-[var(--color-text-muted)]">({m.estado})</span></span>
             </label>
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
          Tipo
        </label>
        <div className="flex gap-3">
          {['libre', 'por_equipos'].map(t => (
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
              {t === 'por_equipos' ? 'Equipos' : 'Libre'}
            </button>
          ))}
        </div>
      </div>

      <Input label="Premio / Incentivo" value={form.premio} onChange={set('premio')} required placeholder="Ej: Gift card $50" />
      <Input label="Fecha límite" type="datetime-local" value={form.fecha_cierre} onChange={set('fecha_cierre')} required />

      <Button type="submit" loading={loading} className="w-full mt-2">
        Crear Apuesta
      </Button>
    </form>
  )
}
