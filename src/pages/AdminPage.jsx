import { useState, useEffect } from 'react'
import AppLayout   from '../components/layout/AppLayout.jsx'
import { useBets } from '../hooks/useBets.jsx'
import sheetsApi   from '../services/sheetsApi.js'

import AdminHeader from '../components/admin/AdminHeader.jsx'
import AdminTabs   from '../components/admin/AdminTabs.jsx'
import BetsTab     from '../components/admin/BetsTab.jsx'
import UsersTab    from '../components/admin/UsersTab.jsx'
import AreasTab    from '../components/admin/AreasTab.jsx'
import PartidosAdminTab from '../components/admin/PartidosAdminTab.jsx'

export default function AdminPage() {
  const { bets, loading, createBet, closeBet, finalizeBet, matches, loadBets } = useBets()
  const [tab, setTab] = useState('Apuestas')

  /* ── Usuarios ─────────────────────────────────────────── */
  const [pendingUsers,  setPendingUsers ] = useState([])
  const [loadingUsers,  setLoadingUsers ] = useState(false)
  const [areas,         setAreas        ] = useState([])
  const [approvingUser, setApprovingUser] = useState(null)

  /* ── Áreas ────────────────────────────────────────────── */
  const [areasAll,     setAreasAll    ] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(false)
  const [editingArea,  setEditingArea ] = useState(null)
  const [newArea,      setNewArea     ] = useState({ nombre: '', descripcion: '' })
  const [savingArea,   setSavingArea  ] = useState(false)

  /* ── Efectos ──────────────────────────────────────────── */
  useEffect(() => {
    if (tab === 'Usuarios') { loadPendingUsers(); loadAreas() }
    if (tab === 'Áreas')    { loadAreasAll() }
  }, [tab])

  /* ── Funciones: Áreas ─────────────────────────────────── */
  async function loadAreas() {
    try { const r = await sheetsApi.areas.listar(true); setAreas(r.areas || []) }
    catch (e) { console.error('Error cargando áreas:', e) }
  }

  async function loadAreasAll() {
    setLoadingAreas(true)
    try { const r = await sheetsApi.areas.listar(false); setAreasAll(r.areas || []) }
    catch (e) { alert('Error cargando áreas: ' + e.message) }
    finally   { setLoadingAreas(false) }
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
    finally     { setSavingArea(false) }
  }

  async function handleSaveEdit() {
    if (!editingArea.nombre.trim()) return alert('El nombre no puede estar vacío.')
    setSavingArea(true)
    try {
      await sheetsApi.areas.editar({ area_id: editingArea.id, nombre: editingArea.nombre.trim(), descripcion: editingArea.descripcion?.trim() || '' })
      setEditingArea(null)
      await loadAreasAll()
    } catch (e) { alert('Error guardando cambios: ' + e.message) }
    finally     { setSavingArea(false) }
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
    finally   { setLoadingUsers(false) }
  }

  async function confirmApprove(id) {
    if (!approvingUser.tipo_usuario || !approvingUser.area_id)
      return alert('Debés seleccionar el rol y el área del usuario.')
    try {
      await sheetsApi.usuarios.aprobar(id, approvingUser.tipo_usuario, approvingUser.area_id)
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
        <UsersTab
          pendingUsers={pendingUsers}
          loadingUsers={loadingUsers}
          loadPendingUsers={loadPendingUsers}
          areas={areas}
          approvingUser={approvingUser}
          setApprovingUser={setApprovingUser}
          confirmApprove={confirmApprove}
          rejectUser={rejectUser}
        />
      )}

      {tab === 'Áreas' && (
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
}