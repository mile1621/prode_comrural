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
  return bet.estado === 'abierta' && new Date(bet.fecha_cierre) > Date.now()
}

/** Clases CSS para el estado de una apuesta */
export function betStatusClass(estado) {
  return {
    abierta: 'text-accent',
    cerrada: 'text-muted',
    finalizada: 'text-warn',
  }[estado] ?? 'text-muted'
}

/** Clases CSS para el estado de un partido */
export function matchStateLabel(estado) {
  return {
    programado:  { label: 'Programado', class: 'text-muted' },
    en_vivo:     { label: 'EN VIVO',    class: 'text-accent animate-pulse-accent' },
    finalizado:  { label: 'Finalizado', class: 'text-warn' },
    cancelado:   { label: 'Cancelado',  class: 'text-danger' }
  }[estado] ?? { label: estado || '-', class: 'text-muted' }
}

/** Trunca texto a n caracteres */
export function truncate(str, n = 40) {
  return str.length > n ? str.slice(0, n) + '…' : str
}
