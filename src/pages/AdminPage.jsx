import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import CreateBetForm from '../components/admin/CreateBetForm.jsx'
import { useBets } from '../hooks/useBets.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { formatDate, isBetOpen } from '../utils/index.js'

// Mock de usuarios pendientes (se reemplazará por sheetsApi.usuarios.listar('pendiente') en el punto B7)
const PENDING_USERS = [
  { id: 'u3', nombre: 'María López',  email: 'maria@prode.one', fecha_creacion: new Date().toISOString() },
  { id: 'u4', nombre: 'Carlos Ruiz',  email: 'carlos@prode.one', fecha_creacion: new Date().toISOString() },
]

const TABS = ['Apuestas', 'Usuarios']

export default function AdminPage() {
  const { bets, loading, createBet } = useBets()
  const [tab, setTab] = useState('Apuestas')
  const [pendingUsers, setPendingUsers] = useState(PENDING_USERS)

  function approveUser(id) {
    // TODO: conectar con authService / sheetsApi para aprobar
    setPendingUsers(prev => prev.filter(u => u.id !== id))
  }
  function rejectUser(id) {
    setPendingUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-4xl">Panel Admin</h1>
          <p className="text-[var(--color-text-muted)] font-body text-sm mt-1">
            Gestión de apuestas y usuarios
          </p>
        </div>
        <Badge variant="warn" className="ml-auto">Admin</Badge>
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
            <CreateBetForm onSubmit={createBet} loading={loading} />
          </Card>

          {/* Lista de apuestas */}
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl">Apuestas creadas</h2>
            {bets.map(bet => (
              <Card key={bet.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold truncate">{bet.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mt-0.5">
                    {bet.prize} · {bet.type}
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
          <h2 className="font-display text-2xl mb-4">
            Pendientes de aprobación
            {pendingUsers.length > 0 && (
              <span className="ml-2 text-[var(--color-danger)] text-xl">({pendingUsers.length})</span>
            )}
          </h2>

          {pendingUsers.length === 0 ? (
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
                      {formatDate(u.fecha_creacion)}
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
