/* ── Utilidades Generales ───────────────────────────────────
   Funciones helper reutilizables en todo el proyecto.
   ─────────────────────────────────────────────────────────── */

/** Formatea una fecha ISO a string legible */
export function formatDate(iso, opts = {}) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    ...opts,
  })
}

/** Tiempo restante hasta una fecha límite */
export function timeLeft(deadline) {
  const diff = new Date(deadline) - Date.now()
  if (diff <= 0) return 'Cerrada'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0)   return `${h}h ${m}m`
  return `${m}m`
}

/** Devuelve true si una apuesta está abierta */
export function isBetOpen(bet) {
  return bet.status === 'active' && new Date(bet.deadline) > Date.now()
}

/** Clases CSS para el estado de una apuesta */
export function betStatusClass(status) {
  return {
    active: 'text-accent',
    closed: 'text-muted',
    finished: 'text-warn',
  }[status] ?? 'text-muted'
}

/** Clases CSS para el estado de un partido */
export function matchStateLabel(state) {
  return {
    scheduled: { label: 'Programado', class: 'text-muted' },
    live:       { label: 'EN VIVO',   class: 'text-accent animate-pulse-accent' },
    finished:   { label: 'Finalizado', class: 'text-warn' },
  }[state] ?? { label: state, class: 'text-muted' }
}

/** Trunca texto a n caracteres */
export function truncate(str, n = 40) {
  return str.length > n ? str.slice(0, n) + '…' : str
}
