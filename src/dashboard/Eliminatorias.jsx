/**
 * Eliminatorias.jsx — src/dashboard/Eliminatorias.jsx
 *
 * Bracket de la fase de eliminación directa del Mundial 2026.
 * Renderiza columnas por fase (16avos → final) con cada cruce.
 * Se alimenta de los matches que llegan desde FixturePage (mismo shape
 * que devuelve mapearPartido_ del backend).
 */
import { useMemo } from 'react'

const FASES_ORDEN = ['16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const FASES_LABEL = {
  '16avos':     '16avos de final',
  octavos:      'Octavos de final',
  cuartos:      'Cuartos de final',
  semis:        'Semifinales',
  '3er_puesto': 'Tercer puesto',
  final:        'Final',
}

const ESTADO = {
  programado: { label: 'Programado', color: '#5f6e8a', bg: 'rgba(95,110,138,.07)', border: 'rgba(95,110,138,.18)' },
  en_vivo:    { label: 'EN VIVO',    color: '#e03252', bg: 'rgba(224,50,82,.08)',  border: 'rgba(224,50,82,.25)'  },
  finalizado: { label: 'Finalizado', color: '#c99f16', bg: 'rgba(235,195,43,.08)', border: 'rgba(235,195,43,.22)' },
  cancelado:  { label: 'Cancelado',  color: '#a8b2c4', bg: 'rgba(168,178,196,.07)', border: 'rgba(168,178,196,.2)' },
}

function formatFecha(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function EquipoRow({ nombre, bandera, goles, golesPenales, ganador, pendiente }) {
  const tienePenales = golesPenales != null && golesPenales !== ''
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '.45rem .65rem',
      background: ganador ? 'rgba(235,195,43,.09)' : 'transparent',
      borderRadius: 6,
      gap: '.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', minWidth: 0, flex: 1 }}>
        {bandera
          ? <img src={bandera} alt="" style={{ width: 22, height: 16, objectFit: 'cover', borderRadius: 2, border: '1px solid #f0eadb', flexShrink: 0 }}/>
          : <div style={{ width: 22, height: 16, borderRadius: 2, background: '#f0eadb', flexShrink: 0 }}/>
        }
        <span style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.78rem',
          fontWeight: ganador ? 700 : 600,
          color: pendiente ? '#a8b2c4' : '#0c182b',
          fontStyle: pendiente ? 'italic' : 'normal',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {nombre || 'Por definir'}
        </span>
        {ganador && <span title="Clasifica" style={{ fontSize: '.7rem', color: '#c99f16', flexShrink: 0 }}>▶</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.3rem', flexShrink: 0 }}>
        <span style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.95rem',
          fontWeight: 800,
          color: ganador ? '#c99f16' : '#5f6e8a',
          minWidth: 18,
          textAlign: 'right',
        }}>
          {goles != null && goles !== '' ? goles : '–'}
        </span>
        {tienePenales && (
          <span style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: '.65rem',
            fontWeight: 700,
            color: ganador ? '#c99f16' : '#a8b2c4',
            background: ganador ? 'rgba(235,195,43,.15)' : 'rgba(168,178,196,.12)',
            padding: '.1rem .35rem',
            borderRadius: 4,
            border: `1px solid ${ganador ? 'rgba(235,195,43,.3)' : 'rgba(168,178,196,.2)'}`,
          }} title="Penales">
            {golesPenales}
          </span>
        )}
      </div>
    </div>
  )
}

