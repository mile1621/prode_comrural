import { useState, useMemo, useEffect } from 'react'
import sheetsApi from '../../services/sheetsApi.js'
import { useAuth } from '../../hooks/useAuth.jsx'

/* ── Constantes ─────────────────────────────────────────── */
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

function estaDisponible(m) { return m.estado === 'programado' }

function fmtFecha(f) {
  if (!f) return ''
  try {
    const d = new Date(f)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

/* ── Sub-componentes de UI internos ─────────────────────── */
function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body font-bold text-xs uppercase tracking-widest"
        style={{ color: 'rgba(235,195,43,.75)' }}>
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none transition-all"
        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(235,195,43,.55)'
          e.target.style.background  = 'rgba(235,195,43,.06)'
          e.target.style.boxShadow   = '0 0 0 3px rgba(235,195,43,.1)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,.1)'
          e.target.style.background  = 'rgba(255,255,255,.06)'
          e.target.style.boxShadow   = 'none'
        }}
      />
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap"
      style={{
        fontSize: 11,
        background: active ? '#ebc32b'    : 'rgba(255,255,255,.06)',
        border:     `1px solid ${active ? '#ebc32b' : 'rgba(255,255,255,.15)'}`,
        color:      active ? '#05090f'    : 'rgba(255,255,255,.55)',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(235,195,43,.4)'; e.currentTarget.style.color = 'rgba(255,255,255,.85)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' } }}
    >
      {children}
    </button>
  )
}

