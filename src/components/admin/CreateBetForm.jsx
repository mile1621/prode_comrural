import { useState, useMemo, useEffect } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import sheetsApi from '../../services/sheetsApi.js'

const INITIAL = { titulo: '', type: 'libre', premio: '', fecha_cierre: '', partidos_ids: [], areas_ids: [] }

const ORDEN_FASES = ['grupos', '16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const LABEL_FASE = {
  grupos: 'Grupos', '16avos': '16avos', octavos: 'Octavos',
  cuartos: 'Cuartos', semis: 'Semis', '3er_puesto': '3er puesto', final: 'Final'
}

function isTBD(m) {
  return !m.equipo_local || !m.equipo_visitante ||
    m.equipo_local === 'TBD' || m.equipo_visitante === 'TBD' ||
    m.codigo_local === 'TBD' || m.codigo_visitante === 'TBD'
}

function estaDisponible(m) {
  return m.estado === 'programado'
}

function fmtFecha(f) {
  if (!f) return ''
  try {
    const d = new Date(f)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function CreateBetForm({ onSubmit, loading, matches = [] }) {
  const [form, setForm] = useState(INITIAL)
  const [filtroFase, setFiltroFase] = useState('todas')
  const [areas, setAreas] = useState([])

  useEffect(() => {
    sheetsApi.areas.listar(true).then(res => setAreas(res.areas || [])).catch(console.error)
  }, [])
  const [filtroJornada, setFiltroJornada] = useState('todas')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const partidosDisponibles = useMemo(
    () => matches.filter(m => !isTBD(m) && estaDisponible(m)),
    [matches]
  )

  const fasesDisponibles = useMemo(() => {
    const set = new Set(partidosDisponibles.map(m => m.fase).filter(Boolean))
    return ORDEN_FASES.filter(f => set.has(f))
  }, [partidosDisponibles])

  const gruposDisponibles = useMemo(() => {
    const relevantes = filtroFase === 'todas'
      ? partidosDisponibles
      : partidosDisponibles.filter(m => m.fase === filtroFase)
    const set = new Set(relevantes.map(m => m.grupo).filter(Boolean))
    return [...set].sort()
  }, [partidosDisponibles, filtroFase])

  const jornadasDisponibles = useMemo(() => {
    const relevantes = filtroFase === 'todas'
      ? partidosDisponibles
      : partidosDisponibles.filter(m => m.fase === filtroFase)
    const set = new Set(
      relevantes
        .map(m => m.jornada)
        .filter(j => j !== '' && j !== null && j !== undefined)
        .map(String)
    )
    return [...set].sort()
  }, [partidosDisponibles, filtroFase])

  const partidosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return partidosDisponibles.filter(m => {
      if (filtroFase !== 'todas' && m.fase !== filtroFase) return false
      if (filtroJornada !== 'todas' && String(m.jornada) !== filtroJornada) return false
      if (filtroGrupo !== 'todos' && m.grupo !== filtroGrupo) return false
      if (q && !(`${m.equipo_local} ${m.equipo_visitante}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [partidosDisponibles, filtroFase, filtroJornada, filtroGrupo, busqueda])

  const agrupados = useMemo(() => {
    const map = {}
    partidosFiltrados.forEach(m => {
      const f = m.fase || 'otros'
      const j = m.jornada ? `Jornada ${m.jornada}` : ''
      const g = m.grupo ? `Grupo ${m.grupo}` : ''
      const key = `${f}|${j}|${g}`
      if (!map[key]) map[key] = { fase: f, jornada: j, grupo: g, partidos: [] }
      map[key].partidos.push(m)
    })
    const ordenFase = new Map(ORDEN_FASES.map((f, i) => [f, i]))
    return Object.values(map).sort((a, b) => {
      const oa = ordenFase.get(a.fase) ?? 99
      const ob = ordenFase.get(b.fase) ?? 99
      if (oa !== ob) return oa - ob
      if (a.jornada !== b.jornada) return a.jornada.localeCompare(b.jornada)
      return a.grupo.localeCompare(b.grupo)
    })
  }, [partidosFiltrados])

  const seleccionados = form.partidos_ids.length

  function toggleMatch(id) {
    setForm(prev => ({
      ...prev,
      partidos_ids: prev.partidos_ids.includes(id)
        ? prev.partidos_ids.filter(mId => mId !== id)
        : [...prev.partidos_ids, id]
    }))
  }

  function toggleVisibles() {
    const visiblesIds = partidosFiltrados.map(m => m.id)
    const todosYaSeleccionados = visiblesIds.every(id => form.partidos_ids.includes(id))
    setForm(prev => ({
      ...prev,
      partidos_ids: todosYaSeleccionados
        ? prev.partidos_ids.filter(id => !visiblesIds.includes(id))
        : [...new Set([...prev.partidos_ids, ...visiblesIds])]
    }))
  }

  function limpiarSeleccion() {
    setForm(prev => ({ ...prev, partidos_ids: [] }))
  }

  function handleChangeFase(nuevaFase) {
    setFiltroFase(nuevaFase)
    setFiltroJornada('todas')
    setFiltroGrupo('todos')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.partidos_ids.length === 0) {
      alert('Seleccioná al menos un partido para la apuesta.')
      return
    }
    try {
      const payload = {
        titulo: form.titulo,
        tipo: form.type,
        premio: form.premio,
        fecha_cierre: form.fecha_cierre,
        partidos_ids: form.partidos_ids.join(',')
      }
      if (form.type === 'grupos') {
        if (form.areas_ids.length < 2) {
          alert('Para apuestas por áreas seleccioná al menos 2 áreas.')
          return
        }
        payload.areas_ids = form.areas_ids.join(',')
      }
      await onSubmit(payload)
      alert('Apuesta creada exitosamente')
      setForm(INITIAL)
      setFiltroFase('todas')
      setFiltroJornada('todas')
      setFiltroGrupo('todos')
      setBusqueda('')
    } catch (err) {
      alert('Error al crear apuesta: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Título de la apuesta"
        value={form.titulo}
        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
        required
        placeholder="Ej: Fase de grupos · Jornada 1"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
            Partidos
          </label>
          <span className="text-xs font-body text-[var(--color-text-muted)]">
            <span className="text-[var(--color-accent)] font-semibold">{seleccionados}</span>
            {' / '}{partidosDisponibles.length} seleccionados
          </span>
        </div>

        {fasesDisponibles.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Fase</span>
            <FilterChip active={filtroFase === 'todas'} onClick={() => handleChangeFase('todas')}>Todas</FilterChip>
            {fasesDisponibles.map(f => (
              <FilterChip key={f} active={filtroFase === f} onClick={() => handleChangeFase(f)}>
                {LABEL_FASE[f] || f}
              </FilterChip>
            ))}
          </div>
        )}

        {jornadasDisponibles.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Jornada</span>
            <FilterChip active={filtroJornada === 'todas'} onClick={() => setFiltroJornada('todas')}>Todas</FilterChip>
            {jornadasDisponibles.map(j => (
              <FilterChip key={j} active={filtroJornada === j} onClick={() => setFiltroJornada(j)}>{j}</FilterChip>
            ))}
          </div>
        )}

        {gruposDisponibles.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Grupo</span>
            <FilterChip active={filtroGrupo === 'todos'} onClick={() => setFiltroGrupo('todos')}>Todos</FilterChip>
            {gruposDisponibles.map(g => (
              <FilterChip key={g} active={filtroGrupo === g} onClick={() => setFiltroGrupo(g)}>{g}</FilterChip>
            ))}
          </div>
        )}

        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar equipo..."
          className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--color-text)] font-body placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
        />

        <div className="flex items-center justify-between gap-2 text-xs font-body">
          <button
            type="button"
            onClick={toggleVisibles}
            className="text-[var(--color-accent)] hover:underline"
            disabled={partidosFiltrados.length === 0}
          >
            {partidosFiltrados.every(m => form.partidos_ids.includes(m.id)) && partidosFiltrados.length > 0
              ? `✕ Deseleccionar visibles (${partidosFiltrados.length})`
              : `✓ Seleccionar visibles (${partidosFiltrados.length})`}
          </button>
          {seleccionados > 0 && (
            <button type="button" onClick={limpiarSeleccion} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
              Limpiar selección
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto bg-[var(--color-bg-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {agrupados.length === 0 && (
            <p className="text-xs text-[var(--color-text-faint)] font-body p-4 text-center">
              No hay partidos que coincidan con los filtros.
            </p>
          )}
          {agrupados.map(g => {
            const faseLabel = LABEL_FASE[g.fase] || g.fase
            const header = [faseLabel, g.jornada, g.grupo].filter(Boolean).join(' · ')
            return (
              <div key={`${g.fase}-${g.jornada}-${g.grupo}`}>
                <div className="bg-[var(--color-bg-3)] px-3 py-1.5 flex items-center justify-between sticky top-0 z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                    {header}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-faint)] font-body">
                    {g.partidos.length}
                  </span>
                </div>
                {g.partidos.map(m => {
                  const checked = form.partidos_ids.includes(m.id)
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-[var(--color-accent-glow)]' : 'hover:bg-[var(--color-bg-3)]'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMatch(m.id)}
                        className="accent-[var(--color-accent)] cursor-pointer w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text)] font-body">
                          {m.bandera_local && <img src={m.bandera_local} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_local}</span>
                          <span className="text-[var(--color-text-faint)] text-xs">vs</span>
                          {m.bandera_visitante && <img src={m.bandera_visitante} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_visitante}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-faint)] font-body whitespace-nowrap">
                        {fmtFecha(m.fecha_partido)}
                      </span>
                    </label>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
          Tipo
        </label>
        <div className="flex gap-2">
          {['libre', 'grupos'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(p => ({ ...p, type: t }))}
              className={`
                flex-1 py-2 rounded-md font-semibold text-sm font-body border transition-colors
                ${form.type === t
                  ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'}
              `}
            >
              {t === 'grupos' ? 'Por Áreas' : 'Libre'}
            </button>
          ))}
        </div>
      </div>

      {form.type === 'grupos' && (
        <div className="flex flex-col gap-2 mt-1 mb-2 p-3 border border-[var(--color-border-soft)] bg-black/20 rounded-lg">
          <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)] font-body">
            Seleccionar áreas participantes (Mín. 2)
          </p>
          <div className="flex flex-wrap gap-2">
            {areas.map(a => {
              const isActive = form.areas_ids.includes(a.id)
              return (
                <FilterChip
                  key={a.id}
                  active={isActive}
                  onClick={() => {
                    setForm(p => ({
                      ...p,
                      areas_ids: isActive
                        ? p.areas_ids.filter(id => id !== a.id)
                        : [...p.areas_ids, a.id]
                    }))
                  }}
                >
                  {a.nombre}
                </FilterChip>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Premio / Incentivo"
          value={form.premio}
          onChange={e => setForm(p => ({ ...p, premio: e.target.value }))}
          required
          placeholder="Ej: Gift card $50"
        />
        <Input
          label="Fecha límite"
          type="datetime-local"
          value={form.fecha_cierre}
          onChange={e => setForm(p => ({ ...p, fecha_cierre: e.target.value }))}
          required
        />
      </div>

      <Button type="submit" loading={loading} className="w-full mt-2">
        Crear Apuesta{seleccionados > 0 && ` (${seleccionados} partidos)`}
      </Button>
    </form>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-2.5 py-1 rounded-full text-[11px] font-semibold font-body border transition-all
        ${active
          ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]'
          : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]'}
      `}
    >
      {children}
    </button>
  )
}