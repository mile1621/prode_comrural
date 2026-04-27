/**
 * FixturePage.jsx — src/dashboard/FixturePage.jsx
 */
import { useState, useMemo } from 'react'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import Eliminatorias from './Eliminatorias.jsx'

const ESTADO = {
  programado: { label:'Programado', color:'#5f6e8a', bg:'rgba(95,110,138,.07)', border:'rgba(95,110,138,.18)' },
  en_vivo:    { label:'EN VIVO',    color:'#e03252', bg:'rgba(224,50,82,.08)',  border:'rgba(224,50,82,.25)'  },
  finalizado: { label:'Finalizado', color:'#c99f16', bg:'rgba(235,195,43,.08)', border:'rgba(235,195,43,.22)' },
  cancelado:  { label:'Cancelado',  color:'#a8b2c4', bg:'rgba(168,178,196,.07)',border:'rgba(168,178,196,.2)' },
}
const FASES = {
  grupos:'Fase de grupos','16avos':'16avos de final',octavos:'Octavos',
  cuartos:'Cuartos',semis:'Semifinales','3er_puesto':'3er puesto',final:'Final'
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding:'.32rem .75rem', borderRadius:99, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.05em', cursor:'pointer', transition:'all .15s', background:active?'#0c182b':'#fff', color:active?'#ebc32b':'#5f6e8a', border:active?'1px solid transparent':'1px solid #f0eadb', boxShadow:active?'0 2px 8px rgba(12,24,43,.18)':'none' }}>
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

function PartidoCard({ match }) {
  const s    = ESTADO[match.estado] || ESTADO.programado
  const live = match.estado === 'en_vivo'
  const fin  = match.estado === 'finalizado'
  const d    = match.fecha_partido ? new Date(match.fecha_partido) : null
  const fecha = d ? d.toLocaleDateString('es-AR',{day:'2-digit',month:'short'}) : ''
  const hora  = d ? d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}) : ''
  return (
    <div style={{ background:'#fff', border:'1px solid #f0eadb', borderRadius:14, padding:'.9rem 1.1rem', boxShadow:'0 1px 0 rgba(12,24,43,.04)', transition:'transform .18s,box-shadow .18s' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 22px rgba(12,24,43,.09)' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 0 rgba(12,24,43,.04)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:'.6rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', minWidth:0 }}>
          {match.bandera_local && <img src={match.bandera_local} alt="" style={{ width:24,height:17,objectFit:'cover',borderRadius:3,border:'1px solid #f0eadb',flexShrink:0 }}/>}
          <span style={{ fontWeight:600, fontSize:'.88rem', color:'#0c182b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.equipo_local}</span>
        </div>
        <div style={{ textAlign:'center', minWidth:70 }}>
          {(fin||live)
            ? <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:live?'#e03252':'#0c182b', letterSpacing:'.05em', lineHeight:1 }}>{match.goles_local??0} : {match.goles_visitante??0}</span>
            : <div><span style={{ fontSize:'.7rem',color:'#5f6e8a',display:'block' }}>{fecha}</span><span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1rem',color:'#0c182b',letterSpacing:'.04em' }}>{hora||'— : —'}</span></div>
          }
          {live && <span style={{ display:'block',fontSize:'.58rem',fontWeight:700,color:'#e03252',textTransform:'uppercase',letterSpacing:'.1em',marginTop:2 }}>{match.minuto?`${match.minuto}'`:'EN VIVO'}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', minWidth:0, justifyContent:'flex-end' }}>
          <span style={{ fontWeight:600, fontSize:'.88rem', color:'#0c182b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{match.equipo_visitante}</span>
          {match.bandera_visitante && <img src={match.bandera_visitante} alt="" style={{ width:24,height:17,objectFit:'cover',borderRadius:3,border:'1px solid #f0eadb',flexShrink:0 }}/>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.55rem', paddingTop:'.55rem', borderTop:'1px solid #f5f3ee' }}>
        <span style={{ fontSize:'.7rem', color:'#5f6e8a' }}>{match.fase?FASES[match.fase]||match.fase:''}{match.grupo?` · ${match.grupo}`:''}</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.18rem .6rem', borderRadius:99, fontSize:'.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
          {live && <span style={{ width:5,height:5,borderRadius:'50%',background:'#e03252',animation:'ldot 1.4s ease infinite',display:'inline-block' }}/>}
          {live&&match.minuto?`${match.minuto}'`:s.label}
        </span>
      </div>
    </div>
  )
}

function TablaGrupos({ matches }) {
  const [grupoSel, setGrupoSel] = useState(null)
  const grupos = useMemo(() => {
    const map = {}
    matches.filter(m=>m.fase==='grupos'&&m.grupo).forEach(m=>{
      const g=m.grupo
      if(!map[g]) map[g]={letra:g,equipos:{},partidos:[]}
      map[g].partidos.push(m)
      const proc=(nombre,bandera,gf,gc)=>{
        if(!nombre) return
        if(!map[g].equipos[nombre]) map[g].equipos[nombre]={nombre,bandera,j:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}
        const eq=map[g].equipos[nombre]
        if(m.estado==='finalizado'&&gf!=null&&gc!=null){
          eq.j++;eq.gf+=Number(gf);eq.gc+=Number(gc)
          if(Number(gf)>Number(gc)){eq.g++;eq.pts+=3}
          else if(Number(gf)===Number(gc)){eq.e++;eq.pts+=1}
          else{eq.p++}
        }
      }
      proc(m.equipo_local,m.bandera_local,m.goles_local,m.goles_visitante)
      proc(m.equipo_visitante,m.bandera_visitante,m.goles_visitante,m.goles_local)
    })
    return Object.values(map).sort((a,b)=>a.letra.localeCompare(b.letra)).map(g=>({
      ...g,sel:Object.values(g.equipos).sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf).map((s,i)=>({...s,pos:i+1,dif:s.gf-s.gc})),
    }))
  },[matches])

  if(!grupos.length) return (
    <div style={{ borderRadius:16,padding:'3rem 2rem',textAlign:'center',background:'#fff',border:'1.5px dashed #f0eadb' }}>
      <p style={{ fontWeight:700,fontSize:'.9rem',color:'#5f6e8a',margin:'0 0 .35rem' }}>Tablas de grupos no disponibles</p>
      <p style={{ fontSize:'.78rem',color:'#a8b2c4',margin:0 }}>Se calcularán automáticamente con los partidos del backend</p>
    </div>
  )
  return (
    <div>
      <div style={{ display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'1.5rem' }}>
        <Chip active={!grupoSel} onClick={()=>setGrupoSel(null)}>Todos</Chip>
        {grupos.map(g=><Chip key={g.letra} active={grupoSel===g.letra} onClick={()=>setGrupoSel(g.letra)}>Grupo {g.letra}</Chip>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))',gap:'1.25rem' }}>
        {grupos.filter(g=>!grupoSel||g.letra===grupoSel).map(g=>(
          <div key={g.letra} style={{ background:'#fff',border:'1px solid #f0eadb',borderRadius:16,overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0c182b,#17376a)',padding:'.85rem 1.2rem',display:'flex',alignItems:'center',gap:'.85rem' }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(235,195,43,.15)',border:'1px solid rgba(235,195,43,.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',color:'#ebc32b',lineHeight:1 }}>{g.letra}</span>
              </div>
              <div>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.05rem',color:'#fff',margin:0,letterSpacing:'.05em' }}>GRUPO {g.letra}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'.65rem',color:'rgba(255,255,255,.4)',margin:'.2rem 0 0' }}>{g.sel.length} equipos · {g.partidos.filter(p=>p.estado==='finalizado').length}/{g.partidos.length} jugados</p>
              </div>
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(12,24,43,.025)' }}>
                  {['#','Equipo','J','G','E','P','GF','GC','DIF','PTS'].map((h,i)=>(
                    <th key={h} style={{ padding:'.42rem .35rem',fontFamily:"'DM Sans',sans-serif",fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',textAlign:i===1?'left':'center',borderBottom:'1px solid #f0eadb',paddingLeft:i===0||i===1?'.8rem':'.35rem',paddingRight:i===9?'.8rem':'.35rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.sel.map((s,i)=>{
                  const cl=s.pos<=2
                  return (
                    <tr key={s.nombre} style={{ background:cl?'rgba(235,195,43,.035)':'transparent',borderBottom:i===g.sel.length-1?'none':'1px solid #f5f3ee' }}>
                      <td style={{ padding:'.55rem .8rem',textAlign:'center' }}>
                        <div style={{ width:22,height:22,borderRadius:6,background:cl?'rgba(235,195,43,.15)':'rgba(12,24,43,.04)',border:cl?'1px solid rgba(235,195,43,.3)':'1px solid #f0eadb',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'.85rem',color:cl?'#c99f16':'#a8b2c4' }}>{s.pos}</span>
                        </div>
                      </td>
                      <td style={{ padding:'.55rem .5rem' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:'.55rem' }}>
                          {s.bandera?<img src={s.bandera} alt="" style={{ width:22,height:15,objectFit:'cover',borderRadius:3,border:'1px solid #f0eadb',flexShrink:0 }}/>:<div style={{ width:22,height:15,borderRadius:3,background:'#f0eadb',flexShrink:0 }}/>}
                          <span style={{ fontWeight:600,fontSize:'.82rem',color:'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.nombre}</span>
                          {cl&&<span style={{ fontSize:'.52rem',fontWeight:700,color:'#c99f16',background:'rgba(235,195,43,.12)',border:'1px solid rgba(235,195,43,.25)',borderRadius:4,padding:'1px 5px' }}>CL</span>}
                        </div>
                      </td>
                      {[s.j,s.g,s.e,s.p,s.gf,s.gc].map((v,idx)=><td key={idx} style={{ padding:'.55rem .35rem',textAlign:'center',fontSize:'.78rem',color:'#5f6e8a' }}>{v}</td>)}
                      <td style={{ padding:'.55rem .35rem',textAlign:'center',fontSize:'.78rem',fontWeight:600,color:s.dif>0?'#1b8a5a':s.dif<0?'#e03252':'#5f6e8a' }}>{s.dif>0?`+${s.dif}`:s.dif}</td>
                      <td style={{ padding:'.55rem .8rem',textAlign:'center' }}>
                        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.15rem',color:'#0c182b' }}>{s.pts}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding:'.5rem 1rem',borderTop:'1px solid #f5f3ee',display:'flex',alignItems:'center',gap:'.5rem' }}>
              <div style={{ width:10,height:10,borderRadius:3,background:'rgba(235,195,43,.25)',border:'1px solid rgba(235,195,43,.4)' }}/>
              <span style={{ fontSize:'.62rem',color:'#a8b2c4',fontFamily:"'DM Sans',sans-serif" }}>Clasifica a 16avos de final</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FixturePage() {
  const { matches, loading } = useBets()
  const [tab, setTab]       = useState('fixture')
  const [fase, setFase]     = useState('todas')
  const [estado, setEstado] = useState('todos')
  const [q, setQ]           = useState('')

  const fases    = useMemo(()=>[...new Set(matches.map(m=>m.fase).filter(Boolean))],[matches])
  const filtered = useMemo(()=>matches.filter(m=>{
    if(fase!=='todas'&&m.fase!==fase) return false
    if(estado!=='todos'&&m.estado!==estado) return false
    if(q){const s=q.toLowerCase();if(!m.equipo_local?.toLowerCase().includes(s)&&!m.equipo_visitante?.toLowerCase().includes(s)) return false}
    return true
  }),[matches,fase,estado,q])
  const groups = useMemo(()=>{
    const map={}
    filtered.forEach(m=>{
      const key=[FASES[m.fase]||m.fase||'Sin fase',m.jornada].filter(Boolean).join(' · ')
      if(!map[key]) map[key]=[]
      map[key].push(m)
    })
    return map
  },[filtered])

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
          <TabBtn active={tab==='Eliminatoria'} onClick={()=>setTab('Eliminatoria')} label="Eliminatoria"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
          />
        </div>

        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {[...Array(6)].map((_,i)=><div key={i} style={{ height:100, borderRadius:14, background:'#fff', border:'1px solid #f0eadb', animation:'skp 1.4s ease-in-out infinite' }}/>)}
          </div>
        )}

        {!loading && tab==='fixture' && (
          <div className="din">
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginBottom:'1.5rem' }}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar equipo..."
                style={{ padding:'.42rem .9rem', borderRadius:99, border:'1px solid #f0eadb', background:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'.82rem', color:'#0c182b', outline:'none', minWidth:180 }}
                onFocus={e=>{ e.target.style.borderColor='rgba(235,195,43,.5)' }}
                onBlur={e=>{ e.target.style.borderColor='#f0eadb' }}/>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                <Chip active={fase==='todas'} onClick={()=>setFase('todas')}>Todas</Chip>
                {fases.map(f=><Chip key={f} active={fase===f} onClick={()=>setFase(f)}>{FASES[f]||f}</Chip>)}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.25rem' }}>
                <Chip active={estado==='todos'} onClick={()=>setEstado('todos')}>Todos</Chip>
                {['en_vivo','programado','finalizado'].map(e=><Chip key={e} active={estado===e} onClick={()=>setEstado(e)}>{ESTADO[e].label}</Chip>)}
              </div>
            </div>
            {filtered.length===0
              ? <div style={{ borderRadius:18,padding:'3rem',textAlign:'center',background:'#fff',border:'1.5px dashed #f0eadb' }}><p style={{ fontWeight:600,color:'#5f6e8a',margin:0 }}>No hay partidos que coincidan</p></div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                  {Object.entries(groups).map(([group,items])=>(
                    <div key={group}>
                      <p style={{ fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'rgba(235,195,43,.85)',marginBottom:'.7rem' }}>{group}</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'.8rem' }}>
                        {items.map(m=><PartidoCard key={m.id} match={m}/>)}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {!loading && tab==='grupos' && <div className="din"><TablaGrupos matches={matches}/></div>}

        {/* Tab llaves → componente independiente */}
        {!loading && tab==='Eliminatoria' && <div className="din"><Eliminatorias matches={matches}/></div>}

      </div>
    </AppShell>
  )
}