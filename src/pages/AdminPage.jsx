import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDate, isBetOpen } from '../utils/index.js'
import sheetsApi from '../services/sheetsApi.js'

import AdminHeader from '../components/admin/AdminHeader.jsx'
import AdminTabs from '../components/admin/AdminTabs.jsx'
import BetsTab from '../components/admin/BetsTab.jsx'
import UsersTab from '../components/admin/UsersTab.jsx'
import AreasTab from '../components/admin/AreasTab.jsx'
import PartidosAdminTab from '../components/admin/PartidosAdminTab.jsx'




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
  const { bets, loading, createBet, closeBet, finalizeBet, matches, loadBets } = useBets()
  const { isPro } = useAuth()

  const [tab, setTab] = useState('Apuestas')

  /* ── Usuarios ─────────────────────────────────────────── */
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [areas, setAreas] = useState([])
  const [approvingUser, setApprovingUser] = useState(null)

  /* ── Áreas ────────────────────────────────────────────── */
  const [areasAll, setAreasAll] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [newArea, setNewArea] = useState({ nombre: '', descripcion: '' })
  const [savingArea, setSavingArea] = useState(false)

  /* ── Efectos ──────────────────────────────────────────── */
  useEffect(() => {
    if (tab === 'Usuarios') {
      loadPendingUsers()
      if (isPro) loadAreas()
    }
    if (tab === 'Áreas' && isPro) {
      loadAreasAll()
    }
  }, [tab, isPro])

  /* ── Funciones: Áreas ─────────────────────────────────── */
  async function loadAreas() {
    try { const r = await sheetsApi.areas.listar(true); setAreas(r.areas || []) }
    catch (e) { console.error('Error cargando áreas:', e) }
  }

  async function loadAreasAll() {
    setLoadingAreas(true)
    try { const r = await sheetsApi.areas.listar(false); setAreasAll(r.areas || []) }
    catch (e) { alert('Error cargando áreas: ' + e.message) }
    finally { setLoadingAreas(false) }
  }

  async function handleCreateArea(e) {
    e.preventDefault()
    if (!newArea.nombre.trim()) return alert('El nombre del área es obligatorio.')
    setSavingArea(true)
    try {
      await sheetsApi.areas.crear({ nombre: newArea.nombre.trim(), descripcion: newArea.descripcion.trim() })
      setNewArea({ nombre: '', descripcion: '' })
      await loadAreasAll()
    } catch (e) { alert('Error creando área: ' + e.message) }
    finally { setSavingArea(false) }
  }

  async function handleSaveEdit() {
    if (!editingArea.nombre.trim()) return alert('El nombre no puede estar vacío.')
    setSavingArea(true)
    try {
      await sheetsApi.areas.editar({ area_id: editingArea.id, nombre: editingArea.nombre.trim(), descripcion: editingArea.descripcion?.trim() || '' })
      setEditingArea(null)
      await loadAreasAll()
    } catch (e) { alert('Error guardando cambios: ' + e.message) }
    finally { setSavingArea(false) }
  }

  async function handleToggleArea(area, currentlyActive) {
    if (!window.confirm(`¿Seguro que querés ${currentlyActive ? 'desactivar' : 'reactivar'} el área "${area.nombre}"?`)) return
    try { await sheetsApi.areas.toggle_activa(area.id); await loadAreasAll() }
    catch (e) { alert('Error: ' + e.message) }
  }

  /* ── Funciones: Usuarios ──────────────────────────────── */
  async function loadPendingUsers() {
    setLoadingUsers(true)
    try { const r = await sheetsApi.usuarios.listar('pendiente'); setPendingUsers(r.usuarios || []) }
    catch (e) { alert('Error cargando usuarios: ' + e.message) }
    finally { setLoadingUsers(false) }
  }

  async function confirmApprove(id) {
    // En Plan_basic no se pide rol ni área — el backend lo aprueba como 'general' sin área.
    // En Plan_pro, ambos campos son obligatorios.
    if (isPro && (!approvingUser.tipo_usuario || !approvingUser.area_id)) {
      return alert('Debés seleccionar el rol y el área del usuario.')
    }
    try {
      await sheetsApi.usuarios.aprobar(
        id,
        isPro ? approvingUser.tipo_usuario : '',
        isPro ? approvingUser.area_id : ''
      )
      setApprovingUser(null)
      await loadPendingUsers()
    } catch (e) { alert('Error aprobando: ' + e.message) }
  }

  async function rejectUser(id) {
    if (!window.confirm('¿Estás seguro de rechazar y borrar este usuario?')) return
    try {
      await sheetsApi.usuarios.rechazar(id)
      setPendingUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) { alert(e.message || 'Error al rechazar usuario') }
  }

  /* ── Render ───────────────────────────────────────────── */
  return (
        <AppLayout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <AdminHeader bets={bets} pendingUsers={pendingUsers} />

      {/* Divider */}
      <div className="mb-6 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(235,195,43,.25) 30%,rgba(235,195,43,.25) 70%,transparent)' }} />

      <AdminTabs
        tab={tab}
        setTab={setTab}
        pendingCount={pendingUsers.length}
        betsCount={bets.filter(b => b.estado === 'abierta').length}
        areasCount={areasAll.length}
      />

      {tab === 'Apuestas' && (
        <BetsTab
          bets={bets}
          loading={loading}
          createBet={createBet}
          matches={matches}
          closeBet={closeBet}
          finalizeBet={finalizeBet}
        />
      )}

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
                        {/* Selector de rol — solo Plan_pro */}
                        {isPro && (
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
                        )}

                        {/* Selector de área — solo Plan_pro */}
                        {isPro && (
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
                        )}

                        {/* Mensaje informativo para Plan_basic */}
                        {!isPro && (
                          <p
                            className="text-xs font-body text-[var(--color-text-muted)] p-3 rounded-lg"
                            style={{
                              background: 'rgba(34,217,223,0.06)',
                              border: '1px solid rgba(34,217,223,0.2)',
                            }}
                          >
                            Al confirmar, el usuario quedará activo y podrá participar en las apuestas de la empresa.
                          </p>
                        )}

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
                            disabled={isPro && (!approvingUser.tipo_usuario || !approvingUser.area_id)}
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

      {tab === 'Áreas' && isPro && (
        <AreasTab
          areasAll={areasAll}
          loadingAreas={loadingAreas}
          loadAreasAll={loadAreasAll}
          editingArea={editingArea}
          setEditingArea={setEditingArea}
          newArea={newArea}
          setNewArea={setNewArea}
          savingArea={savingArea}
          handleCreateArea={handleCreateArea}
          handleSaveEdit={handleSaveEdit}
          handleToggleArea={handleToggleArea}
        />
      )}

      {tab === 'Partidos' && (
        <PartidosAdminTab matches={matches} loadBets={loadBets} />
      )}
        </AppLayout>
  )
};