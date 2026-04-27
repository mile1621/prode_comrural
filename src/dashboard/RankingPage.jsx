/**
 * RankingPage.jsx — Rediseño completo
 * Ubicación: src/dashboard/RankingPage.jsx
 *
 * Features:
 *  - Lista de apuestas seleccionables (vista inicial)
 *  - Podio top 3 destacado al elegir una apuesta
 *  - Tabla del 4 al N con avatar, agregados (exactos / dif. / resultado) y puntos
 *  - Click en fila → expande mostrando predicciones partido por partido vs resultado real
 *  - Fila pegajosa "Tu posición" si el usuario está fuera del top visible
 *  - Lazy load: el detalle de cada usuario se trae solo al expandir su fila
 *  - Cache local del detalle expandido (no re-pide si volvés a expandir)
 *  - Admin puede expandir cualquier fila; usuarios sólo la propia
 */
import { useState, useEffect, useMemo } from 'react'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import sheetsApi from '../services/sheetsApi.js'
import { fmtFecha } from '../utils/index.js'

/* ── Tokens visuales (alineados al resto del dashboard) ───────────── */
const NAVY   = '#0c182b'
const GOLD   = '#c99f16'
const GOLD2  = '#ebc32b'
const GREEN  = '#1b8a5a'
const RED    = '#e03252'
const MUTED  = '#5f6e8a'
const BORDER = '#f0eadb'
const BG_SOFT = '#faf7f0'

const CARD = {
  background: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  boxShadow: '0 1px 0 rgba(12,24,43,.04)'
}
const TEXT_MUTED = { fontSize: '.76rem', color: MUTED }

