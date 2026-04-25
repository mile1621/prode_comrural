/**
 * FixturePage.jsx
 * Ubicación: src/dashboard/FixturePage.jsx
 *
 * CAMBIOS en esta versión:
 *  - Muestra el minuto de juego si el partido está en vivo (ej: "63'").
 *  - El backend ya normaliza el estado, así que aquí solo se consume
 *    el campo `match.minuto` que viene junto con `match.estado`.
 */
import { useState, useMemo } from 'react'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'

/* ── Constantes ── */
const CARD = { background:'#fff', border:'1px solid #f0eadb', borderRadius:14, boxShadow:'0 1px 0 rgba(12,24,43,.04)' }
const MUTED = { fontSize:'.76rem', color:'#5f6e8a' }

const ESTADO = {
  programado: { label:'Programado', color:'#5f6e8a', bg:'rgba(95,110,138,.07)',  border:'rgba(95,110,138,.18)' },
  en_vivo:    { label:'EN VIVO',    color:'#e03252', bg:'rgba(224,50,82,.08)',   border:'rgba(224,50,82,.25)'  },
  finalizado: { label:'Finalizado', color:'#c99f16', bg:'rgba(235,195,43,.08)',  border:'rgba(235,195,43,.22)' },
  cancelado:  { label:'Cancelado',  color:'#a8b2c4', bg:'rgba(168,178,196,.07)', border:'rgba(168,178,196,.2)' },
}

const FASES = { grupos:'Fase de grupos', '16avos':'16avos de final', octavos:'Octavos', cuartos:'Cuartos', semis:'Semifinales', '3er_puesto':'3er puesto', final:'Final' }
const ORDEN_ELIM = ['16avos','octavos','cuartos','semis','final']

// Estructura de llaves del Mundial 2026
const LLAVES_16 = {
  A: [
    { id:'16a1', local:'1° Grupo A', visitante:'2° Grupo B' },
    { id:'16a2', local:'1° Grupo C', visitante:'2° Grupo D' },
    { id:'16a3', local:'1° Grupo E', visitante:'2° Grupo F' },
    { id:'16a4', local:'1° Grupo G', visitante:'2° Grupo H' },
  ],
  B: [
    { id:'16b1', local:'1° Grupo B', visitante:'2° Grupo A' },
    { id:'16b2', local:'1° Grupo D', visitante:'2° Grupo C' },
    { id:'16b3', local:'1° Grupo F', visitante:'2° Grupo E' },
    { id:'16b4', local:'1° Grupo H', visitante:'2° Grupo G' },
  ],
}

/* ── Helpers ── */
function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding:'.32rem .75rem', borderRadius:99, border:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.05em', cursor:'pointer', transition:'all .15s', background:active?'#0c182b':'#fff', color:active?'#ebc32b':'#5f6e8a', border:active?'1px solid transparent':'1px solid #f0eadb', boxShadow:active?'0 2px 8px rgba(12,24,43,.18)':'none' }}>
      {children}
    </button>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.52rem 1.1rem', borderRadius:10, border:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.05em', cursor:'pointer', transition:'all .17s', background:active?'#0c182b':'transparent', color:active?'#ebc32b':'#5f6e8a', boxShadow:active?'0 2px 10px rgba(12,24,43,.2)':'none' }}>
      {icon}{label}
    </button>
  )
}

