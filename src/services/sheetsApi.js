/* ============================================================
   PRODE ONE — Apps Script API Client
   
   Toda comunicación con el backend pasa por aquí.
   Configura la URL del Web App en tu .env:
     VITE_GAS_URL=https://script.google.com/macros/s/TU_ID/exec
   ============================================================ */

const GAS_URL = import.meta.env.VITE_GAS_URL

if (!GAS_URL) {
  console.warn('[sheetsApi] VITE_GAS_URL no está configurada en .env')
}

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

  const res = await fetch(`${GAS_URL}?${qs}`, {
    method: 'GET',
    redirect: 'follow',
  })

  return handleResponse(res)
}

/**
 * POST con body JSON { action, ...data }
 * Adjunta automáticamente el session_token si existe.
 * Usa Content-Type: text/plain para evitar preflight CORS en Apps Script.
 */
async function post(action, data = {}) {
  const token = getToken()

  const res = await fetch(GAS_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain' },
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
  /** Verifica que el backend esté activo */
  ping: () => get('ping'),
}

// ── Módulo: Auth ──────────────────────────────────────────

const auth = {
  /**
   * Inicia sesión. Guarda el session_token automáticamente.
   * @returns {{ user, session_token }}
   */
  login: async (email, password) => {
    const data = await post('auth.login', { email, password })
    saveToken(data.session_token)
    return data
  },

  /**
   * Cierra sesión. Limpia el token local siempre,
   * aunque el servidor falle.
   */
  logout: async () => {
    try {
      await post('auth.logout')
    } finally {
      clearToken()
    }
  },

  /**
   * Registro de nuevo usuario (queda pendiente de aprobación).
   * @returns {{ message }}
   */
  registro: (nombre, email, password) =>
    post('auth.registro', { nombre, email, password }),
}

// ── Módulo: Usuarios (admin) ──────────────────────────────

const usuarios = {
  /** Lista todos los usuarios. Filtro opcional: 'pendiente' | 'activo' | 'bloqueado' */
  listar: (estado = '') =>
    get('usuarios.listar', estado ? { estado } : {}),

  /** Obtiene un usuario por ID */
  obtener: (user_id) =>
    get('usuarios.obtener', { user_id }),

  /** Aprueba un usuario pendiente */
  aprobar: (user_id) =>
    post('usuarios.aprobar', { user_id }),

  /** Rechaza/bloquea un usuario */
  rechazar: (user_id) =>
    post('usuarios.rechazar', { user_id }),

  /**
   * El admin crea un usuario manualmente.
   * @param {{ nombre, email, password, rol? }} data
   */
  crear: (data) =>
    post('usuarios.crear', data),
}

// ── Módulo: Apuestas ──────────────────────────────────────

const apuestas = {
  /** Lista apuestas. Filtro opcional: 'abierta' | 'cerrada' | 'finalizada' */
  listar: (estado = '') =>
    get('apuestas.listar', estado ? { estado } : {}),

  /** Obtiene una apuesta con sus partidos embebidos */
  obtener: (apuesta_id) =>
    get('apuestas.obtener', { apuesta_id }),

  /**
   * Crea una nueva apuesta (admin).
   * @param {{
   *   titulo: string,
   *   descripcion?: string,
   *   tipo: 'libre' | 'por_equipos',
   *   premio: string,
   *   fecha_cierre: string,   // ISO string
   *   partidos_ids: string[], // IDs de partidos existentes en el Sheet
   *   puntos_exacto?: number,
   *   puntos_resultado?: number,
   * }} data
   */
  crear: (data) =>
    post('apuestas.crear', data),

  /** Cierra manualmente una apuesta abierta (admin) */
  cerrar: (apuesta_id) =>
    post('apuestas.cerrar', { apuesta_id }),

  /**
   * Finaliza la apuesta y calcula puntos (admin).
   * Todos los partidos deben estar en estado 'finalizado'.
   */
  finalizar: (apuesta_id) =>
    post('apuestas.finalizar', { apuesta_id }),
}

// ── Módulo: Partidos ──────────────────────────────────────

const partidos = {
  /** Lista partidos. Filtros opcionales: estado, competencia */
  listar: ({ estado, competencia } = {}) => {
    const params = {}
    if (estado)      params.estado      = estado
    if (competencia) params.competencia = competencia
    return get('partidos.listar', params)
  },

  /** Obtiene un partido por ID */
  obtener: (partido_id) =>
    get('partidos.obtener', { partido_id }),

  /**
   * Actualiza resultado/estado de un partido (admin).
   * @param {{
   *   partido_id: string,
   *   goles_local?: number,
   *   goles_visitante?: number,
   *   estado?: 'programado' | 'en_vivo' | 'finalizado' | 'cancelado'
   * }} data
   */
  actualizar: (data) =>
    post('partidos.actualizar', data),

  /**
   * Sincroniza partidos desde la API deportiva (admin).
   * @param {{ competencia?, temporada?, fecha_desde?, fecha_hasta? }} filtros
   */
  sincronizar: (filtros = {}) =>
    get('partidos.sincronizar', filtros),
}

// ── Módulo: Predicciones ──────────────────────────────────

const predicciones = {
  /**
   * Guarda o actualiza la predicción del usuario autenticado.
   * @param {{
   *   apuesta_id: string,
   *   partido_id: string,
   *   pred_local: number,
   *   pred_visitante: number
   * }} data
   */
  guardar: (data) =>
    post('predicciones.guardar', data),

  /** Predicciones del usuario autenticado. Filtro opcional por apuesta. */
  mias: (apuesta_id = '') =>
    get('predicciones.mis', apuesta_id ? { apuesta_id } : {}),

  /** Tabla de posiciones de una apuesta */
  tabla: (apuesta_id) =>
    get('predicciones.tabla', { apuesta_id }),
}

// ── Export unificado ──────────────────────────────────────

const sheetsApi = {
  sistema,
  auth,
  usuarios,
  apuestas,
  partidos,
  predicciones,
  // Para casos edge donde se necesite control manual del token
  _token: { get: getToken, save: saveToken, clear: clearToken },
}

export default sheetsApi
