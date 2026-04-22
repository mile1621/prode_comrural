import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import CreateBetForm from '../components/admin/CreateBetForm.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { formatDate, isBetOpen } from '../utils/index.js'
import sheetsApi from '../services/sheetsApi.js'

const TABS = ['Apuestas', 'Usuarios', 'Áreas']

/* ── Helpers ────────────────────────────────────────────── */

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
}

function getBetStatusColor(bet) {
  if (isBetOpen(bet)) return { color: 'var(--color-accent)', bg: 'rgba(34,217,223,0.12)', border: 'rgba(34,217,223,0.4)', label: 'Activa' }
  if (bet.estado === 'finalizada') return { color: 'var(--color-warn)', bg: 'rgba(244,180,42,0.1)', border: 'rgba(244,180,42,0.3)', label: 'Finalizada' }
  return { color: 'var(--color-text-muted)', bg: 'rgba(132,153,194,0.1)', border: 'var(--color-border)', label: 'Cerrada' }
}

export default function AdminPage() {
  const { bets, loading, createBet, matches } = useBets()
  const [tab, setTab] = useState('Apuestas')
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Estados para flujo de áreas (tab Usuarios → solo activas)
  const [areas, setAreas] = useState([])
  const [approvingUser, setApprovingUser] = useState(null)

  // Estados para gestión de áreas (tab Áreas → todas, también inactivas)
  const [areasAll, setAreasAll] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [newArea, setNewArea] = useState({ nombre: '', descripcion: '' })
  const [savingArea, setSavingArea] = useState(false)

  useEffect(() => {
    if (tab === 'Usuarios') {
      loadPendingUsers()
      loadAreas()
    }
    if (tab === 'Áreas') {
      loadAreasAll()
    }
  }, [tab])

  async function loadAreas() {
    try {
      const resp = await sheetsApi.areas.listar(true)
      setAreas(resp.areas || [])
    } catch (err) {
      console.error('Error cargando áreas:', err)
    }
  }

  async function loadAreasAll() {
    setLoadingAreas(true)
    try {
      const resp = await sheetsApi.areas.listar(false)
      setAreasAll(resp.areas || [])
    } catch (err) {
      alert('Error cargando áreas: ' + err.message)
    } finally {
      setLoadingAreas(false)
    }
  }

  async function handleCreateArea(e) {
    e.preventDefault()
    if (!newArea.nombre.trim()) return alert('El nombre del área es obligatorio.')
    setSavingArea(true)
    try {
      await sheetsApi.areas.crear({
        nombre: newArea.nombre.trim(),
        descripcion: newArea.descripcion.trim(),
      })
      setNewArea({ nombre: '', descripcion: '' })
      await loadAreasAll()
    } catch (err) {
      alert('Error creando área: ' + err.message)
    } finally {
      setSavingArea(false)
    }
  }

  async function handleSaveEdit() {
    if (!editingArea.nombre.trim()) return alert('El nombre no puede estar vacío.')
    setSavingArea(true)
    try {
      await sheetsApi.areas.editar({
        area_id: editingArea.id,
        nombre: editingArea.nombre.trim(),
        descripcion: editingArea.descripcion?.trim() || '',
      })
      setEditingArea(null)
      await loadAreasAll()
    } catch (err) {
      alert('Error guardando cambios: ' + err.message)
    } finally {
      setSavingArea(false)
    }
  }

  async function handleToggleArea(area, currentlyActive) {
    const accion = currentlyActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Seguro que querés ${accion} el área "${area.nombre}"?`)) return
    try {
      await sheetsApi.areas.toggle_activa(area.id)
      await loadAreasAll()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  async function loadPendingUsers() {
    setLoadingUsers(true)
    try {
      const resp = await sheetsApi.usuarios.listar('pendiente')
      setPendingUsers(resp.usuarios || [])
    } catch (err) {
      alert('Error cargando usuarios: ' + err.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  async function confirmApprove(id) {
    if (!approvingUser.tipo_usuario || !approvingUser.area_id) {
      return alert('Debés seleccionar el rol y el área del usuario.')
    }
    try {
      await sheetsApi.usuarios.aprobar(id, approvingUser.tipo_usuario, approvingUser.area_id)
      setApprovingUser(null)
      await loadPendingUsers()
    } catch (err) {
      alert('Error aprobando: ' + err.message)
    }
  }

  async function rejectUser(id) {
    if (!window.confirm('¿Estás seguro de rechazar y borrar este usuario?')) return
    try {
      await sheetsApi.usuarios.rechazar(id)
      setPendingUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      alert(err.message || 'Error al rechazar usuario')
    }
  }

  return (
    <AppLayout>
      {/* ── Header ───────────────────────────── */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide leading-none mb-2">
            PANEL <span className="text-[var(--color-accent)]">ADMIN</span>
          </h1>
          <p className="text-[var(--color-text-muted)] font-body text-sm">
            Gestión de apuestas y usuarios de la plataforma
          </p>
        </div>

        {/* Badge dorado Admin */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg self-start md:self-auto"
          style={{
            background: 'rgba(244,180,42,0.1)',
            border: '1px solid rgba(244,180,42,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span className="text-xs font-body font-bold uppercase tracking-[0.15em] text-[var(--color-warn)]">
            Admin
          </span>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────── */}
      <div
        className="inline-flex gap-1 p-1 rounded-xl mb-8 animate-fade-in delay-1"
        style={{
          background: 'rgba(15,43,79,0.6)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {TABS.map(t => {
          const active = tab === t
          const hasBadge = t === 'Usuarios' && pendingUsers.length > 0
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-5 py-2 text-xs font-body font-semibold uppercase tracking-wider rounded-lg transition-all"
              style={{
                background: active
                  ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)'
                  : 'transparent',
                color: active ? '#020F27' : 'var(--color-text-muted)',
                boxShadow: active ? '0 4px 16px rgba(34,217,223,0.3)' : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--color-text)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              {t}
              {hasBadge && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{
                    background: 'var(--color-danger)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(255,77,109,0.5)',
                  }}
                >
                  {pendingUsers.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Apuestas ────────────────────── */}
      {tab === 'Apuestas' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in delay-2">

          {/* Columna: Crear nueva */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
              border: '1px solid rgba(34,217,223,0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                NUEVA APUESTA
              </h2>
            </div>
            <CreateBetForm onSubmit={createBet} loading={loading} matches={matches} />
          </div>

          {/* Columna: Lista de apuestas */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
              APUESTAS CREADAS
              <span className="ml-2 text-[var(--color-accent)] text-xl">({bets.length})</span>
            </h2>

            {bets.length === 0 && (
              <div
                className="rounded-2xl p-10 text-center"
                style={{
                  background: 'rgba(15,43,79,0.4)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <p className="text-[var(--color-text-muted)] font-body text-sm">
                  Todavía no creaste apuestas.
                </p>
              </div>
            )}

            {bets.map(bet => {
              const status = getBetStatusColor(bet)
              const matchCount = bet.partidos_ids ? bet.partidos_ids.split(',').filter(Boolean).length : 0
              return (
                <div
                  key={bet.id}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                    border: `1px solid ${status.border}`,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg text-white tracking-wide truncate">
                        {bet.titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)] font-body flex-wrap">
                        {bet.premio && <span className="truncate">{bet.premio}</span>}
                        <span className="text-[var(--color-text-faint)]">·</span>
                        <span>{bet.tipo === 'grupos' ? 'Áreas' : 'Libre'}</span>
                        {matchCount > 0 && (
                          <>
                            <span className="text-[var(--color-text-faint)]">·</span>
                            <span>{matchCount} {matchCount === 1 ? 'partido' : 'partidos'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-display text-xl text-[var(--color-accent)] leading-none">
                          {bet.participantes || 0}
                        </p>
                        <p className="text-[9px] font-body uppercase tracking-wider text-[var(--color-text-faint)] mt-0.5">
                          Partic.
                        </p>
                      </div>
                      <span
                        className="inline-flex px-2.5 py-1 rounded text-[10px] font-body font-bold uppercase tracking-wider"
                        style={{
                          background: status.bg,
                          color: status.color,
                          border: `1px solid ${status.border}`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Usuarios ────────────────────── */}
      {tab === 'Usuarios' && (
        <div className="animate-fade-in delay-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
              PENDIENTES
              {pendingUsers.length > 0 && (
                <span className="ml-2 text-[var(--color-danger)] text-xl">({pendingUsers.length})</span>
              )}
            </h2>

            <button
              onClick={loadPendingUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => {
                if (!loadingUsers) {
                  e.currentTarget.style.borderColor = 'rgba(34,217,223,0.4)'
                  e.currentTarget.style.color = 'var(--color-accent)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              {loadingUsers ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              )}
              Actualizar
            </button>
          </div>

          {loadingUsers && pendingUsers.length === 0 ? (
            <div className="text-center py-16">
              <span className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--color-text-muted)] font-body text-sm mt-3">Cargando usuarios...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: 'rgba(15,43,79,0.4)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <p className="text-[var(--color-text-muted)] font-body text-base mb-1">
                No hay usuarios pendientes
              </p>
              <p className="text-[var(--color-text-faint)] font-body text-xs">
                Las solicitudes nuevas van a aparecer acá.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingUsers.map(u => {
                const isApproving = approvingUser?.id === u.id
                return (
                  <div
                    key={u.id}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                      border: `1px solid ${isApproving ? 'rgba(34,217,223,0.4)' : 'rgba(34,217,223,0.15)'}`,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Cabecera del usuario */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar iniciales */}
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-lg tracking-wide"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                            color: '#020F27',
                            boxShadow: '0 4px 12px rgba(34,217,223,0.3)',
                          }}
                        >
                          {getInitials(u.nombre)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-body font-semibold text-white truncate">{u.nombre}</p>
                          <p className="text-xs text-[var(--color-text-muted)] font-body truncate">{u.email}</p>
                          <p className="text-[10px] text-[var(--color-text-faint)] font-body mt-0.5">
                            Registrado: {formatDate(u.fecha_registro)}
                          </p>
                        </div>
                      </div>

                      {!isApproving && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setApprovingUser({ id: u.id, tipo_usuario: '', area_id: '' })}
                            className="px-4 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                              color: '#020F27',
                              boxShadow: '0 4px 16px rgba(34,217,223,0.3)',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.5)'
                              e.currentTarget.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,217,223,0.3)'
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => rejectUser(u.id)}
                            className="px-4 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all"
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255,77,109,0.4)',
                              color: 'var(--color-danger)',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255,77,109,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Panel de aprobación expandido */}
                    {isApproving && (
                      <div
                        className="mt-5 pt-5 flex flex-col gap-4"
                        style={{ borderTop: '1px solid var(--color-border)' }}
                      >
                        {/* Selector de rol */}
                        <div>
                          <p className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
                            Rol
                          </p>
                          <div className="flex gap-2">
                            {[
                              { val: 'general', label: 'Participante', desc: 'Solo observa' },
                              { val: 'jefe', label: 'Jefe de Área', desc: 'Carga prodes' },
                            ].map(opt => {
                              const isActive = approvingUser.tipo_usuario === opt.val
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => setApprovingUser({ ...approvingUser, tipo_usuario: opt.val })}
                                  className="flex-1 px-4 py-3 rounded-lg text-left transition-all"
                                  style={{
                                    background: isActive ? 'rgba(34,217,223,0.12)' : 'rgba(2,15,39,0.4)',
                                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                                  }}
                                >
                                  <p className="font-body font-semibold text-sm">{opt.label}</p>
                                  <p className="font-body text-[10px] text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Selector de área */}
                        <div>
                          <p className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
                            Área
                          </p>
                          {areas.length === 0 ? (
                            <p className="text-xs text-[var(--color-warn)] font-body p-3 rounded-lg"
                              style={{
                                background: 'rgba(244,180,42,0.1)',
                                border: '1px solid rgba(244,180,42,0.3)',
                              }}
                            >
                              ⚠ Todavía no hay áreas creadas. Creá áreas primero para poder asignar usuarios.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {areas.map(a => {
                                const isActive = approvingUser.area_id === a.id
                                return (
                                  <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => setApprovingUser({ ...approvingUser, area_id: a.id })}
                                    className="px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
                                    style={{
                                      background: isActive ? 'var(--color-accent)' : 'transparent',
                                      border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                      color: isActive ? '#020F27' : 'var(--color-text-muted)',
                                    }}
                                  >
                                    {a.nombre}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setApprovingUser(null)}
                            className="px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => confirmApprove(u.id)}
                            disabled={!approvingUser.tipo_usuario || !approvingUser.area_id}
                            className="px-5 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                              color: '#020F27',
                              boxShadow: '0 4px 16px rgba(34,217,223,0.3)',
                            }}
                          >
                            Confirmar aprobación
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    {/* ── Tab: Áreas ─────────────────────── */}
      {tab === 'Áreas' && (
        <div className="animate-fade-in delay-2 grid lg:grid-cols-5 gap-6">

          {/* Columna izquierda: Crear área */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 h-fit"
            style={{
              background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
              border: '1px solid rgba(34,217,223,0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <h2 className="font-display text-2xl text-white tracking-wide">NUEVA ÁREA</h2>
            </div>

            <form onSubmit={handleCreateArea} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newArea.nombre}
                  onChange={e => setNewArea({ ...newArea, nombre: e.target.value })}
                  required
                  placeholder="Ej: Marketing, Ventas, IT..."
                  className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text)] font-body placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,217,223,0.15)] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newArea.descripcion}
                  onChange={e => setNewArea({ ...newArea, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Breve descripción del área"
                  className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text)] font-body placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,217,223,0.15)] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingArea || !newArea.nombre.trim()}
                className="py-3 rounded-lg font-body font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: (savingArea || !newArea.nombre.trim())
                    ? 'var(--color-accent-dim)'
                    : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                  color: '#020F27',
                  boxShadow: (savingArea || !newArea.nombre.trim()) ? 'none' : '0 6px 24px rgba(34,217,223,0.35)',
                }}
              >
                {savingArea ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : 'Crear área'}
              </button>
            </form>
          </div>

          {/* Columna derecha: Lista */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                ÁREAS
                <span className="ml-2 text-[var(--color-accent)] text-xl">({areasAll.length})</span>
              </h2>
              <button
                onClick={loadAreasAll}
                disabled={loadingAreas}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {loadingAreas ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                )}
                Actualizar
              </button>
            </div>

            {loadingAreas && areasAll.length === 0 ? (
              <div className="text-center py-16">
                <span className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--color-text-muted)] font-body text-sm mt-3">Cargando áreas...</p>
              </div>
            ) : areasAll.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: 'rgba(15,43,79,0.4)', border: '1px dashed var(--color-border)' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
                </svg>
                <p className="text-[var(--color-text-muted)] font-body text-sm">Todavía no hay áreas creadas.</p>
                <p className="text-[var(--color-text-faint)] font-body text-xs mt-1">Creá la primera desde el formulario de la izquierda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {areasAll.map(area => {
                  const isActive = area.activa === true || area.activa === 'TRUE' || area.activa === 'true' || area.activa === 1
                  const isEditing = editingArea?.id === area.id
                  return (
                    <div
                      key={area.id}
                      className="rounded-xl p-4 transition-all"
                      style={{
                        background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                        border: `1px solid ${isActive ? 'rgba(34,217,223,0.2)' : 'rgba(132,153,194,0.15)'}`,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        opacity: isActive ? 1 : 0.65,
                      }}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <input
                            type="text"
                            value={editingArea.nombre}
                            onChange={e => setEditingArea({ ...editingArea, nombre: e.target.value })}
                            placeholder="Nombre del área"
                            className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text)] font-body focus:border-[var(--color-accent)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,217,223,0.15)] transition-all"
                          />
                          <textarea
                            value={editingArea.descripcion || ''}
                            onChange={e => setEditingArea({ ...editingArea, descripcion: e.target.value })}
                            placeholder="Descripción"
                            rows={2}
                            className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text)] font-body focus:border-[var(--color-accent)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,217,223,0.15)] transition-all resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingArea(null)}
                              className="px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all"
                              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={savingArea}
                              className="px-5 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                              style={{
                                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-bright) 100%)',
                                color: '#020F27',
                                boxShadow: '0 4px 16px rgba(34,217,223,0.3)',
                              }}
                            >
                              {savingArea ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-display text-lg text-white tracking-wide truncate">{area.nombre}</p>
                              <span
                                className="inline-flex px-2 py-0.5 rounded text-[9px] font-body font-bold uppercase tracking-wider"
                                style={{
                                  background: isActive ? 'rgba(34,217,223,0.12)' : 'rgba(132,153,194,0.1)',
                                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                  border: `1px solid ${isActive ? 'rgba(34,217,223,0.4)' : 'var(--color-border)'}`,
                                }}
                              >
                                {isActive ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                            {area.descripcion && (
                              <p className="text-xs text-[var(--color-text-muted)] font-body mt-1">
                                {area.descripcion}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setEditingArea({ id: area.id, nombre: area.nombre, descripcion: area.descripcion || '' })}
                              className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all"
                              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,217,223,0.4)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleArea(area, isActive)}
                              className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all"
                              style={{
                                background: 'transparent',
                                border: `1px solid ${isActive ? 'rgba(255,77,109,0.4)' : 'rgba(34,217,223,0.4)'}`,
                                color: isActive ? 'var(--color-danger)' : 'var(--color-accent)',
                              }}
                            >
                              {isActive ? 'Desactivar' : 'Reactivar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </AppLayout>
  )
}