/* ── Partido card fixture ── */
function PartidoCard({ match }) {
  const s = ESTADO[match.estado] || ESTADO.programado
  const live = match.estado === 'en_vivo'
  const fin  = match.estado === 'finalizado'
  const d    = match.fecha_partido ? new Date(match.fecha_partido) : null
  const fecha = d ? d.toLocaleDateString('es-AR', { day:'2-digit', month:'short' }) : ''
  const hora  = d ? d.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' }) : ''
  return (
    <div style={{ ...CARD, padding:'.9rem 1.1rem', transition:'transform .18s,box-shadow .18s' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 22px rgba(12,24,43,.09)' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 0 rgba(12,24,43,.04)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:'.6rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', minWidth:0 }}>
          {match.bandera_local && <img src={match.bandera_local} alt="" style={{ width:24, height:17, objectFit:'cover', borderRadius:3, border:'1px solid #f0eadb', flexShrink:0 }}/>}
          <span style={{ fontWeight:600, fontSize:'.88rem', color:'#0c182b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.equipo_local}</span>
        </div>
        <div style={{ textAlign:'center', minWidth:70 }}>
          {(fin||live)
            ? <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:live?'#e03252':'#0c182b', letterSpacing:'.05em', lineHeight:1 }}>{match.goles_local??0} : {match.goles_visitante??0}</span>
            : <div>
                <span style={{ ...MUTED, display:'block', fontSize:'.7rem' }}>{fecha}</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:'#0c182b', letterSpacing:'.04em' }}>{hora||'— : —'}</span>
              </div>
          }
          {live && (
            <span style={{ display:'block', fontSize:'.58rem', fontWeight:700, color:'#e03252', textTransform:'uppercase', letterSpacing:'.1em', marginTop:2 }}>
              {match.minuto ? `${match.minuto}'` : 'EN VIVO'}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', minWidth:0, justifyContent:'flex-end' }}>
          <span style={{ fontWeight:600, fontSize:'.88rem', color:'#0c182b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{match.equipo_visitante}</span>
          {match.bandera_visitante && <img src={match.bandera_visitante} alt="" style={{ width:24, height:17, objectFit:'cover', borderRadius:3, border:'1px solid #f0eadb', flexShrink:0 }}/>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.55rem', paddingTop:'.55rem', borderTop:'1px solid #f5f3ee' }}>
        <span style={{ ...MUTED, fontSize:'.7rem' }}>{match.fase ? FASES[match.fase]||match.fase : ''}{match.grupo ? ` · ${match.grupo}` : ''}</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.18rem .6rem', borderRadius:99, fontSize:'.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
          {live && <span style={{ width:5, height:5, borderRadius:'50%', background:'#e03252', animation:'ldot 1.4s ease infinite', display:'inline-block' }}/>}
          {live && match.minuto ? `${match.minuto}'` : s.label}
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   TAB GRUPOS
══════════════════════════════════════════════ */
function TablaGrupos({ matches }) {
  const [grupoSel, setGrupoSel] = useState(null)

  const grupos = useMemo(() => {
    const map = {}
    matches
      .filter(m => m.fase === 'grupos' && m.grupo)
      .forEach(m => {
        const g = m.grupo
        if (!map[g]) map[g] = { letra:g, equipos:{}, partidos:[] }
        map[g].partidos.push(m)

        const proc = (nombre, bandera, gf, gc) => {
          if (!nombre) return
          if (!map[g].equipos[nombre]) map[g].equipos[nombre] = { nombre, bandera, j:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 }
          const eq = map[g].equipos[nombre]
          if (m.estado === 'finalizado' && gf != null && gc != null) {
            eq.j++; eq.gf += Number(gf); eq.gc += Number(gc)
            if (Number(gf) > Number(gc)) { eq.g++; eq.pts += 3 }
            else if (Number(gf) === Number(gc)) { eq.e++; eq.pts += 1 }
            else { eq.p++ }
          }
        }
        proc(m.equipo_local, m.bandera_local, m.goles_local, m.goles_visitante)
        proc(m.equipo_visitante, m.bandera_visitante, m.goles_visitante, m.goles_local)
      })

    return Object.values(map)
      .sort((a, b) => a.letra.localeCompare(b.letra))
      .map(g => ({
        ...g,
        sel: Object.values(g.equipos)
          .sort((a, b) => b.pts - a.pts || (b.gf-b.gc) - (a.gf-a.gc) || b.gf - a.gf)
          .map((s, i) => ({ ...s, pos:i+1, dif:s.gf-s.gc })),
      }))
  }, [matches])

  if (grupos.length === 0) return (
    <div style={{ borderRadius:16, padding:'3rem 2rem', textAlign:'center', background:'#fff', border:'1.5px dashed #f0eadb' }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'rgba(12,24,43,.04)', border:'1px solid #f0eadb', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </div>
      <p style={{ fontWeight:700, fontSize:'.9rem', color:'#5f6e8a', margin:'0 0 .35rem' }}>Tablas de grupos no disponibles</p>
      <p style={{ fontSize:'.78rem', color:'#a8b2c4', margin:0, lineHeight:1.5 }}>Se calcularán automáticamente con los partidos de fase de grupos del backend</p>
    </div>
  )

  const letras = grupos.map(g => g.letra)

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom:'1.5rem' }}>
        <Chip active={!grupoSel} onClick={() => setGrupoSel(null)}>Todos</Chip>
        {letras.map(l => <Chip key={l} active={grupoSel===l} onClick={() => setGrupoSel(l)}>Grupo {l}</Chip>)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:'1.25rem' }}>
        {grupos.filter(g => !grupoSel || g.letra === grupoSel).map(g => (
          <div key={g.letra} style={{ background:'#fff', border:'1px solid #f0eadb', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 0 rgba(12,24,43,.04)' }}>

            <div style={{ background:'linear-gradient(135deg,#0c182b 0%,#17376a 100%)', padding:'.85rem 1.2rem', display:'flex', alignItems:'center', gap:'.85rem' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(235,195,43,.15)', border:'1px solid rgba(235,195,43,.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', color:'#ebc32b', lineHeight:1 }}>{g.letra}</span>
              </div>
              <div>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.05rem', color:'#fff', margin:0, letterSpacing:'.05em', lineHeight:1 }}>GRUPO {g.letra}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', color:'rgba(255,255,255,.4)', margin:'.2rem 0 0' }}>{g.sel.length} equipos · {g.partidos.filter(p=>p.estado==='finalizado').length}/{g.partidos.length} partidos jugados</p>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.3rem' }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.62rem', color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                  {g.partidos.filter(p=>p.estado==='finalizado').length === g.partidos.length && g.partidos.length > 0 ? 'Completado' : 'En curso'}
                </span>
                <div style={{ width:60, height:4, borderRadius:99, background:'rgba(255,255,255,.1)' }}>
                  <div style={{ height:'100%', borderRadius:99, background:'#ebc32b', width: g.partidos.length ? `${(g.partidos.filter(p=>p.estado==='finalizado').length/g.partidos.length)*100}%` : '0%', transition:'width .4s ease' }}/>
                </div>
              </div>
            </div>

            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(12,24,43,.025)' }}>
                  {['#','Equipo','J','G','E','P','GF','GC','DIF','PTS'].map((h,i) => (
                    <th key={h} style={{ padding: i===1 ? '.42rem .5rem' : '.42rem .35rem', fontFamily:"'DM Sans',sans-serif", fontSize:'.58rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8b2c4', textAlign:i===1?'left':'center', borderBottom:'1px solid #f0eadb', paddingLeft:i===0||i===1?'.8rem':'.35rem', paddingRight:i===9?'.8rem':'.35rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.sel.map((s, i) => {
                  const clasifica = s.pos <= 2
                  const ultimo = i === g.sel.length - 1
                  return (
                    <tr key={s.nombre} style={{ background:clasifica?'rgba(235,195,43,.035)':'transparent', borderBottom:ultimo?'none':'1px solid #f5f3ee' }}>
                      <td style={{ padding:'.55rem .8rem', textAlign:'center' }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:clasifica?'rgba(235,195,43,.15)':'rgba(12,24,43,.04)', border:clasifica?'1px solid rgba(235,195,43,.3)':'1px solid #f0eadb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.85rem', color:clasifica?'#c99f16':'#a8b2c4', lineHeight:1 }}>{s.pos}</span>
                        </div>
                      </td>
                      <td style={{ padding:'.55rem .5rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.55rem', minWidth:0 }}>
                          {s.bandera
                            ? <img src={s.bandera} alt="" style={{ width:22, height:15, objectFit:'cover', borderRadius:3, border:'1px solid #f0eadb', flexShrink:0 }}/>
                            : <div style={{ width:22, height:15, borderRadius:3, background:'#f0eadb', flexShrink:0 }}/>
                          }
                          <span style={{ fontWeight:600, fontSize:'.82rem', color:'#0c182b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.nombre}</span>
                          {clasifica && (
                            <span style={{ fontSize:'.52rem', fontWeight:700, color:'#c99f16', background:'rgba(235,195,43,.12)', border:'1px solid rgba(235,195,43,.25)', borderRadius:4, padding:'1px 5px', flexShrink:0 }}>CL</span>
                          )}
                        </div>
                      </td>
                      {[s.j, s.g, s.e, s.p, s.gf, s.gc].map((v, idx) => (
                        <td key={idx} style={{ padding:'.55rem .35rem', textAlign:'center', fontFamily:"'DM Sans',sans-serif", fontSize:'.78rem', color:'#5f6e8a' }}>{v}</td>
                      ))}
                      <td style={{ padding:'.55rem .35rem', textAlign:'center', fontFamily:"'DM Sans',sans-serif", fontSize:'.78rem', fontWeight:600, color:s.dif>0?'#1b8a5a':s.dif<0?'#e03252':'#5f6e8a' }}>
                        {s.dif > 0 ? `+${s.dif}` : s.dif}
                      </td>
                      <td style={{ padding:'.55rem .8rem', textAlign:'center' }}>
                        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.15rem', color:'#0c182b', lineHeight:1 }}>{s.pts}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div style={{ padding:'.5rem 1rem', borderTop:'1px solid #f5f3ee', display:'flex', alignItems:'center', gap:'.5rem' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'rgba(235,195,43,.25)', border:'1px solid rgba(235,195,43,.4)' }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.62rem', color:'#a8b2c4' }}>Clasifica a 16avos de final</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   TAB LLAVES
══════════════════════════════════════════════ */

function BracketSlot({ match, placeholder }) {
  const equipo1 = match ? match.equipo_local   : placeholder?.local      || 'Por definir'
  const equipo2 = match ? match.equipo_visitante : placeholder?.visitante || 'Por definir'
  const band1   = match?.bandera_local
  const band2   = match?.bandera_visitante
  const fin     = match?.estado === 'finalizado'
  const live    = match?.estado === 'en_vivo'
  const g1      = match?.goles_local    ?? null
  const g2      = match?.goles_visitante ?? null
  const win1    = fin && g1 != null && Number(g1) > Number(g2)
  const win2    = fin && g2 != null && Number(g2) > Number(g1)
  const vacio   = !match && !placeholder

  return (
    <div style={{ background:'#fff', border:`1px solid ${live?'rgba(224,50,82,.35)':fin?'rgba(235,195,43,.25)':'#f0eadb'}`, borderRadius:12, overflow:'hidden', boxShadow:live?'0 0 0 2px rgba(224,50,82,.12)':'0 1px 0 rgba(12,24,43,.04)', minWidth:190, transition:'box-shadow .15s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.5rem .75rem', borderBottom:'1px solid #f5f3ee', background:win1?'rgba(27,138,90,.04)':'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.45rem', minWidth:0, flex:1 }}>
          {band1
            ? <img src={band1} alt="" style={{ width:20, height:14, objectFit:'cover', borderRadius:2, border:'1px solid #f0eadb', flexShrink:0 }}/>
            : <div style={{ width:20, height:14, borderRadius:2, background:'#f0eadb', flexShrink:0 }}/>
          }
          <span style={{ fontSize:'.78rem', fontWeight:win1?700:500, color:vacio?'#d3cfc8':win1?'#0c182b':'#5f6e8a', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{equipo1}</span>
        </div>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:win1?'#0c182b':live?'#e03252':'#a8b2c4', flexShrink:0, marginLeft:'.4rem' }}>
          {g1 ?? '—'}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.5rem .75rem', background:win2?'rgba(27,138,90,.04)':'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.45rem', minWidth:0, flex:1 }}>
          {band2
            ? <img src={band2} alt="" style={{ width:20, height:14, objectFit:'cover', borderRadius:2, border:'1px solid #f0eadb', flexShrink:0 }}/>
            : <div style={{ width:20, height:14, borderRadius:2, background:'#f0eadb', flexShrink:0 }}/>
          }
          <span style={{ fontSize:'.78rem', fontWeight:win2?700:500, color:vacio?'#d3cfc8':win2?'#0c182b':'#5f6e8a', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{equipo2}</span>
        </div>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:win2?'#0c182b':live?'#e03252':'#a8b2c4', flexShrink:0, marginLeft:'.4rem' }}>
          {g2 ?? '—'}
        </span>
      </div>
      {(fin || live) && (
        <div style={{ padding:'.3rem .75rem', borderTop:'1px solid #f5f3ee', display:'flex', justifyContent:'flex-end' }}>
          <span style={{ fontSize:'.55rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', padding:'1px 6px', borderRadius:99, background:live?'rgba(224,50,82,.1)':'rgba(235,195,43,.1)', color:live?'#e03252':'#c99f16', border:`1px solid ${live?'rgba(224,50,82,.25)':'rgba(235,195,43,.25)'}` }}>
            {live ? (match?.minuto ? `${match.minuto}'` : 'En vivo') : 'Final'}
          </span>
        </div>
      )}
    </div>
  )
}

function RondaHeader({ label, count }) {
  return (
    <div style={{ marginBottom:'.85rem', textAlign:'center' }}>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.95rem', color:'#0c182b', letterSpacing:'.08em' }}>{label}</span>
      {count && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', color:'#a8b2c4', display:'block', marginTop:'.1rem' }}>{count} partidos</span>}
    </div>
  )
}

function RondaCol({ label, slots, count }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minWidth:200 }}>
      <RondaHeader label={label} count={count}/>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', flex:1, justifyContent:'space-around' }}>
        {slots.map((s, i) => (
          <BracketSlot key={i} match={s?.match} placeholder={s?.placeholder}/>
        ))}
      </div>
    </div>
  )
}

function LlaveSeparador() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 1rem', gap:'.5rem' }}>
      <div style={{ width:1, flex:1, background:'linear-gradient(180deg,transparent,#f0eadb 20%,#f0eadb 80%,transparent)' }}/>
      <div style={{ width:32, height:32, borderRadius:'50%', background:'#0c182b', border:'2px solid rgba(235,195,43,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      </div>
      <div style={{ width:1, flex:1, background:'linear-gradient(180deg,transparent,#f0eadb 20%,#f0eadb 80%,transparent)' }}/>
    </div>
  )
}

function Llaves({ matches }) {
  const porFase = useMemo(() => {
    const map = {}
    matches.filter(m => ['16avos','octavos','cuartos','semis','final','3er_puesto'].includes(m.fase))
      .forEach(m => {
        if (!map[m.fase]) map[m.fase] = []
        map[m.fase].push(m)
      })
    return map
  }, [matches])

  const hay16   = porFase['16avos']?.length  > 0
  const hayOct  = porFase['octavos']?.length > 0
  const hayCuar = porFase['cuartos']?.length > 0
  const haySemi = porFase['semis']?.length   > 0
  const hayFin  = porFase['final']?.length   > 0
  const hayAlgo = hay16 || hayOct || hayCuar || haySemi || hayFin

  const getSlots16 = (llave) => LLAVES_16[llave].map((ph, i) => {
    const real = porFase['16avos']?.find((m,mi) => llave==='A' ? mi===i : mi===i+4) || null
    return { match: real, placeholder: ph }
  })

  const getSlotsByFase = (fase, indices) => {
    const arr = porFase[fase] || []
    return indices.map(idx => arr[idx] ? { match:arr[idx] } : { match:null, placeholder:null })
  }

  if (!hayAlgo) return (
    <div style={{ borderRadius:16, padding:'3rem 2rem', textAlign:'center', background:'#fff', border:'1.5px dashed #f0eadb' }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'rgba(12,24,43,.04)', border:'1px solid #f0eadb', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      </div>
      <p style={{ fontWeight:700, fontSize:'.9rem', color:'#5f6e8a', margin:'0 0 .4rem' }}>Las llaves aún no están disponibles</p>
      <p style={{ fontSize:'.78rem', color:'#a8b2c4', margin:0, lineHeight:1.5 }}>
        La fase eliminatoria comienza cuando finaliza la fase de grupos.<br/>
        Aquí verás el bracket completo del torneo.
      </p>
      <div style={{ marginTop:'2rem', display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', opacity:.4 }}>
        {['16avos','Cuartos','Semis','Final'].map(r => (
          <div key={r} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.4rem' }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#0c182b', letterSpacing:'.06em' }}>{r}</span>
            {[...Array(r==='16avos'?4:r==='Cuartos'?2:1)].map((_,i)=>(
              <div key={i} style={{ width:140, background:'#faf7f0', border:'1px solid #f0eadb', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'.4rem .6rem', borderBottom:'1px solid #f0eadb' }}><div style={{ height:10, borderRadius:4, background:'#f0eadb', width:'70%' }}/></div>
                <div style={{ padding:'.4rem .6rem' }}><div style={{ height:10, borderRadius:4, background:'#f0eadb', width:'55%' }}/></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ overflowX:'auto', paddingBottom:'1.5rem' }}>

      <div style={{ display:'flex', gap:'1.5rem', minWidth:'max-content', padding:'0 .5rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>16AVOS</span></div>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>CUARTOS</span></div>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>SEMI</span></div>
        </div>
        <div style={{ minWidth:210, textAlign:'center' }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.14em', color:'rgba(235,195,43,.85)' }}>Gran Final</span>
        </div>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>SEMI</span></div>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>CUARTOS</span></div>
          <div style={{ minWidth:200, textAlign:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.75rem', color:'#5f6e8a', letterSpacing:'.08em' }}>16AVOS</span></div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', minWidth:'max-content', padding:'0 .5rem' }}>

        <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', minWidth:200 }}>
          {getSlots16('A').map((s,i) => <BracketSlot key={i} match={s.match} placeholder={s.placeholder}/>)}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'4rem', minWidth:200, justifyContent:'space-around' }}>
          {getSlotsByFase('cuartos',[0,1]).map((s,i) => <BracketSlot key={i} match={s.match} placeholder={s.placeholder}/>)}
        </div>

        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', minWidth:200 }}>
          <BracketSlot match={getSlotsByFase('semis',[0])[0]?.match} placeholder={getSlotsByFase('semis',[0])[0]?.placeholder}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.75rem', minWidth:210 }}>
          <BracketSlot match={porFase['final']?.[0] || null} placeholder={{ local:'Ganador Semi A', visitante:'Ganador Semi B' }}/>
          {porFase['3er_puesto']?.length > 0 && (
            <div style={{ width:'100%', marginTop:'.5rem' }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'.58rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8b2c4', textAlign:'center', margin:'0 0 .35rem' }}>3er puesto</p>
              <BracketSlot match={porFase['3er_puesto'][0]}/>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', minWidth:200 }}>
          <BracketSlot match={getSlotsByFase('semis',[1])[0]?.match} placeholder={getSlotsByFase('semis',[1])[0]?.placeholder}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'4rem', minWidth:200, justifyContent:'space-around' }}>
          {getSlotsByFase('cuartos',[2,3]).map((s,i) => <BracketSlot key={i} match={s.match} placeholder={s.placeholder}/>)}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', minWidth:200 }}>
          {getSlots16('B').map((s,i) => <BracketSlot key={i} match={s.match} placeholder={s.placeholder}/>)}
        </div>

      </div>

      <div style={{ display:'flex', justifyContent:'space-between', minWidth:'max-content', padding:'.75rem .5rem 0', borderTop:'1px solid #f0eadb', marginTop:'1rem' }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.8rem', color:'rgba(235,195,43,.7)', letterSpacing:'.1em' }}>LLAVE A</span>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'.8rem', color:'rgba(235,195,43,.7)', letterSpacing:'.1em' }}>LLAVE B</span>
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════
   PAGE PRINCIPAL
══════════════════════════════════════════════ */
export default function FixturePage() {
  const { matches, loading } = useBets()
  const [tab, setTab]       = useState('fixture')
  const [fase, setFase]     = useState('todas')
  const [estado, setEstado] = useState('todos')
  const [q, setQ]           = useState('')

  const fases = useMemo(() => [...new Set(matches.map(m => m.fase).filter(Boolean))], [matches])

  const filtered = useMemo(() => matches.filter(m => {
    if (fase !== 'todas' && m.fase !== fase) return false
    if (estado !== 'todos' && m.estado !== estado) return false
    if (q) { const s = q.toLowerCase(); if (!m.equipo_local?.toLowerCase().includes(s) && !m.equipo_visitante?.toLowerCase().includes(s)) return false }
    return true
  }), [matches, fase, estado, q])

  const groups = useMemo(() => {
    const map = {}
    filtered.forEach(m => {
      const key = [FASES[m.fase]||m.fase||'Sin fase', m.jornada].filter(Boolean).join(' · ')
      if (!map[key]) map[key] = []
      map[key].push(m)
    })
    return map
  }, [filtered])

  return (
    <AppShell>
      <style>{`
        @keyframes ldot{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .din{animation:din .38s ease both}
        @keyframes skp{0%,100%{opacity:.7}50%{opacity:.3}}
      `}</style>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'2rem 1.5rem 3rem' }}>

        <div className="din" style={{ marginBottom:'1.5rem' }}>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.4rem,6vw,3.5rem)', color:'#0c182b', margin:'0 0 .3rem', lineHeight:1, letterSpacing:'.02em' }}>FIXTURE</h1>
          <p style={{ fontSize:'.84rem', color:'#5f6e8a', margin:0 }}>{matches.length} partidos del Mundial 2026</p>
        </div>

        <div className="din" style={{ display:'flex', gap:'.3rem', padding:'.3rem', background:'#fff', border:'1px solid #f0eadb', borderRadius:14, width:'fit-content', marginBottom:'1.75rem', animationDelay:'40ms' }}>
          <TabBtn active={tab==='fixture'} onClick={()=>setTab('fixture')} label="Fixture"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <TabBtn active={tab==='grupos'} onClick={()=>setTab('grupos')} label="Grupos"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
          />
          <TabBtn active={tab==='llaves'} onClick={()=>setTab('llaves')} label="Llaves"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
          />
        </div>

        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {[...Array(6)].map((_,i) => <div key={i} style={{ height:100, borderRadius:14, background:'#fff', border:'1px solid #f0eadb', animation:'skp 1.4s ease-in-out infinite' }}/>)}
          </div>
        )}

        {!loading && tab==='fixture' && (
          <div className="din">
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginBottom:'1.5rem' }}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar equipo..."
                style={{ padding:'.42rem .9rem', borderRadius:99, border:'1px solid #f0eadb', background:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'.82rem', color:'#0c182b', outline:'none', minWidth:180, transition:'border-color .15s' }}
                onFocus={e=>{ e.target.style.borderColor='rgba(235,195,43,.5)' }}
                onBlur={e=>{ e.target.style.borderColor='#f0eadb' }}/>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                <Chip active={fase==='todas'} onClick={()=>setFase('todas')}>Todas</Chip>
                {fases.map(f => <Chip key={f} active={fase===f} onClick={()=>setFase(f)}>{FASES[f]||f}</Chip>)}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                <Chip active={estado==='todos'} onClick={()=>setEstado('todos')}>Todos</Chip>
                {['en_vivo','programado','finalizado'].map(e => <Chip key={e} active={estado===e} onClick={()=>setEstado(e)}>{ESTADO[e].label}</Chip>)}
              </div>
            </div>
            {filtered.length === 0
              ? <div style={{ borderRadius:18, padding:'3rem', textAlign:'center', background:'#fff', border:'1.5px dashed #f0eadb' }}><p style={{ fontWeight:600, fontSize:'.9rem', color:'#5f6e8a', margin:0 }}>No hay partidos que coincidan</p></div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                  {Object.entries(groups).map(([group,items]) => (
                    <div key={group}>
                      <p style={{ fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(235,195,43,.85)', marginBottom:'.7rem' }}>{group}</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'.8rem' }}>
                        {items.map(m => <PartidoCard key={m.id} match={m}/>)}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {!loading && tab==='grupos' && (
          <div className="din"><TablaGrupos matches={matches}/></div>
        )}

        {!loading && tab==='llaves' && (
          <div className="din"><Llaves matches={matches}/></div>
        )}

      </div>
    </AppShell>
  )
}