/* ── Helpers locales ──────────────────────────────────────────────── */
function isOpen(b) {
  return b.estado === 'abierta' && new Date(b.fecha_cierre) > Date.now()
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('') || '?'
}
function clasificarPuntos(p, apuesta) {
  // Devuelve: 'exacto' | 'diferencia' | 'resultado' | 'cero' | null
  const ptsExacto = parseInt(apuesta?.puntos_exacto) || 5
  const ptsDif    = parseInt(apuesta?.puntos_diferencia) || 3
  const ptsRes    = parseInt(apuesta?.puntos_resultado) || 1
  const n = parseInt(p)
  if (isNaN(n)) return null
  if (n === ptsExacto) return 'exacto'
  if (n === ptsDif)    return 'diferencia'
  if (n === ptsRes)    return 'resultado'
  return 'cero'
}
const COLORES_PUNTOS = {
  exacto:     { bg: 'rgba(27,138,90,.12)',  fg: GREEN, label: 'Exacto'     },
  diferencia: { bg: 'rgba(201,159,22,.14)', fg: GOLD,  label: 'Diferencia' },
  resultado:  { bg: 'rgba(95,110,138,.12)', fg: MUTED, label: 'Resultado'  },
  cero:       { bg: 'rgba(224,50,82,.08)',  fg: RED,   label: 'Falló'      },
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ══════════════════════════════════════════════════════════════════ */
export default function RankingPage() {
  const { bets, loading: lb } = useBets()
  const { user } = useAuth()
  const esAdmin = user?.rol === 'admin'

  /* Estado de selección de apuesta */
  const [sel, setSel] = useState(null)            // apuesta seleccionada (con detalle)
  const [tabla, setTabla] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)

  /* Estado del lazy load de filas expandidas */
  const [expandido, setExpandido] = useState(null) // user_id expandido
  const [detalles, setDetalles]   = useState({})   // { user_id: { preds, loading, error } }

  async function cargarRanking(bet) {
    setSel(bet)
    setLoading(true)
    setTabla([])
    setMeta({})
    setExpandido(null)
    setDetalles({})
    try {
      // Pedimos en paralelo: ranking + detalle completo de la apuesta (con partidos+resultados)
      const [rTabla, rApuesta] = await Promise.all([
        sheetsApi.predicciones.tabla(bet.id),
        sheetsApi.apuestas.obtener(bet.id)
      ])
      setTabla(rTabla.tabla || [])
      setMeta({
        total: rTabla.total,
        mi_posicion: rTabla.mi_posicion,
        esta_en_top: rTabla.esta_en_top,
      })
      // Guardamos la apuesta enriquecida (con partidos) para usar al expandir
      setSel(prev => ({ ...(prev || bet), ...rApuesta.apuesta }))
    } catch (e) {
      alert('Error cargando ranking: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function volver() {
    setSel(null)
    setTabla([])
    setMeta({})
    setExpandido(null)
    setDetalles({})
  }

  /* Toggle de fila expandida con lazy load */
  async function toggleExpandir(userId) {
    // Validación: solo el propio usuario o admin
    const puedeVer = esAdmin || userId === user?.id
    if (!puedeVer) return

    // Si ya estaba expandido, colapsar
    if (expandido === userId) {
      setExpandido(null)
      return
    }
    setExpandido(userId)

    // Si ya tenemos los datos cacheados, no re-pedimos
    if (detalles[userId] && !detalles[userId].error) return

    setDetalles(prev => ({ ...prev, [userId]: { loading: true, preds: [], error: null } }))
    try {
      // Estrategia robusta:
      // - Si es mi propio usuario, uso siempre el endpoint clásico (predicciones.mias)
      //   que funciona con cualquier versión del backend.
      // - Si soy admin viendo a otro usuario, uso predicciones.deUsuario (requiere backend v2).
      //   Si el método no existe (porque sheetsApi es viejo), avisamos amigablemente.
      let resp
      if (userId === user?.id) {
        resp = await sheetsApi.predicciones.mias(sel.id)
      } else if (typeof sheetsApi.predicciones.deUsuario === 'function') {
        resp = await sheetsApi.predicciones.deUsuario(sel.id, userId)
      } else {
        throw new Error('Esta versión del frontend no permite ver predicciones de otros usuarios. Actualizá sheetsApi.js.')
      }
      setDetalles(prev => ({
        ...prev,
        [userId]: { loading: false, preds: resp.predicciones || [], error: null }
      }))
    } catch (err) {
      // Mensaje amigable según el tipo de error
      let mensaje = err.message || 'Error desconocido'
      if (mensaje.toLowerCase().includes('sesión') || mensaje.toLowerCase().includes('session')) {
        mensaje = 'Tu sesión expiró. Cerrá sesión y volvé a entrar para ver el detalle.'
      } else if (mensaje.toLowerCase().includes('acceso') || mensaje.toLowerCase().includes('admin')) {
        mensaje = 'No tenés permisos para ver el detalle de este usuario.'
      } else if (mensaje.toLowerCase().includes('user_id') || mensaje.toLowerCase().includes('parámetro')) {
        mensaje = 'El backend está desactualizado. Hace falta deployar la nueva versión de Code.gs en Apps Script.'
      }
      setDetalles(prev => ({
        ...prev,
        [userId]: { loading: false, preds: [], error: mensaje }
      }))
    }
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <AppShell>
      <style>{`
        @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .din{animation:din .38s ease both}
        @keyframes skp{0%,100%{opacity:.7}50%{opacity:.3}}
        @keyframes expand{from{opacity:0;max-height:0}to{opacity:1;max-height:1200px}}
        .row-hover:hover{background:rgba(12,24,43,.035)!important}
        .clickable{cursor:pointer;transition:background .15s}
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="din" style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 'clamp(2.4rem,6vw,3.5rem)',
            color: NAVY, margin: '0 0 .3rem', lineHeight: 1, letterSpacing: '.02em'
          }}>RANKING</h1>
          <p style={{ ...TEXT_MUTED, margin: 0 }}>
            {sel
              ? `Tabla de "${sel.titulo}"`
              : 'Seleccioná una apuesta para ver la tabla de posiciones'}
          </p>
        </div>

        {/* ── Vista 1: lista de apuestas ─────────────────────────── */}
        {!sel && (
          <ListaDeApuestas
            bets={bets} loading={lb} onPick={cargarRanking}
          />
        )}

        {/* ── Vista 2: ranking de la apuesta ─────────────────────── */}
        {sel && (
          <div className="din">
            {/* Botón volver */}
            <button
              onClick={volver}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                marginBottom: '1.5rem', background: 'transparent',
                border: `1px solid ${BORDER}`, borderRadius: 99,
                padding: '.35rem .85rem', fontFamily: "'DM Sans',sans-serif",
                fontSize: '.78rem', fontWeight: 600, color: MUTED, cursor: 'pointer',
                transition: 'all .16s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.color = NAVY }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Volver
            </button>

            {/* Banner de la apuesta */}
            <BannerApuesta apuesta={sel} meta={meta} />

            {loading ? (
              <TablaSkeleton />
            ) : tabla.length === 0 ? (
              <div style={{ ...CARD, padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: MUTED, margin: 0 }}>
                  Sin participantes todavía
                </p>
              </div>
            ) : (
              <>
                {/* Podio top 3 (clickeable: expande detalle como las filas) */}
                <Podio
                  top={tabla.slice(0, 3)}
                  miUserId={user?.id}
                  esAdmin={esAdmin}
                  expandido={expandido}
                  detalles={detalles}
                  apuesta={sel}
                  onToggle={toggleExpandir}
                />

                {/* Tabla del 4 a N */}
                {tabla.length > 3 && (
                  <TablaPosiciones
                    filas={tabla.slice(3)}
                    offset={3}
                    miUserId={user?.id}
                    expandido={expandido}
                    detalles={detalles}
                    apuesta={sel}
                    esAdmin={esAdmin}
                    onToggle={toggleExpandir}
                  />
                )}

                {/* Mensaje cuando hay pocos participantes (no hay tabla) */}
                {tabla.length > 0 && tabla.length <= 3 && (
                  <div style={{
                    textAlign: 'center', padding: '.8rem', marginTop: '.5rem',
                    fontSize: '.78rem', color: MUTED
                  }}>
                    Estos son {tabla.length === 1 ? 'el único participante' : `los ${tabla.length} participantes`} de la apuesta.
                    {esAdmin && ' Tocá una tarjeta para ver el detalle de sus predicciones.'}
                  </div>
                )}

                {/* Fila pegajosa: tu posición (solo si no estás en el top visible) */}
                {meta.mi_posicion && !meta.esta_en_top && (
                  <FilaPegajosa
                    miPos={meta.mi_posicion}
                    apuesta={sel}
                    expandida={expandido === user?.id}
                    detalle={detalles[user?.id]}
                    onToggle={() => toggleExpandir(user?.id)}
                  />
                )}

                {/* Leyenda */}
                <Leyenda apuesta={sel} total={meta.total} mostrando={tabla.length} />
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

/* ══════════════════════════════════════════════════════════════════
   LISTA DE APUESTAS (vista inicial)
   ══════════════════════════════════════════════════════════════════ */
function ListaDeApuestas({ bets, loading, onPick }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 70, ...CARD, animation: 'skp 1.4s ease infinite' }} />
        ))}
      </div>
    )
  }
  if (bets.length === 0) {
    return (
      <div style={{ ...CARD, padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, color: MUTED, margin: 0 }}>
          No hay apuestas disponibles
        </p>
      </div>
    )
  }
  return (
    <div className="din" style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
      {bets.map(bet => {
        const open = isOpen(bet)
        const estadoLabel = bet.estado === 'finalizada' ? 'Finalizada' : open ? 'Activa' : 'Cerrada'
        const estadoColor = bet.estado === 'finalizada' ? GOLD : open ? GREEN : MUTED
        return (
          <div
            key={bet.id}
            className="clickable"
            style={{
              ...CARD, padding: '.9rem 1.1rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: 'pointer', transition: 'all .17s'
            }}
            onClick={() => onPick(bet)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = GOLD2
              e.currentTarget.style.transform = 'translateX(3px)'
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(12,24,43,.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = BORDER
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 1px 0 rgba(12,24,43,.04)'
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 600, fontSize: '.9rem', color: NAVY, margin: '0 0 .2rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{bet.titulo}</p>
              <p style={{ ...TEXT_MUTED, margin: 0 }}>
                {bet.premio || ''}
                {bet.partidos_ids ? ` · ${bet.partidos_ids.split(',').filter(Boolean).length} partidos` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.1em',
                  color: '#a8b2c4', margin: '0 0 2px'
                }}>Participantes</p>
                <p style={{
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.4rem',
                  color: NAVY, margin: 0, lineHeight: 1
                }}>{bet.participantes || 0}</p>
              </div>
              <span style={{
                padding: '.22rem .65rem', borderRadius: 99,
                fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.07em',
                background: `${estadoColor}14`, color: estadoColor,
                border: `1px solid ${estadoColor}33`
              }}>{estadoLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   BANNER NAVY DE LA APUESTA
   ══════════════════════════════════════════════════════════════════ */
function BannerApuesta({ apuesta, meta }) {
  return (
    <div style={{
      borderRadius: 16, padding: '1.2rem 1.5rem', marginBottom: '1.4rem',
      background: NAVY, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 220, height: '100%',
        background: 'radial-gradient(ellipse at 80% 50%,rgba(235,195,43,.14),transparent 65%)',
        pointerEvents: 'none'
      }} />
      <p style={{
        fontWeight: 700, fontSize: '.65rem', textTransform: 'uppercase',
        letterSpacing: '.14em', color: 'rgba(235,195,43,.7)', margin: '0 0 .3rem'
      }}>Tabla de posiciones</p>
      <h2 style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem',
        color: '#fff', margin: '0 0 .2rem', letterSpacing: '.02em'
      }}>{apuesta.titulo}</h2>
      {meta.total > 0 && (
        <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.45)', margin: 0 }}>
          {meta.total} {meta.total === 1 ? 'participante' : 'participantes'}
          {meta.mi_posicion ? ` · Tu posición: #${meta.mi_posicion.posicion}` : ''}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PODIO TOP 3 (clickeable: expande detalle como las filas)
   - 1 participante: solo la tarjeta del líder, centrada y compacta
   - 2 participantes: dos tarjetas lado a lado (líder marcado a la derecha)
   - 3+: podio clásico 2-1-3 con el líder destacado al centro
   ══════════════════════════════════════════════════════════════════ */
function Podio({ top, miUserId, esAdmin, expandido, detalles, apuesta, onToggle }) {
  if (top.length === 0) return null

  const config = {
    [top[0]?.user_id]: { rank: 1, alto: true,  medal: '🥇' },
    [top[1]?.user_id]: { rank: 2, alto: false, medal: '🥈' },
    [top[2]?.user_id]: { rank: 3, alto: false, medal: '🥉' },
  }

  // Definir orden visual y layout según cantidad de participantes
  let orden, gridCols, maxWidth
  if (top.length === 1) {
    orden = [top[0]]
    gridCols = '1fr'
    maxWidth = 320
  } else if (top.length === 2) {
    orden = [top[1], top[0]]
    gridCols = '1fr 1fr'
    maxWidth = 640
  } else {
    orden = [top[1], top[0], top[2]]
    gridCols = '1fr 1.15fr 1fr'
    maxWidth = '100%'
  }

  const idExpandidoEnPodio = top.find(u => u.user_id === expandido)?.user_id

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: '.6rem', alignItems: 'end',
        maxWidth, marginLeft: 'auto', marginRight: 'auto'
      }}>
        {orden.map(u => {
          const cfg = config[u.user_id]
          const me = u.user_id === miUserId
          const esLider = cfg.rank === 1
          const cardAlto = top.length <= 2 ? true : cfg.alto
          const puedeExpandir = esAdmin || me
          const isOpen = expandido === u.user_id
          return (
            <div
              key={u.user_id}
              onClick={puedeExpandir && onToggle ? () => onToggle(u.user_id) : undefined}
              style={{
                ...CARD,
                padding: esLider ? '1.4rem .75rem 1rem' : cardAlto ? '1.2rem .75rem 1rem' : '1rem .75rem .9rem',
                textAlign: 'center', position: 'relative',
                border: isOpen ? `2px solid ${GOLD}`
                       : esLider ? `2px solid ${GOLD}`
                       : me ? `2px solid ${GOLD2}`
                       : `1px solid ${BORDER}`,
                background: esLider ? `linear-gradient(180deg, rgba(235,195,43,.08), #fff 60%)` : '#fff',
                cursor: puedeExpandir ? 'pointer' : 'default',
                transition: 'transform .15s, box-shadow .15s'
              }}
              onMouseEnter={e => {
                if (puedeExpandir) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(12,24,43,.1)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(12,24,43,.04)'
              }}>
              {esLider && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: GOLD, color: '#fff',
                  fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  padding: '.18rem .6rem', borderRadius: 99,
                  whiteSpace: 'nowrap'
                }}>★ Líder</div>
              )}
              <div style={{
                fontSize: cardAlto ? '1.4rem' : '1.1rem', marginBottom: '.3rem'
              }}>{cfg.medal}</div>
              <div style={{
                width: cardAlto ? 56 : 44, height: cardAlto ? 56 : 44,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${GOLD2}, ${GOLD})`,
                color: NAVY,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue',sans-serif", fontSize: cardAlto ? '1.3rem' : '1rem',
                margin: '0 auto .55rem', letterSpacing: '.04em'
              }}>{initials(u.nombre)}</div>
              <p style={{
                fontWeight: 700, fontSize: cardAlto ? '.95rem' : '.85rem',
                color: NAVY, margin: '0 0 .15rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {u.nombre} {me && <span style={{ fontSize: '.65rem', color: MUTED, fontWeight: 500 }}>(vos)</span>}
              </p>
              <p style={{ ...TEXT_MUTED, fontSize: '.68rem', margin: '0 0 .55rem' }}>
                {u.predicciones} pred · {u.aciertos_exactos} exactos
              </p>
              <p style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: cardAlto ? '2rem' : '1.55rem',
                color: esLider ? GOLD : NAVY,
                margin: 0, lineHeight: 1, letterSpacing: '.02em'
              }}>
                {u.puntos_totales}
                <span style={{ fontSize: '.6rem', color: MUTED, fontWeight: 400, marginLeft: 4, letterSpacing: '.1em' }}>PTS</span>
              </p>
              {puedeExpandir && (
                <div style={{
                  marginTop: '.5rem', paddingTop: '.5rem',
                  borderTop: `1px dashed ${BORDER}`,
                  fontSize: '.62rem', color: isOpen ? GOLD : '#a8b2c4',
                  fontWeight: 600, letterSpacing: '.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.25rem'
                }}>
                  {isOpen ? 'Ocultar detalle' : 'Ver detalle'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detalle expandido del podio (debajo de las tarjetas) */}
      {idExpandidoEnPodio && (
        <div style={{
          marginTop: '.85rem',
          ...CARD, overflow: 'hidden',
          border: `2px solid ${GOLD}`
        }}>
          <div style={{
            background: NAVY, color: '#fff',
            padding: '.6rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{
              fontSize: '.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.1em',
              color: GOLD2
            }}>
              Detalle de {top.find(u => u.user_id === idExpandidoEnPodio)?.nombre}
            </span>
            <button
              onClick={() => onToggle(idExpandidoEnPodio)}
              style={{
                background: 'transparent', border: 'none', color: GOLD2,
                cursor: 'pointer', fontSize: '.75rem', padding: 0
              }}>✕ Cerrar</button>
          </div>
          <DetalleExpandido detalle={detalles?.[idExpandidoEnPodio]} apuesta={apuesta} />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TABLA DE POSICIONES (4-N) CON FILAS EXPANDIBLES
   ══════════════════════════════════════════════════════════════════ */
function TablaPosiciones({ filas, offset, miUserId, expandido, detalles, apuesta, esAdmin, onToggle }) {
  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 130px 70px 24px',
        padding: '.7rem 1rem',
        background: 'rgba(12,24,43,.03)',
        borderBottom: `1px solid ${BORDER}`,
        gap: '.5rem', alignItems: 'center'
      }}>
        <span style={hdrStyle()}>#</span>
        <span style={hdrStyle()}>Participante</span>
        <span style={{ ...hdrStyle(), textAlign: 'center' }}>Aciertos</span>
        <span style={{ ...hdrStyle(), textAlign: 'right' }}>Puntos</span>
        <span />
      </div>

      {filas.map((u, i) => {
        const pos = offset + i + 1
        const me = u.user_id === miUserId
        const puedeExpandir = esAdmin || me
        const isOpen = expandido === u.user_id
        const detalle = detalles[u.user_id]

        return (
          <div key={u.user_id} style={{ borderBottom: i < filas.length - 1 ? `1px solid #f5f3ee` : 'none' }}>
            {/* Fila colapsada */}
            <div
              className={puedeExpandir ? 'clickable row-hover' : ''}
              onClick={puedeExpandir ? () => onToggle(u.user_id) : undefined}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 130px 70px 24px',
                padding: '.75rem 1rem', gap: '.5rem', alignItems: 'center',
                background: me ? 'rgba(235,195,43,.06)' : isOpen ? 'rgba(12,24,43,.025)' : '#fff',
                cursor: puedeExpandir ? 'pointer' : 'default',
                transition: 'background .15s'
              }}>
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: '1.05rem', color: '#a8b2c4'
              }}>{pos}</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: me
                    ? `linear-gradient(135deg, ${GOLD2}, ${GOLD})`
                    : 'rgba(12,24,43,.08)',
                  color: me ? NAVY : NAVY,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: '.78rem',
                  flexShrink: 0
                }}>{initials(u.nombre)}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: me ? 700 : 600, fontSize: '.86rem',
                    color: me ? GOLD : NAVY, margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {u.nombre} {me && <span style={{ fontSize: '.65rem', color: MUTED, fontWeight: 500 }}>(vos)</span>}
                  </p>
                  <p style={{ ...TEXT_MUTED, fontSize: '.7rem', margin: 0 }}>
                    {u.predicciones} {u.predicciones === 1 ? 'predicción' : 'predicciones'}
                  </p>
                </div>
              </div>

              {/* Agregados */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: '.55rem', fontSize: '.72rem', color: MUTED
              }}>
                <BadgeAcierto color={GREEN} count={u.aciertos_exactos} title="Exactos" />
                <BadgeAcierto color={GOLD} count={u.aciertos_diferencia || 0} title="Diferencia" />
                <BadgeAcierto color={MUTED} count={u.aciertos_resultado} title="Resultado" />
              </div>

              <span style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.3rem',
                color: NAVY, textAlign: 'right'
              }}>
                {u.puntos_totales}
                <span style={{ fontSize: '.55rem', color: MUTED, fontWeight: 400, marginLeft: 3, letterSpacing: '.1em' }}>PTS</span>
              </span>

              {puedeExpandir ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? GOLD : '#a8b2c4'} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              ) : <span />}
            </div>

            {/* Fila expandida */}
            {isOpen && (
              <DetalleExpandido detalle={detalle} apuesta={apuesta} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function hdrStyle() {
  return {
    fontSize: '.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.1em',
    color: '#a8b2c4'
  }
}

function BadgeAcierto({ color, count, title }) {
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontWeight: 600, color: count > 0 ? color : '#a8b2c4'
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: count > 0 ? color : 'rgba(12,24,43,.15)',
        display: 'inline-block'
      }} />
      {count}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════
   DETALLE EXPANDIDO (predicciones partido por partido)
   ══════════════════════════════════════════════════════════════════ */
function DetalleExpandido({ detalle, apuesta }) {
  if (!detalle || detalle.loading) {
    return (
      <div style={{
        padding: '1rem', background: BG_SOFT,
        borderTop: `1px solid ${BORDER}`,
        animation: 'expand .2s ease both'
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 38, marginBottom: 6, borderRadius: 8,
            background: 'rgba(12,24,43,.05)',
            animation: 'skp 1.4s ease infinite'
          }} />
        ))}
      </div>
    )
  }

  if (detalle.error) {
    return (
      <div style={{
        padding: '1rem', background: BG_SOFT,
        borderTop: `1px solid ${BORDER}`,
        textAlign: 'center', color: RED, fontSize: '.8rem'
      }}>
        Error: {detalle.error}
      </div>
    )
  }

  const partidos = apuesta?.partidos || []
  const predsPorPartido = new Map((detalle.preds || []).map(p => [p.partido_id, p]))

  return (
    <div style={{
      padding: '.85rem 1rem 1rem', background: BG_SOFT,
      borderTop: `1px solid ${BORDER}`,
      animation: 'expand .25s ease both'
    }}>
      <p style={{
        fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '.12em', color: '#a8b2c4', margin: '0 0 .55rem .25rem'
      }}>Detalle por partido</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {partidos.length === 0 && (
          <p style={{ ...TEXT_MUTED, textAlign: 'center', margin: '.5rem 0' }}>
            No hay partidos cargados en esta apuesta
          </p>
        )}
        {partidos.map(p => {
          const pred = predsPorPartido.get(p.id)
          return (
            <PartidoFila key={p.id} partido={p} pred={pred} apuesta={apuesta} />
          )
        })}
      </div>
    </div>
  )
}

