import { useState, useMemo } from 'react'
import sheetsApi from '../../services/sheetsApi.js'

const ORDEN_FASES = ['grupos', '16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const LABEL_FASE = {
  grupos: 'Fase de Grupos', '16avos': '16avos de Final', octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final', semis: 'Semifinales', '3er_puesto': '3er Puesto', final: 'Final'
}

function fmtFecha(f) {
  if (!f) return '—'
  try {
    const d = new Date(f)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  } catch { return f }
}

const ESTADO_COLORS = {
  programado:  { color: 'rgba(255,255,255,.45)', bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.12)', label: 'Programado' },
  en_vivo:     { color: '#ff4d6d',               bg: 'rgba(255,77,109,.12)', border: 'rgba(255,77,109,.35)',  label: 'EN VIVO' },
  finalizado:  { color: '#ebc32b',               bg: 'rgba(235,195,43,.1)',  border: 'rgba(235,195,43,.3)',   label: 'Finalizado' },
  cancelado:   { color: 'rgba(255,255,255,.3)',   bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)', label: 'Cancelado' },
}

function EditScoreModal({ match, onClose, onSave }) {
  const [local,    setLocal   ] = useState(String(match.goles_local    ?? ''))
  const [visitante, setVisit  ] = useState(String(match.goles_visitante ?? ''))
  const [estado,   setEstado  ] = useState(match.estado || 'programado')
  const [saving,   setSaving  ] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await sheetsApi.partidos.actualizar({
        partido_id:       match.id,
        goles_local:      local !== '' ? parseInt(local) : null,
        goles_visitante:  visitante !== '' ? parseInt(visitante) : null,
        estado,
      })
      onSave()
      onClose()
    } catch (e) {
      alert('Error actualizando partido: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(2,15,39,.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'linear-gradient(145deg,rgba(15,43,79,.98),rgba(15,33,69,.98))',
          border: '1px solid rgba(235,195,43,.25)',
          boxShadow: '0 25px 80px rgba(0,0,0,.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-white" style={{ letterSpacing: '.02em' }}>EDITAR RESULTADO</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,109,.1)'; e.currentTarget.style.color = '#ff4d6d' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Equipos */}
        <p className="font-body text-sm text-center mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
          <span className="text-white font-semibold">{match.equipo_local}</span>
          <span style={{ color: 'rgba(255,255,255,.3)' }}> vs </span>
          <span className="text-white font-semibold">{match.equipo_visitante}</span>
        </p>

        {/* Score inputs */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 text-center">
            <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(235,195,43,.7)' }}>{match.equipo_local}</p>
            <input
              type="number" min="0" max="99" value={local}
              onChange={e => setLocal(e.target.value)}
              className="w-full px-3 py-3 rounded-xl font-display text-2xl text-center outline-none transition-all"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#ebc32b' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(235,195,43,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <span className="font-display text-2xl" style={{ color: 'rgba(255,255,255,.3)' }}>:</span>
          <div className="flex-1 text-center">
            <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(235,195,43,.7)' }}>{match.equipo_visitante}</p>
            <input
              type="number" min="0" max="99" value={visitante}
              onChange={e => setVisit(e.target.value)}
              className="w-full px-3 py-3 rounded-xl font-display text-2xl text-center outline-none transition-all"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#ebc32b' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(235,195,43,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.1)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="mb-6">
          <p className="font-body text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(235,195,43,.7)' }}>Estado del partido</p>
          <div className="grid grid-cols-2 gap-2">
            {['programado', 'en_vivo', 'finalizado', 'cancelado'].map(est => {
              const s = ESTADO_COLORS[est]
              const isActive = estado === est
              return (
                <button key={est} type="button" onClick={() => setEstado(est)}
                  className="py-2 px-3 rounded-xl text-xs font-body font-semibold transition-all"
                  style={{
                    background: isActive ? s.bg : 'rgba(255,255,255,.04)',
                    border: `1px solid ${isActive ? s.border : 'rgba(255,255,255,.08)'}`,
                    color: isActive ? s.color : 'rgba(255,255,255,.4)',
                  }}>
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#ebc32b,#c99f16)', color: '#05090f', boxShadow: '0 4px 16px rgba(235,195,43,.3)' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 6px 24px rgba(235,195,43,.5)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(235,195,43,.3)' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PartidosAdminTab({ matches, loadBets }) {
  const [filtroFase,   setFiltroFase  ] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [editingMatch, setEditingMatch ] = useState(null)
  const [syncing,      setSyncing      ] = useState(false)

  const fasesDisponibles = useMemo(() => {
    const set = new Set(matches.map(m => m.fase).filter(Boolean))
    return ORDEN_FASES.filter(f => set.has(f))
  }, [matches])

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (filtroFase   !== 'todas' && m.fase   !== filtroFase)   return false
      if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false
      return true
    })
  }, [matches, filtroFase, filtroEstado])

  async function handleSync() {
    setSyncing(true)
    try {
      await sheetsApi.partidos.sincronizar()
      await loadBets()
      alert('Partidos sincronizados correctamente.')
    } catch (e) {
      alert('Error al sincronizar: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const liveCount      = matches.filter(m => m.estado === 'en_vivo').length
  const finishedCount  = matches.filter(m => m.estado === 'finalizado').length
  const scheduledCount = matches.filter(m => m.estado === 'programado').length

  return (
    <div className="animate-fade-in delay-2">

      {/* Header con stats y sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-display text-2xl text-white" style={{ letterSpacing: '.02em' }}>
            PARTIDOS <span style={{ color: '#ebc32b' }}>({matches.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 font-body text-xs font-bold" style={{ color: '#ff4d6d' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] animate-pulse-live" />
                {liveCount} en vivo
              </span>
            )}
            <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,.3)' }}>{scheduledCount} programados · {finishedCount} finalizados</span>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          style={{ background: 'rgba(235,195,43,.1)', border: '1px solid rgba(235,195,43,.3)', color: '#ebc32b' }}
          onMouseEnter={e => { if (!syncing) { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.1)'; e.currentTarget.style.color = '#ebc32b' }}
        >
          {syncing
            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin .8s linear infinite' }} />
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          }
          {syncing ? 'Sincronizando...' : 'Sincronizar API'}
        </button>
      </div>

      {/* Filtros */}
      <div
        className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
        style={{ background: 'rgba(12,24,43,.6)', border: '1px solid rgba(235,195,43,.12)' }}
      >
        {fasesDisponibles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body font-bold uppercase text-[10px] tracking-widest w-14 flex-shrink-0" style={{ color: 'rgba(255,255,255,.3)' }}>Fase</span>
            {['todas', ...fasesDisponibles].map(f => (
              <button key={f} type="button"
                onClick={() => setFiltroFase(f)}
                className="px-3 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap"
                style={{
                  fontSize: 11,
                  background: filtroFase === f ? '#ebc32b' : 'rgba(255,255,255,.06)',
                  border: `1px solid ${filtroFase === f ? '#ebc32b' : 'rgba(255,255,255,.12)'}`,
                  color: filtroFase === f ? '#05090f' : 'rgba(255,255,255,.5)',
                }}>
                {f === 'todas' ? 'Todas' : (LABEL_FASE[f] || f)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-bold uppercase text-[10px] tracking-widest w-14 flex-shrink-0" style={{ color: 'rgba(255,255,255,.3)' }}>Estado</span>
          {['todos', 'programado', 'en_vivo', 'finalizado'].map(est => {
            const s = est === 'todos' ? null : ESTADO_COLORS[est]
            const isActive = filtroEstado === est
            return (
              <button key={est} type="button"
                onClick={() => setFiltroEstado(est)}
                className="px-3 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap"
                style={{
                  fontSize: 11,
                  background: isActive ? (s?.bg || '#ebc32b') : 'rgba(255,255,255,.06)',
                  border: `1px solid ${isActive ? (s?.border || '#ebc32b') : 'rgba(255,255,255,.12)'}`,
                  color: isActive ? (s?.color || '#05090f') : 'rgba(255,255,255,.5)',
                }}>
                {est === 'todos' ? 'Todos' : (s?.label || est)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contador */}
      <p className="text-xs font-body mb-3" style={{ color: 'rgba(255,255,255,.35)' }}>
        {filtered.length} {filtered.length === 1 ? 'partido' : 'partidos'}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(66,91,139,.08)', border: '1px dashed rgba(235,195,43,.2)' }}>
          <p className="font-body text-sm font-semibold" style={{ color: 'rgba(255,255,255,.4)' }}>
            No hay partidos con estos filtros.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(match => {
            const s = ESTADO_COLORS[match.estado] || ESTADO_COLORS.programado
            const isFinished  = match.estado === 'finalizado'
            const isLive      = match.estado === 'en_vivo'
            const isScheduled = match.estado === 'programado'
            const faseLabel   = LABEL_FASE[match.fase] || match.fase || ''

            return (
              <div
                key={match.id}
                className="rounded-xl px-4 py-3 transition-all group"
                style={{
                  background: 'linear-gradient(155deg,rgba(66,91,139,.15),rgba(66,91,139,.04))',
                  border: `1px solid ${isLive ? 'rgba(255,77,109,.3)' : 'rgba(255,255,255,.07)'}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(235,195,43,.25)'; e.currentTarget.style.background = 'linear-gradient(155deg,rgba(66,91,139,.22),rgba(66,91,139,.08))' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isLive ? 'rgba(255,77,109,.3)' : 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'linear-gradient(155deg,rgba(66,91,139,.15),rgba(66,91,139,.04))' }}
              >
                <div className="flex items-center gap-3">
                  {/* Fase / estado */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0 w-24 hidden sm:flex">
                    {faseLabel && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider font-body" style={{ color: 'rgba(255,255,255,.35)' }}>
                        {faseLabel}
                      </span>
                    )}
                    {match.grupo && (
                      <span className="text-[9px] font-body" style={{ color: 'rgba(255,255,255,.25)' }}>
                        Grupo {match.grupo}{match.jornada ? ` · J${match.jornada}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Partido */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-end min-w-0">
                      {match.bandera_local && (
                        <img src={match.bandera_local} alt="" className="w-6 h-4 object-cover rounded-sm flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,.1)' }} />
                      )}
                      <span className="font-body text-sm text-white truncate text-right">{match.equipo_local || '—'}</span>
                    </div>

                    <div className="flex-shrink-0 px-3 py-1 rounded-lg text-center"
                      style={{ background: 'rgba(2,15,39,.5)', border: '1px solid rgba(255,255,255,.1)', minWidth: 56 }}>
                      {isScheduled ? (
                        <span className="font-display text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>- : -</span>
                      ) : (
                        <span className="font-display text-base" style={{ color: isLive ? '#ff4d6d' : '#ebc32b' }}>
                          {match.goles_local ?? 0} : {match.goles_visitante ?? 0}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-sm text-white truncate">{match.equipo_visitante || '—'}</span>
                      {match.bandera_visitante && (
                        <img src={match.bandera_visitante} alt="" className="w-6 h-4 object-cover rounded-sm flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,.1)' }} />
                      )}
                    </div>
                  </div>

                  {/* Estado badge */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline-flex"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] animate-pulse-live" />}
                      {isScheduled ? fmtFecha(match.fecha_partido) : s.label}
                    </span>

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingMatch(match)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(235,195,43,.1)', border: '1px solid rgba(235,195,43,.25)', color: '#ebc32b' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ebc32b'; e.currentTarget.style.color = '#05090f' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(235,195,43,.1)'; e.currentTarget.style.color = '#ebc32b' }}
                      title="Editar resultado"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingMatch && (
        <EditScoreModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={loadBets}
        />
      )}
    </div>
  )
}