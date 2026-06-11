/* ── Utilidades Generales ───────────────────────────────────
   Funciones helper reutilizables en todo el proyecto.
   Todas las fechas viajan como ISO UTC y se muestran en hora
   local del navegador del usuario.
   ─────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════
   FECHAS
   ══════════════════════════════════════════════════════════ */

/** Formatea una fecha ISO a "24/11/2026 16:00" en hora local */
export function formatDate(iso, opts = {}) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    ...opts,
  })
}

/** Solo día y mes + hora: "24 nov 16:00" (separador personalizable) */
export function fmtFecha(iso, separador = ' ') {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return (
    d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
    separador +
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  )
}

/**
 * Devuelve la fecha (YYYY-MM-DD) en zona LOCAL del navegador.
 * Útil para agrupar partidos por día sin que se "cambien de día"
 * al convertir a UTC. Ej: un partido 24/11 21:00 AR no debe
 * aparecer como del 25/11 solo porque en UTC lo es.
 */
export function diaLocalIso(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** Solo fecha sin hora: "24/11/2026" */
export function fmtFechaSola(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

/** Solo hora: "16:00" */
export function fmtHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

/** Fecha estilo "lunes 24 de noviembre" para agrupadores */
export function fmtFechaLarga(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long'
  })
}

/**
 * Convierte una fecha ISO del backend a timestamp.
 *
 * El backend SIEMPRE emite UTC real (fecha_cierre se guarda con
 * inputLocalAIsoUtc → new Date(local).toISOString(), y los partidos
 * se convierten a UTC real en Apps Script). Por lo tanto se interpreta
 * como UTC estándar, igual que formatDate/fmtFecha y el resto de los
 * contadores del proyecto. Cada navegador la muestra en su hora local.
 *
 * ⚠️ NO re-aplicar offset de Argentina: hacerlo empujaba el cierre 3h
 * al futuro (el contador mostraba "5h" cuando faltaban ~2h).
 */
function fechaArgentinaATimestamp(fechaISO) {
  if (!fechaISO) return null
  const date = new Date(String(fechaISO).trim())
  if (isNaN(date.getTime())) return null
  return date.getTime()
}

/** Tiempo restante hasta una fecha límite: "2d 5h", "45m", "Cerrada" */
export function timeLeft(fechaCierre) {
  const timestamp = fechaArgentinaATimestamp(fechaCierre)
  if (!timestamp) return 'Cerrada'
  
  const diff = timestamp - Date.now()
  if (diff <= 0) return 'Cerrada'
  
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/**
 * Convierte el valor de un <input type="datetime-local"> a ISO UTC.
 *
 * El input datetime-local devuelve "2026-11-24T16:00" sin zona.
 * Por default JavaScript lo interpreta en la zona del navegador
 * (lo cual es lo que queremos: el admin escribe en SU hora local
 * y cada usuario lo ve en la suya). El ISO resultante es UTC puro
 * y se puede guardar sin ambigüedad.
 *
 * @param {string} valorInput - valor crudo del input datetime-local
 * @returns {string} ISO UTC ej. "2026-11-24T19:00:00.000Z"
 */
export function inputLocalAIsoUtc(valorInput) {
  if (!valorInput) return ''
  const d = new Date(valorInput)
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}

/**
 * Convierte un ISO UTC a formato "YYYY-MM-DDTHH:mm" que espera un
 * <input type="datetime-local">, usando la zona local del navegador.
 * Útil para precargar inputs al editar.
 */
export function isoUtcAInputLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return (
    d.getFullYear() + '-' +
    pad(d.getMonth() + 1) + '-' +
    pad(d.getDate()) + 'T' +
    pad(d.getHours()) + ':' +
    pad(d.getMinutes())
  )
}

/* ══════════════════════════════════════════════════════════
   APUESTAS
   ══════════════════════════════════════════════════════════ */

/** Devuelve true si una apuesta está abierta */
export function isBetOpen(bet) {
  return bet.estado === 'abierta'
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

/* ══════════════════════════════════════════════════════════
   OTROS
   ══════════════════════════════════════════════════════════ */

/** Trunca texto a n caracteres */
export function truncate(str, n = 40) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}