function PartidoFila({ partido, pred, apuesta }) {
  const fin = partido.estado === 'finalizado'
  const tieneScore = partido.goles_local !== '' && partido.goles_local !== null && !isNaN(parseInt(partido.goles_local))
  const cat = pred ? clasificarPuntos(pred.puntos, apuesta) : null
  const colorCat = cat ? COLORES_PUNTOS[cat] : null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 70px 70px 64px',
      alignItems: 'center', gap: '.5rem',
      padding: '.55rem .75rem', borderRadius: 8,
      background: '#fff',
      border: `1px solid ${BORDER}`
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          overflow: 'hidden'
        }}>
          {partido.bandera_local && (
            <img src={partido.bandera_local} alt="" style={{
              width: 18, height: 13, objectFit: 'cover',
              borderRadius: 2, border: `1px solid ${BORDER}`, flexShrink: 0
            }} />
          )}
          <span style={{
            fontSize: '.78rem', fontWeight: 600, color: NAVY,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{partido.equipo_local}</span>
          <span style={{ fontSize: '.66rem', color: '#a8b2c4', flexShrink: 0 }}>vs</span>
          <span style={{
            fontSize: '.78rem', fontWeight: 600, color: NAVY,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{partido.equipo_visitante}</span>
          {partido.bandera_visitante && (
            <img src={partido.bandera_visitante} alt="" style={{
              width: 18, height: 13, objectFit: 'cover',
              borderRadius: 2, border: `1px solid ${BORDER}`, flexShrink: 0
            }} />
          )}
        </div>
        <p style={{ ...TEXT_MUTED, fontSize: '.65rem', margin: '2px 0 0' }}>
          {partido.fase || ''}
          {partido.fecha_partido ? ` · ${fmtFecha(partido.fecha_partido)}` : ''}
        </p>
      </div>

      {/* Predicción */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '.55rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.1em', color: '#a8b2c4', margin: '0 0 1px'
        }}>Pred.</p>
        {pred ? (
          <p style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.05rem',
            color: GOLD, margin: 0, lineHeight: 1
          }}>{pred.pred_local} - {pred.pred_visitante}</p>
        ) : (
          <p style={{ fontSize: '.7rem', color: '#a8b2c4', margin: 0, fontStyle: 'italic' }}>—</p>
        )}
      </div>

      {/* Resultado real */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '.55rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.1em', color: '#a8b2c4', margin: '0 0 1px'
        }}>Real</p>
        {tieneScore ? (
          <p style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.05rem',
            color: NAVY, margin: 0, lineHeight: 1
          }}>{partido.goles_local} - {partido.goles_visitante}</p>
        ) : (
          <p style={{ fontSize: '.65rem', color: '#a8b2c4', margin: 0, fontStyle: 'italic' }}>
            por jugar
          </p>
        )}
      </div>

      {/* Puntos */}
      <div style={{ textAlign: 'right' }}>
        {pred && fin && colorCat ? (
          <span title={colorCat.label} style={{
            display: 'inline-block',
            background: colorCat.bg, color: colorCat.fg,
            fontSize: '.7rem', fontWeight: 700,
            padding: '.2rem .55rem', borderRadius: 99,
            border: `1px solid ${colorCat.fg}33`,
            minWidth: 36, textAlign: 'center'
          }}>+{parseInt(pred.puntos) || 0}</span>
        ) : (
          <span style={{ fontSize: '.7rem', color: '#a8b2c4' }}>—</span>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FILA PEGAJOSA (mi posición, cuando estoy fuera del top visible)
   ══════════════════════════════════════════════════════════════════ */
function FilaPegajosa({ miPos, apuesta, expandida, detalle, onToggle }) {
  return (
    <div style={{
      position: 'sticky', bottom: 12, marginTop: '1rem', zIndex: 10
    }}>
      <div style={{
        background: NAVY, color: '#fff',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(12,24,43,.25)',
        border: `2px solid ${GOLD}`
      }}>
        <div
          onClick={onToggle}
          className="clickable"
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 130px 70px 24px',
            padding: '.75rem 1rem', gap: '.5rem', alignItems: 'center'
          }}>
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', color: GOLD2
          }}>#{miPos.posicion}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${GOLD2}, ${GOLD})`,
              color: NAVY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue',sans-serif", fontSize: '.78rem'
            }}>{initials(miPos.nombre)}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontWeight: 700, fontSize: '.85rem', color: '#fff', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{miPos.nombre} <span style={{ fontSize: '.65rem', color: GOLD2, fontWeight: 500 }}>(vos)</span></p>
              <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.55)', margin: 0 }}>
                {miPos.predicciones} {miPos.predicciones === 1 ? 'predicción' : 'predicciones'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '.55rem', fontSize: '.72rem' }}>
            <BadgePegajoso color={GREEN}  count={miPos.aciertos_exactos} />
            <BadgePegajoso color={GOLD2} count={miPos.aciertos_diferencia || 0} />
            <BadgePegajoso color="rgba(255,255,255,.6)" count={miPos.aciertos_resultado} />
          </div>

          <span style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.3rem',
            color: GOLD2, textAlign: 'right'
          }}>
            {miPos.puntos_totales}
            <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.5)', fontWeight: 400, marginLeft: 3, letterSpacing: '.1em' }}>PTS</span>
          </span>

          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={GOLD2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expandida ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {expandida && (
          <div style={{ background: '#fff', color: NAVY }}>
            <DetalleExpandido detalle={detalle} apuesta={apuesta} />
          </div>
        )}
      </div>
    </div>
  )
}

