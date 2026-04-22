import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import CreateBetForm from '../components/admin/CreateBetForm.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { formatDate, isBetOpen } from '../utils/index.js'
import sheetsApi from '../services/sheetsApi.js'

const TABS = ['Apuestas', 'Usuarios']

export default function AdminPage() {
  const { bets, loading, createBet, matches } = useBets()
  const [tab, setTab] = useState('Apuestas')
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (tab === 'Usuarios') {
      loadPendingUsers()
    }
  }, [tab])

  async function loadPendingUsers() {
    setLoadingUsers(true)
    try {
      const resp = await sheetsApi.usuarios.listar('pendiente')
      setPendingUsers(resp.usuarios || [])
    } catch(err) {
      alert("Error cargando usuarios: " + err.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  async function approveUser(id) {
    try {
      await sheetsApi.usuarios.aprobar(id)
      setPendingUsers(prev => prev.filter(u => u.id !== id))
      alert('Usuario aprobado exitosamente.')
    } catch(err) {
      alert(err.message || 'Error al aprobar usuario')
    }
  }
  
  async function rejectUser(id) {
    if (!window.confirm("¿Estás seguro de que rechazar y borrar este usuario?")) return
    try {
      await sheetsApi.usuarios.rechazar(id)
      setPendingUsers(prev => prev.filter(u => u.id !== id))
      alert('Usuario rechazado.')
    } catch(err) {
      alert(err.message || 'Error al rechazar usuario')
    }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide leading-none">
              PANEL ADMIN
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-body font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(244,180,42,0.15)',
                color: 'var(--color-warn)',
                border: '1px solid rgba(244,180,42,0.4)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7l9 5 9-5-9-5z" />
                <path d="M3 17l9 5 9-5" />
                <path d="M3 12l9 5 9-5" />
              </svg>
              Admin
            </span>
          </div>
          <p className="text-[var(--color-text-muted)] font-body text-sm">
            Gestión de apuestas y usuarios
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex gap-1 p-1 rounded-xl mb-8"
        style={{
          background: 'rgba(15,43,79,0.6)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {TABS.map(t => {
          const active = tab === t
          const showBadge = t === 'Usuarios' && pendingUsers.length > 0

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
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = 'var(--color-text)'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              {t}
              {showBadge && (
                <span
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center font-body font-bold text-[10px]"
                  style={{
                    background: 'var(--color-danger)',
                    color: 'white',
                    border: '2px solid var(--color-bg)',
                    boxShadow: '0 2px 8px rgba(255,77,109,0.4)',
                  }}
                >
                  {pendingUsers.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab: Apuestas */}
      {tab === 'Apuestas' && (
        <div className="grid lg:grid-cols-5 gap-6 animate-fade-in">

          {/* ── Formulario: Nueva apuesta ─────────────── */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(15,43,79,0.9) 0%, rgba(15,33,69,0.95) 100%)',
              border: '1px solid rgba(34,217,223,0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                NUEVA APUESTA
              </h2>
            </div>

            <CreateBetForm onSubmit={createBet} loading={loading} matches={matches} />
          </div>

          {/* ── Listado: Apuestas creadas ─────────────── */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                APUESTAS CREADAS
              </h2>
              <span className="text-xs text-[var(--color-text-muted)] font-body">
                {bets.length} {bets.length === 1 ? 'apuesta' : 'apuestas'}
              </span>
            </div>

            {bets.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{
                  background: 'rgba(15,43,79,0.4)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <p className="text-[var(--color-text-muted)] font-body text-sm mb-1">
                  Todavía no creaste ninguna apuesta
                </p>
                <p className="text-[var(--color-text-faint)] font-body text-xs">
                  Completá el formulario de la izquierda para crear la primera.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bets.map((bet, i) => {
                  const active = isBetOpen(bet)
                  const isLive = bet.partidos?.some(p => p.estado === 'en_vivo')
                  const allFinished = bet.partidos?.length > 0 && bet.partidos.every(p => p.estado === 'finalizado')

                  const state = isLive
                    ? { label: 'EN VIVO', color: 'var(--color-live)', bg: 'rgba(255,61,113,0.12)', border: 'rgba(255,61,113,0.4)' }
                    : allFinished
                      ? { label: 'FINALIZADA', color: 'var(--color-warn)', bg: 'rgba(244,180,42,0.1)', border: 'rgba(244,180,42,0.35)' }
                      : active
                        ? { label: 'ACTIVA', color: 'var(--color-accent)', bg: 'rgba(34,217,223,0.1)', border: 'rgba(34,217,223,0.35)' }
                        : { label: 'CERRADA', color: 'var(--color-text-muted)', bg: 'rgba(132,153,194,0.08)', border: 'var(--color-border)' }

                  return (
                    <div
                      key={bet.id}
                      className={`rounded-xl p-4 transition-all animate-fade-in delay-${Math.min(i + 1, 5)}`}
                      style={{
                        background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                        border: '1px solid rgba(34,217,223,0.12)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg md:text-xl text-white tracking-wide leading-tight truncate">
                            {bet.titulo}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--color-text-muted)] font-body">
                            {bet.premio && (
                              <span className="inline-flex items-center gap-1">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                  <path d="M4 22h16" />
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                                <span className="truncate max-w-[140px]">{bet.premio}</span>
                              </span>
                            )}
                            <span className="text-[var(--color-text-faint)]">·</span>
                            <span>{bet.tipo === 'por_equipos' ? 'Equipos' : 'Libre'}</span>
                            {bet.partidos && (
                              <>
                                <span className="text-[var(--color-text-faint)]">·</span>
                                <span>{bet.partidos.length} {bet.partidos.length === 1 ? 'partido' : 'partidos'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-body font-bold uppercase tracking-wider"
                          style={{
                            background: state.bg,
                            color: state.color,
                            border: `1px solid ${state.border}`,
                          }}
                        >
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-pulse-live" />}
                          {state.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Usuarios */}
      {tab === 'Usuarios' && (
        <div className="animate-fade-in">

          {/* Encabezado de sección */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                PENDIENTES DE APROBACIÓN
              </h2>
              <p className="text-[var(--color-text-muted)] font-body text-sm mt-1">
                {pendingUsers.length === 0
                  ? 'No hay nadie esperando aprobación.'
                  : pendingUsers.length === 1
                    ? 'Una persona está esperando que apruebes su cuenta.'
                    : `${pendingUsers.length} personas están esperando que apruebes su cuenta.`}
              </p>
            </div>

            <button
              onClick={loadPendingUsers}
              disabled={loadingUsers}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                if (!loadingUsers) {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }
              }}
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={loadingUsers ? 'animate-spin' : ''}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span className="hidden sm:inline">{loadingUsers ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Loading inicial */}
          {loadingUsers && pendingUsers.length === 0 ? (
            <div
              className="rounded-2xl py-16 flex flex-col items-center justify-center gap-4"
              style={{
                background: 'rgba(15,43,79,0.4)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--color-text-muted)] font-body text-sm">Cargando usuarios...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: 'rgba(15,43,79,0.4)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(34,217,223,0.1)',
                  border: '2px solid rgba(34,217,223,0.3)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-white font-body font-semibold text-base mb-1">
                Todo al día
              </p>
              <p className="text-[var(--color-text-muted)] font-body text-sm">
                No hay usuarios pendientes de aprobación.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingUsers.map((u, i) => {
                // Generar iniciales a partir del nombre (máx 2 letras)
                const initials = (u.nombre || '?')
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()

                return (
                  <div
                    key={u.id}
                    className={`rounded-2xl p-5 transition-all animate-fade-in delay-${Math.min(i + 1, 5)}`}
                    style={{
                      background: 'linear-gradient(145deg, rgba(15,43,79,0.9) 0%, rgba(15,33,69,0.95) 100%)',
                      border: '1px solid rgba(34,217,223,0.15)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      {/* Info del usuario */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar con iniciales */}
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-lg tracking-wide"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,217,223,0.2) 0%, rgba(34,217,223,0.08) 100%)',
                            border: '1px solid rgba(34,217,223,0.35)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {initials}
                        </div>

                        {/* Datos */}
                        <div className="min-w-0">
                          <p className="font-body font-semibold text-white text-base truncate">
                            {u.nombre || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] font-body truncate">
                            {u.email}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-faint)] font-body mt-1 flex items-center gap-1.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Solicitud del {formatDate(u.fecha_registro)}
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => rejectUser(u.id)}
                          className="px-4 py-2 rounded-lg text-xs font-body font-semibold uppercase tracking-wider transition-all"
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,77,109,0.35)',
                            color: 'var(--color-danger)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,77,109,0.1)'
                            e.currentTarget.style.borderColor = 'rgba(255,77,109,0.6)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'rgba(255,77,109,0.35)'
                          }}
                        >
                          Rechazar
                        </button>

                        <button
                          onClick={() => approveUser(u.id)}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all"
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Aprobar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
