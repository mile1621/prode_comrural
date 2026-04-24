/* ============================================================
   PRODE ONE — API Client (OPTIMIZADO + DIRECTO A APPS SCRIPT)
   - Llama directo a Apps Script (sin pasar por Netlify Function).
   - Cachea respuestas GET en memoria del cliente.
   - Invalida caché en cada POST.
   - Soporta limit en ranking (top N).
   ============================================================ */

// URL directa del deploy de Apps Script.
// Si hacés un nuevo deploy, actualizá esta URL.
const API_URL = 'https://script.google.com/macros/s/AKfycbzZzbNCHa8HS97X853VErhzHdWK0P3Z2LBU0Ox6plSLHaI6iawqNdJuQ_XEe7Qyz6aK/exec'

// ── Caché de cliente en memoria ────────────────────────────
const CLIENT_CACHE = new Map()
const CLIENT_CACHE_TTL = {
  'areas.listar': 60_000,
  'grupos.listar': 300_000,
  'partidos.listar': 30_000,
  'apuestas.listar': 30_000,
  'predicciones.mis': 15_000,
  'bootstrap': 15_000,
}

function cacheKey(action, params) {
  return action + '|' + JSON.stringify(params || {})
}
function getFromClientCache(action, params) {
  const ttl = CLIENT_CACHE_TTL[action]
  if (!ttl) return null
  const key = cacheKey(action, params)
  const entry = CLIENT_CACHE.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > ttl) {
    CLIENT_CACHE.delete(key)
    return null
  }
  return entry.data
}
function saveToClientCache(action, params, data) {
  if (!CLIENT_CACHE_TTL[action]) return
  CLIENT_CACHE.set(cacheKey(action, params), { ts: Date.now(), data })
}
function invalidateClientCache(prefix = '') {
  if (!prefix) { CLIENT_CACHE.clear(); return }
  for (const key of CLIENT_CACHE.keys()) {
    if (key.startsWith(prefix)) CLIENT_CACHE.delete(key)
  }
}

// ── Helpers de transporte ─────────────────────────────────

async function get(action, params = {}, { useCache = true } = {}) {
  if (useCache) {
    const cached = getFromClientCache(action, params)
    if (cached) return cached
  }
  const token = getToken()
  const qs = new URLSearchParams({
    action,
    ...(token ? { session_token: token } : {}),
    ...params,
  })
  const res = await fetch(`${API_URL}?${qs}`, { method: 'GET' })
  const data = await handleResponse(res)
  if (useCache) saveToClientCache(action, params, data)
  return data
}

async function post(action, data = {}) {
  const token = getToken()
  // IMPORTANTE: para evitar preflight CORS (que duplica la latencia),
  // usamos Content-Type: text/plain. Apps Script igual lee postData.contents.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action,
      ...(token ? { session_token: token } : {}),
      ...data,
    }),
  })
  const result = await handleResponse(res)
  invalidateClientCache()
  return result
}

async function handleResponse(res) {
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }
  if (!data.ok) throw new Error(data.error || 'Error desconocido en el servidor')
  return data
}

// ── Gestión de sesión ─────────────────────────────────────

const TOKEN_KEY = 'prode_session_token'
function getToken() { return localStorage.getItem(TOKEN_KEY) || null }
function saveToken(t) { localStorage.setItem(TOKEN_KEY, t) }
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  invalidateClientCache()
}

// ── Módulos ───────────────────────────────────────────────

const sistema = {
  ping: () => get('ping', {}, { useCache: false }),
}

const bootstrap = {
  cargar: () => get('bootstrap'),
}

const auth = {
  login: async (email, password) => {
    const data = await post('auth.login', { email, password })
    saveToken(data.session_token)
    return data
  },
  logout: async () => {
    try { await post('auth.logout') } finally { clearToken() }
  },
  registro: (nombre, email, password) =>
    post('auth.registro', { nombre, email, password }),

  // Recuperación de contraseña (flujo de 3 pasos)
  resetSolicitar: (email) =>
    post('auth.reset_solicitar', { email }),
  resetValidar: (token) =>
    post('auth.reset_validar', { token }),
  resetConfirmar: (token, password) =>
    post('auth.reset_confirmar', { token, password }),
}

const usuarios = {
  listar: (estado = '') => get('usuarios.listar', estado ? { estado } : {}, { useCache: false }),
  obtener: (user_id) => get('usuarios.obtener', { user_id }, { useCache: false }),
  aprobar: (user_id, tipo_usuario, area_id) => post('usuarios.aprobar', { user_id, tipo_usuario, area_id }),
  rechazar: (user_id) => post('usuarios.rechazar', { user_id }),
  crear: (data) => post('usuarios.crear', data),
}

const apuestas = {
  listar: (estado = '') => get('apuestas.listar', estado ? { estado } : {}),
  obtener: (apuesta_id) => get('apuestas.obtener', { apuesta_id }),
  crear: (data) => post('apuestas.crear', data),
  cerrar: (apuesta_id) => post('apuestas.cerrar', { apuesta_id }),
  finalizar: (apuesta_id) => post('apuestas.finalizar', { apuesta_id }),
}

const partidos = {
  listar: ({ estado, fase, grupo, jornada } = {}) => {
    const params = {}
    if (estado) params.estado = estado
    if (fase) params.fase = fase
    if (grupo) params.grupo = grupo
    if (jornada) params.jornada = jornada
    return get('partidos.listar', params)
  },
  obtener: (partido_id) => get('partidos.obtener', { partido_id }),
  actualizar: (data) => post('partidos.actualizar', data),
  sincronizar: (filtros = {}) => get('partidos.sincronizar', filtros, { useCache: false }),
}

const predicciones = {
  guardar: (data) => post('predicciones.guardar', data),
  mias: (apuesta_id = '') => get('predicciones.mis', apuesta_id ? { apuesta_id } : {}),
  // Ranking: acepta { limit } para top N. Default 50.
  // Devuelve: { tabla, total, mi_posicion, esta_en_top, apuesta_titulo }
  tabla: (apuesta_id, opciones = {}) => {
    const params = { apuesta_id }
    if (opciones.limit) params.limit = opciones.limit
    return get('predicciones.tabla', params, { useCache: false })
  },
}

const grupos = {
  listar: () => get('grupos.listar'),
}

const areas = {
  listar: (solo_activas = true) => get('areas.listar', { solo_activas }),
  crear: (data) => post('areas.crear', data),
  editar: (data) => post('areas.editar', data),
  toggle_activa: (area_id) => post('areas.toggle_activa', { area_id }),
}

// ── Export ────────────────────────────────────────────────

const sheetsApi = {
  sistema,
  bootstrap,
  auth,
  usuarios,
  apuestas,
  partidos,
  predicciones,
  grupos,
  areas,
  _token: { get: getToken, save: saveToken, clear: clearToken },
  _cache: { invalidate: invalidateClientCache },
}

export default sheetsApi