function MatchCard({ match }) {
  const s = ESTADO[match.estado] || ESTADO.programado
  const live = match.estado === 'en_vivo'
  const fin  = match.estado === 'finalizado'
  const gl = match.goles_local
  const gv = match.goles_visitante
  const pl = match.penales_local
  const pv = match.penales_visit
  const tienePenales = pl != null && pl !== '' && pv != null && pv !== ''

  // Clasificado real: por goles si hay diferencia, por penales si empatado en 90'
  let ganaLocal = false
  let ganaVisit = false
  if (fin && gl != null && gv != null) {
    if (Number(gl) > Number(gv))      ganaLocal = true
    else if (Number(gv) > Number(gl)) ganaVisit = true
    else if (tienePenales) {
      // Empate en 90' → desempate por penales
      if (Number(pl) > Number(pv))      ganaLocal = true
      else if (Number(pv) > Number(pl)) ganaVisit = true
    }
  }
  const sinEquipos = !match.equipo_local || !match.equipo_visitante

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #f0eadb',
      padding: '.55rem',
      boxShadow: '0 1px 3px rgba(12,24,43,.04)',
      minWidth: 230,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '.4rem',
        paddingBottom: '.35rem',
        borderBottom: '1px solid #f5f3ee',
      }}>
        <span style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.62rem',
          color: '#5f6e8a',
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          fontWeight: 600,
        }}>
          {formatFecha(match.fecha_partido) || (match.sede || '—')}
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '.25rem',
          padding: '.12rem .5rem',
          borderRadius: 99,
          fontSize: '.58rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}>
          {live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e03252', display: 'inline-block' }}/>}
          {live && match.minuto ? `${match.minuto}'` : s.label}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
        <EquipoRow nombre={match.equipo_local} bandera={match.bandera_local} goles={gl} golesPenales={tienePenales ? pl : null} ganador={ganaLocal} pendiente={!match.equipo_local}/>
        <EquipoRow nombre={match.equipo_visitante} bandera={match.bandera_visitante} goles={gv} golesPenales={tienePenales ? pv : null} ganador={ganaVisit} pendiente={!match.equipo_visitante}/>
      </div>
      {tienePenales && (
        <div style={{
          marginTop: '.4rem',
          padding: '.25rem .5rem',
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.6rem',
          fontWeight: 700,
          color: '#c99f16',
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          textAlign: 'center',
          background: 'rgba(235,195,43,.08)',
          borderRadius: 4,
          border: '1px solid rgba(235,195,43,.2)',
        }}>
          Definido por penales
        </div>
      )}
      {sinEquipos && (
        <div style={{
          marginTop: '.4rem',
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.6rem',
          color: '#a8b2c4',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Cruce por definir
        </div>
      )}
    </div>
  )
}

function ColumnaFase({ fase, partidos }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', minWidth: 250 }}>
      <div style={{
        background: '#0c182b',
        color: '#ebc32b',
        padding: '.5rem .8rem',
        borderRadius: 8,
        fontFamily: "'DM Sans',sans-serif",
        fontSize: '.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        textAlign: 'center',
      }}>
        {FASES_LABEL[fase]} <span style={{ color: '#a8b2c4', fontWeight: 600, marginLeft: 4 }}>· {partidos.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        {partidos.length === 0 ? (
          <div style={{
            padding: '1.2rem .6rem',
            border: '1.5px dashed #f0eadb',
            borderRadius: 10,
            textAlign: 'center',
            fontFamily: "'DM Sans',sans-serif",
            fontSize: '.7rem',
            color: '#a8b2c4',
          }}>
            Aún no hay cruces
          </div>
        ) : (
          partidos.map(m => <MatchCard key={m.id} match={m}/>)
        )}
      </div>
    </div>
  )
}

export default function Eliminatorias({ matches }) {
  const porFase = useMemo(() => {
    const map = {}
    FASES_ORDEN.forEach(f => { map[f] = [] })
    ;(matches || []).forEach(m => {
      if (m.fase && map[m.fase]) map[m.fase].push(m)
    })
    Object.keys(map).forEach(f => {
      map[f].sort((a, b) => {
        const da = a.fecha_partido ? new Date(a.fecha_partido).getTime() : 0
        const db = b.fecha_partido ? new Date(b.fecha_partido).getTime() : 0
        return da - db
      })
    })
    return map
  }, [matches])

  const totalPartidos = FASES_ORDEN.reduce((acc, f) => acc + porFase[f].length, 0)

  if (totalPartidos === 0) {
    return (
      <div style={{
        borderRadius: 16,
        padding: '3rem 2rem',
        textAlign: 'center',
        background: '#fff',
        border: '1.5px dashed #f0eadb',
      }}>
        <p style={{
          fontFamily: "'DM Sans',sans-serif",
          fontWeight: 700,
          fontSize: '.9rem',
          color: '#5f6e8a',
          margin: '0 0 .35rem',
        }}>
          Eliminatorias no disponibles aún
        </p>
        <p style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: '.78rem',
          color: '#a8b2c4',
          margin: 0,
        }}>
          Los cruces se completarán al finalizar la fase de grupos
        </p>
      </div>
    )
  }

  return (
    <div style={{
      overflowX: 'auto',
      paddingBottom: '.5rem',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        minWidth: 'min-content',
        padding: '.25rem',
      }}>
        {FASES_ORDEN.map(f => (
          <ColumnaFase key={f} fase={f} partidos={porFase[f]}/>
        ))}
      </div>
    </div>
  )
}