function BadgePegajoso({ color, count }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontWeight: 600, color: count > 0 ? color : 'rgba(255,255,255,.4)'
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: count > 0 ? color : 'rgba(255,255,255,.2)',
        display: 'inline-block'
      }} />
      {count}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════
   LEYENDA INFERIOR
   ══════════════════════════════════════════════════════════════════ */
function Leyenda({ apuesta, total, mostrando }) {
  const ptsExacto = parseInt(apuesta?.puntos_exacto) || 5
  const ptsDif    = parseInt(apuesta?.puntos_diferencia) || 3
  const ptsRes    = parseInt(apuesta?.puntos_resultado) || 1
  return (
    <div style={{
      marginTop: '1rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '.6rem',
      fontSize: '.68rem', color: MUTED
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.85rem' }}>
        <LeyendaItem color={GREEN} label={`Exacto · ${ptsExacto} pts`} />
        <LeyendaItem color={GOLD}  label={`Diferencia · ${ptsDif} pts`} />
        <LeyendaItem color={MUTED} label={`Resultado · ${ptsRes} pt${ptsRes === 1 ? '' : 's'}`} />
      </div>
      {total > 0 && (
        <span style={{ color: '#a8b2c4' }}>
          {mostrando >= total ? `Mostrando todos (${total})` : `Mostrando ${mostrando} de ${total}`}
        </span>
      )}
    </div>
  )
}

function LeyendaItem({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, display: 'inline-block'
      }} />
      {label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════
   SKELETONS
   ══════════════════════════════════════════════════════════════════ */
function TablaSkeleton() {
  return (
    <>
      {/* Skeleton del podio */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr',
        gap: '.6rem', alignItems: 'end', marginBottom: '1.5rem'
      }}>
        {[100, 130, 100].map((h, i) => (
          <div key={i} style={{
            ...CARD, height: h, animation: 'skp 1.4s ease infinite'
          }} />
        ))}
      </div>
      {/* Skeleton de filas */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            height: 56,
            borderBottom: `1px solid ${BORDER}`,
            animation: 'skp 1.4s ease infinite'
          }} />
        ))}
      </div>
    </>
  )
}
