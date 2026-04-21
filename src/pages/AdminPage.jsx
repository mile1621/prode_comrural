import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import CreateBetForm from '../components/admin/CreateBetForm.jsx'
import { useBets } from '../hooks/useBets.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
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
      <div className="bg-brand-grad rounded-[var(--radius-lg)] p-6 mb-6 text-white shadow-md animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Panel Admin</h1>
          <p className="text-white opacity-80 font-body text-sm mt-1">
            Gestión de apuestas y usuarios
          </p>
        </div>
        <Badge variant="warn" className="ml-auto text-black border-none shadow-sm">Admin</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-1 w-fit mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              px-4 py-1.5 text-sm font-semibold font-body rounded-[var(--radius-sm)] transition-all relative
              ${tab === t
                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
            `}
          >
            {t}
            {t === 'Usuarios' && pendingUsers.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-danger)] text-white text-[10px] flex items-center justify-center font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Apuestas */}
      {tab === 'Apuestas' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Formulario */}
          <Card>
            <h2 className="font-display text-2xl mb-4">Nueva apuesta</h2>
            <CreateBetForm onSubmit={createBet} loading={loading} matches={matches} />
          </Card>

          {/* Lista de apuestas */}
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl">Apuestas creadas</h2>
            {bets.map(bet => (
              <Card key={bet.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold truncate">{bet.titulo}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mt-0.5">
                    {bet.premio} · {bet.tipo === 'por_equipos' ? 'Equipos' : 'Libre'}
                  </p>
                </div>
                <Badge variant={isBetOpen(bet) ? 'accent' : 'muted'}>
                  {isBetOpen(bet) ? 'Activa' : 'Cerrada'}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Usuarios */}
      {tab === 'Usuarios' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-display text-2xl">
               Pendientes de aprobación
               {pendingUsers.length > 0 && (
                 <span className="ml-2 text-[var(--color-danger)] text-xl">({pendingUsers.length})</span>
               )}
             </h2>
             <Button size="sm" variant="ghost" onClick={loadPendingUsers} loading={loadingUsers}>Actualizar</Button>
          </div>

          {loadingUsers && pendingUsers.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 gap-3">
               <span className="w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin"></span>
               <p className="text-[var(--color-text-muted)] font-body font-semibold">Cargando usuarios...</p>
             </div>
          ) : pendingUsers.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-[var(--color-text-muted)] font-body">No hay usuarios pendientes.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingUsers.map(u => (
                <Card key={u.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-body font-semibold">{u.nombre}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-body">{u.email}</p>
                    <p className="text-xs text-[var(--color-text-faint)] font-body mt-0.5">
                      {formatDate(u.fecha_registro)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveUser(u.id)}>Aprobar</Button>
                    <Button size="sm" variant="danger" onClick={() => rejectUser(u.id)}>Rechazar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
