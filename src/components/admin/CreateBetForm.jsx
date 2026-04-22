import { useState } from 'react'

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
      {/* Título de la apuesta */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bet-titulo"
          className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
        >
          Título de la apuesta
        </label>
        <input
          id="bet-titulo"
          type="text"
          value={form.titulo}
          onChange={set('titulo')}
          placeholder="Ej: Final Copa Libertadores"
          required
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

      {/* Selector de partidos */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Seleccionar partidos
          </label>
          {form.partidos_ids.length > 0 && (
            <span className="text-[10px] font-body text-[var(--color-text-muted)] uppercase tracking-wider">
              {form.partidos_ids.length} seleccionado{form.partidos_ids.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div
            className="rounded-lg p-5 text-center"
            style={{
              background: 'rgba(2,15,39,0.4)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <p className="text-xs text-[var(--color-text-muted)] font-body">
              No hay partidos disponibles todavía.
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-1.5 max-h-60 overflow-y-auto p-2 rounded-lg"
            style={{
              background: 'rgba(2,15,39,0.6)',
              border: '1px solid var(--color-border)',
            }}
          >
            {matches.map(m => {
              const selected = form.partidos_ids.includes(m.id)
              const isFinished = m.estado === 'finalizado'
              const isLive = m.estado === 'en_vivo'

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMatchToggle(m.id)}
                  disabled={isFinished}
                  className="flex items-center gap-3 p-2.5 rounded-md text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: selected ? 'rgba(34,217,223,0.1)' : 'transparent',
                    border: `1px solid ${selected ? 'rgba(34,217,223,0.4)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => {
                    if (!selected && !isFinished) {
                      e.currentTarget.style.background = 'rgba(34,217,223,0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!selected) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {/* Checkbox visual custom */}
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all"
                    style={{
                      background: selected
                        ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)'
                        : 'rgba(2,15,39,0.6)',
                      border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}
                  >
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#020F27" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Info del partido */}
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm text-white truncate">
                      {m.equipo_local} <span className="text-[var(--color-text-muted)]">vs</span> {m.equipo_visitante}
                    </p>
                  </div>

                  {/* Estado del partido */}
                  <span
                    className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-body font-bold uppercase tracking-wider"
                    style={{
                      color: isLive
                        ? 'var(--color-live)'
                        : isFinished
                          ? 'var(--color-warn)'
                          : 'var(--color-text-faint)',
                    }}
                  >
                    {isLive && <span className="w-1 h-1 rounded-full bg-[var(--color-live)] animate-pulse-live" />}
                    {isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : 'PROGRAMADO'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Tipo de apuesta */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
          Tipo de apuesta
        </label>
        <div
          className="inline-flex gap-1 p-1 rounded-lg w-full"
          style={{
            background: 'rgba(2,15,39,0.6)',
            border: '1px solid var(--color-border)',
          }}
        >
          {[
            { value: 'libre',       label: 'Libre',   desc: 'Pronóstico de resultado exacto' },
            { value: 'por_equipos', label: 'Equipos', desc: 'Pronóstico del equipo ganador' },
          ].map(t => {
            const active = form.type === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, type: t.value }))}
                className="flex-1 py-2.5 px-3 rounded-md text-xs font-body font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)'
                    : 'transparent',
                  color: active ? '#020F27' : 'var(--color-text-muted)',
                  boxShadow: active ? '0 4px 12px rgba(34,217,223,0.25)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-text)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-[var(--color-text-faint)] font-body">
          {form.type === 'libre'
            ? 'Los usuarios pronostican el resultado exacto (ej: 2-1).'
            : 'Los usuarios pronostican solo quién gana o empate.'}
        </p>
      </div>

      {/* Premio */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bet-premio"
          className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
        >
          Premio / Incentivo
        </label>
        <div className="relative">
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-warn)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <input
            id="bet-premio"
            type="text"
            value={form.premio}
            onChange={set('premio')}
            placeholder="Ej: Gift card $50.000"
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm font-body text-white outline-none transition-all placeholder:text-[var(--color-text-faint)]"
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
      </div>
      {/* Fecha límite */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bet-fecha"
          className="text-[10px] font-body font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
        >
          Fecha límite de apuesta
        </label>
        <input
          id="bet-fecha"
          type="datetime-local"
          value={form.fecha_cierre}
          onChange={set('fecha_cierre')}
          required
          className="w-full px-4 py-3 rounded-lg text-sm font-body text-white outline-none transition-all"
          style={{
            background: 'rgba(2,15,39,0.6)',
            border: '1px solid var(--color-border)',
            colorScheme: 'dark',
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
        <p className="text-[10px] text-[var(--color-text-faint)] font-body">
          A partir de esta hora los usuarios no podrán cargar más predicciones.
        </p>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={loading || form.partidos_ids.length === 0}
        className="w-full mt-2 font-body font-bold text-sm py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: (loading || form.partidos_ids.length === 0)
            ? 'var(--color-accent-dim)'
            : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
          color: '#020F27',
          boxShadow: (loading || form.partidos_ids.length === 0)
            ? 'none'
            : '0 6px 24px rgba(34,217,223,0.35)',
        }}
        onMouseEnter={e => {
          if (!loading && form.partidos_ids.length > 0) {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,217,223,0.55)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          if (!loading && form.partidos_ids.length > 0) {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.35)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Creando apuesta...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear apuesta
          </>
        )}
      </button>
    </form>
  )
}
