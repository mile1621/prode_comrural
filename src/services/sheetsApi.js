/* ============================================================
   PRODE ONE — API Client (Netlify Functions)

   Ahora TODA comunicación pasa por:
   /.netlify/functions/sheets

   Esto evita completamente CORS.
   ============================================================ */

const API_URL = '/.netlify/functions/sheets'

// ── Helpers de transporte ─────────────────────────────────

/**
 * GET ?action=<action>&param1=val1&...
 * Adjunta automáticamente el session_token si existe.
 */
async function get(action, params = {}) {
  const token = getToken()

  const qs = new URLSearchParams({
    action,
    ...(token ? { session_token: token } : {}),
    ...params,
  })

  const res = await fetch(`${API_URL}?${qs}`, {
    method: 'GET',
  })

  return handleResponse(res)
}

/**
 * POST con body JSON { action, ...data }
 * Adjunta automáticamente el session_token si existe.
 */
async function post(action, data = {}) {
  const token = getToken()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      ...(token ? { session_token: token } : {}),
      ...data,
    }),
  })

  return handleResponse(res)
}

async function handleResponse(res) {
  let data

  try {
    data = await res.json()
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }

  if (!data.ok) {
    throw new Error(data.error || 'Error desconocido en el servidor')
  }

  return data
}

// ── Gestión de sesión (localStorage) ─────────────────────

const TOKEN_KEY = 'prode_session_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Módulo: Sistema ───────────────────────────────────────

const sistema = {
  ping: () => get('ping'),
}

// ── Módulo: Auth ──────────────────────────────────────────

const auth = {
  login: async (email, password) => {
    const data = await post('auth.login', { email, password })
    saveToken(data.session_token)
    return data
  },

  logout: async () => {
    try {
      await post('auth.logout')
    } finally {
      clearToken()
    }
  },

  registro: (nombre, email, password) =>
    post('auth.registro', { nombre, email, password }),
}

// ── Módulo: Usuarios ──────────────────────────────────────

const usuarios = {
  listar: (estado = '') =>
    get('usuarios.listar', estado ? { estado } : {}),

  obtener: (user_id) =>
    get('usuarios.obtener', { user_id }),

  aprobar: (user_id) =>
    post('usuarios.aprobar', { user_id }),

  rechazar: (user_id) =>
    post('usuarios.rechazar', { user_id }),

  crear: (data) =>
    post('usuarios.crear', data),
}

// ── Módulo: Apuestas ──────────────────────────────────────

const apuestas = {
  listar: (estado = '') =>
    get('apuestas.listar', estado ? { estado } : {}),

  obtener: (apuesta_id) =>
    get('apuestas.obtener', { apuesta_id }),

  crear: (data) =>
    post('apuestas.crear', data),

  cerrar: (apuesta_id) =>
    post('apuestas.cerrar', { apuesta_id }),

  finalizar: (apuesta_id) =>
    post('apuestas.finalizar', { apuesta_id }),
}

// ── Módulo: Partidos ──────────────────────────────────────

const partidos = {
  listar: ({ estado, competencia } = {}) => {
    const params = {}
    if (estado) params.estado = estado
    if (competencia) params.competencia = competencia
    return get('partidos.listar', params)
  },

  obtener: (partido_id) =>
    get('partidos.obtener', { partido_id }),

  actualizar: (data) =>
    post('partidos.actualizar', data),

  sincronizar: (filtros = {}) =>
    get('partidos.sincronizar', filtros),
}

// ── Módulo: Predicciones ──────────────────────────────────

const predicciones = {
  guardar: (data) =>
    post('predicciones.guardar', data),

  mias: (apuesta_id = '') =>
    get('predicciones.mis', apuesta_id ? { apuesta_id } : {}),

  tabla: (apuesta_id) =>
    get('predicciones.tabla', { apuesta_id }),
}

// ── Export ────────────────────────────────────────────────

const sheetsApi = {
  sistema,
  auth,
  usuarios,
  apuestas,
  partidos,
  predicciones,
  _token: { get: getToken, save: saveToken, clear: clearToken },
}

export default sheetsApi