/* ── Componente principal ───────────────────────────────── */
export default function CreateBetForm({ onSubmit, loading, matches = [] }) {
  const { isPro } = useAuth()
  const [form, setForm] = useState(INITIAL)
  const [areas, setAreas] = useState([])
  const [filtroFase, setFiltroFase] = useState('todas')
  const [filtroJornada, setFiltroJornada] = useState('todas')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    sheetsApi.areas.listar(true).then(res => setAreas(res.areas || [])).catch(console.error)
  }, [])

  const partidosDisponibles = useMemo(
    () => matches.filter(m => !isTBD(m) && estaDisponible(m)),
    [matches]
  )

  const fasesDisponibles = useMemo(() => {
    const set = new Set(partidosDisponibles.map(m => m.fase).filter(Boolean))
    return ORDEN_FASES.filter(f => set.has(f))
  }, [partidosDisponibles])

  const gruposDisponibles = useMemo(() => {
    const rel = filtroFase === 'todas' ? partidosDisponibles : partidosDisponibles.filter(m => m.fase === filtroFase)
    return [...new Set(rel.map(m => m.grupo).filter(Boolean))].sort()
  }, [partidosDisponibles, filtroFase])

  const jornadasDisponibles = useMemo(() => {
    const rel = filtroFase === 'todas' ? partidosDisponibles : partidosDisponibles.filter(m => m.fase === filtroFase)
    return [...new Set(rel.map(m => m.jornada).filter(j => j !== '' && j !== null && j !== undefined).map(String))].sort()
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
      const g = m.grupo   ? `Grupo ${m.grupo}`    : ''
      const key = `${f}|${j}|${g}`
      if (!map[key]) map[key] = { fase: f, jornada: j, grupo: g, partidos: [] }
      map[key].partidos.push(m)
    })
    const order = new Map(ORDEN_FASES.map((f, i) => [f, i]))
    return Object.values(map).sort((a, b) => {
      const oa = order.get(a.fase) ?? 99, ob = order.get(b.fase) ?? 99
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
        ? prev.partidos_ids.filter(x => x !== id)
        : [...prev.partidos_ids, id]
    }))
  }

  function toggleVisibles() {
    const ids = partidosFiltrados.map(m => m.id)
    const todos = ids.every(id => form.partidos_ids.includes(id))
    setForm(prev => ({
      ...prev,
      partidos_ids: todos
        ? prev.partidos_ids.filter(id => !ids.includes(id))
        : [...new Set([...prev.partidos_ids, ...ids])]
    }))
  }

  function limpiarSeleccion() { setForm(prev => ({ ...prev, partidos_ids: [] })) }

  function handleChangeFase(f) { setFiltroFase(f); setFiltroJornada('todas'); setFiltroGrupo('todos') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.partidos_ids.length === 0) {
      alert('Seleccioná al menos un partido para la apuesta.')
      return
    }
    try {
      const payload = {
        titulo:       form.titulo,
        tipo:         form.type,
        premio:       form.premio,
        fecha_cierre: form.fecha_cierre,
        partidos_ids: form.partidos_ids.join(',')
      }
      if (isPro && form.type === 'grupos') {
        if (form.areas_ids.length < 2) { alert('Para apuestas por áreas seleccioná al menos 2 áreas.'); return }
        payload.areas_ids = form.areas_ids.join(',')
      }
      await onSubmit(payload)
      alert('Apuesta creada exitosamente')
      setForm(INITIAL)
      setFiltroFase('todas'); setFiltroJornada('todas'); setFiltroGrupo('todos'); setBusqueda('')
    } catch (err) { alert('Error al crear apuesta: ' + err.message) }
  }

  const canSubmit = !loading && seleccionados > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Título */}
      <Field
        label="Título de la apuesta"
        value={form.titulo}
        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
        required
        placeholder="Ej: Fase de grupos · Jornada 1"
      />

      {/* Partidos */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-body font-bold text-xs uppercase tracking-widest"
            style={{ color: 'rgba(235,195,43,.75)' }}>
            Partidos
          </span>
          <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>
            <span className="font-bold" style={{ color: '#ebc32b' }}>{seleccionados}</span>
            {' / '}{partidosDisponibles.length} seleccionados
          </span>
        </div>

        {/* Filtros */}
        {fasesDisponibles.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-body font-semibold uppercase w-14"
              style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em' }}>Fase</span>
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
            <span className="font-body font-semibold uppercase w-14"
              style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em' }}>Jornada</span>
            <FilterChip active={filtroJornada === 'todas'} onClick={() => setFiltroJornada('todas')}>Todas</FilterChip>
            {jornadasDisponibles.map(j => (
              <FilterChip key={j} active={filtroJornada === j} onClick={() => setFiltroJornada(j)}>{j}</FilterChip>
            ))}
          </div>
        )}

        {gruposDisponibles.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-body font-semibold uppercase w-14"
              style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em' }}>Grupo</span>
            <FilterChip active={filtroGrupo === 'todos'} onClick={() => setFiltroGrupo('todos')}>Todos</FilterChip>
            {gruposDisponibles.map(g => (
              <FilterChip key={g} active={filtroGrupo === g} onClick={() => setFiltroGrupo(g)}>{g}</FilterChip>
            ))}
          </div>
        )}

        {/* Búsqueda */}
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar equipo..."
          className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none transition-all"
          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(235,195,43,.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)' }}
          onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,.1)';  e.target.style.boxShadow = 'none' }}
        />

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2 text-xs font-body">
          <button type="button" onClick={toggleVisibles} disabled={partidosFiltrados.length === 0}
            className="transition-colors" style={{ color: '#ebc32b' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f5d75a' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#ebc32b' }}>
            {partidosFiltrados.every(m => form.partidos_ids.includes(m.id)) && partidosFiltrados.length > 0
              ? `✕ Deseleccionar visibles (${partidosFiltrados.length})`
              : `✓ Seleccionar visibles (${partidosFiltrados.length})`}
          </button>
          {seleccionados > 0 && (
            <button type="button" onClick={limpiarSeleccion}
              className="transition-colors" style={{ color: 'rgba(255,255,255,.4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff4d6d' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.4)' }}>
              Limpiar selección
            </button>
          )}
        </div>

        {/* Lista de partidos */}
        <div className="max-h-72 overflow-y-auto rounded-xl"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
          {agrupados.length === 0 ? (
            <p className="font-body text-xs text-center p-4" style={{ color: 'rgba(255,255,255,.3)' }}>
              No hay partidos que coincidan.
            </p>
          ) : agrupados.map(gr => {
            const header = [LABEL_FASE[gr.fase] || gr.fase, gr.jornada, gr.grupo].filter(Boolean).join(' · ')
            return (
              <div key={`${gr.fase}-${gr.jornada}-${gr.grupo}`}>
                {/* Subheader de grupo */}
                <div className="px-3 py-1.5 flex items-center justify-between sticky top-0 z-10"
                  style={{ background: 'rgba(12,24,43,.9)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span className="font-body font-semibold uppercase"
                    style={{ fontSize: 10, color: 'rgba(235,195,43,.6)', letterSpacing: '.1em' }}>
                    {header}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{gr.partidos.length}</span>
                </div>

                {gr.partidos.map(m => {
                  const checked = form.partidos_ids.includes(m.id)
                  return (
                    <label key={m.id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
                      style={{
                        background: checked ? 'rgba(235,195,43,.1)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,.04)',
                      }}
                      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Custom checkbox visual */}
                      <span className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          border: `1.5px solid ${checked ? '#ebc32b' : 'rgba(255,255,255,.25)'}`,
                          background: checked ? '#ebc32b' : 'transparent',
                          transition: 'all .15s',
                        }}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#05090f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMatch(m.id)}
                        className="sr-only"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-body text-sm" style={{ color: '#fff' }}>
                          {m.bandera_local && <img src={m.bandera_local} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_local}</span>
                          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>vs</span>
                          {m.bandera_visitante && <img src={m.bandera_visitante} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_visitante}</span>
                        </div>
                      </div>
                      <span className="font-body whitespace-nowrap" style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
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

      {/* Tipo — solo Plan Pro */}
      {isPro && (
        <div className="flex flex-col gap-1.5">
          <span className="font-body font-bold text-xs uppercase tracking-widest"
            style={{ color: 'rgba(235,195,43,.75)' }}>
            Tipo
          </span>
          <div className="flex gap-2">
            {['libre', 'grupos'].map(t => {
              const active = form.type === t
              return (
                <button key={t} type="button"
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-all"
                  style={{
                    background: active ? 'rgba(235,195,43,.12)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${active ? 'rgba(235,195,43,.5)' : 'rgba(255,255,255,.1)'}`,
                    color: active ? '#ebc32b' : 'rgba(255,255,255,.55)',
                  }}>
                  {t === 'grupos' ? 'Por Áreas' : 'Libre'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Áreas — solo Plan Pro y tipo grupos */}
      {isPro && form.type === 'grupos' && (
        <div className="flex flex-col gap-2 p-3 rounded-xl"
          style={{ border: '1px solid rgba(235,195,43,.2)', background: 'rgba(235,195,43,.04)' }}>
          <span className="font-body font-bold text-xs uppercase tracking-widest"
            style={{ color: 'rgba(235,195,43,.75)' }}>
            Áreas participantes (Mín. 2)
          </span>
          <div className="flex flex-wrap gap-2">
            {areas.map(a => {
              const active = form.areas_ids.includes(a.id)
              return (
                <FilterChip key={a.id} active={active}
                  onClick={() => setForm(p => ({
                    ...p,
                    areas_ids: active
                      ? p.areas_ids.filter(id => id !== a.id)
                      : [...p.areas_ids, a.id]
                  }))}>
                  {a.nombre}
                </FilterChip>
              )
            })}
          </div>
        </div>
      )}

      {/* Premio + Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Premio / Incentivo"
          value={form.premio}
          onChange={e => setForm(p => ({ ...p, premio: e.target.value }))}
          required
          placeholder="Ej: Gift card $50"
        />
        <Field
          label="Fecha límite"
          type="datetime-local"
          value={form.fecha_cierre}
          onChange={e => setForm(p => ({ ...p, fecha_cierre: e.target.value }))}
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full mt-1 py-3.5 rounded-full font-body font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#ebc32b' : 'rgba(235,195,43,.3)',
          color: '#05090f',
          boxShadow: canSubmit ? '0 6px 24px rgba(235,195,43,.28)' : 'none',
        }}
        onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.background = '#f5d75a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.transform = '' } }}
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin .8s linear infinite' }} />Creando...</>
          : <>Crear Apuesta{seleccionados > 0 && ` · ${seleccionados} partidos`}</>
        }
      </button>
    </form>
  )
}