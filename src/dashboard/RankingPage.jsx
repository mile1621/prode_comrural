/**
 * RankingPage.jsx — Fondo crema, cards blancas, navy+gold
 * Ubicación: src/dashboard/RankingPage.jsx
 */
import { useState, useEffect } from 'react'
import AppShell from './AppShell.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import sheetsApi from '../services/sheetsApi.js'

const CARD={background:'#fff',border:'1px solid #f0eadb',borderRadius:14,boxShadow:'0 1px 0 rgba(12,24,43,.04)'}
const MUTED={fontSize:'.76rem',color:'#5f6e8a'}

function isOpen(b){return b.estado==='abierta'&&new Date(b.fecha_cierre)>Date.now()}

export default function RankingPage(){
  const {bets,loading:lb}=useBets()
  const {user}=useAuth()
  const [sel,setSel]=useState(null)
  const [tabla,setTabla]=useState([])
  const [meta,setMeta]=useState({})
  const [loading,setLoading]=useState(false)

  async function cargar(bet){
    setSel(bet); setLoading(true); setTabla([]); setMeta({})
    try{
      const r=await sheetsApi.predicciones.tabla(bet.id)
      setTabla(r.tabla||[])
      setMeta({total:r.total,mi_posicion:r.mi_posicion,esta_en_top:r.esta_en_top})
    }catch(e){alert('Error: '+e.message)}
    finally{setLoading(false)}
  }

  const MEDALS=['🥇','🥈','🥉']

  return(
    <AppShell>
      <style>{`
        @keyframes din{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .din{animation:din .38s ease both}
        @keyframes skp{0%,100%{opacity:.7}50%{opacity:.3}}
      `}</style>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'2rem 1.5rem 3rem'}}>

        {/* Header */}
        <div className="din" style={{marginBottom:'1.75rem'}}>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.4rem,6vw,3.5rem)',color:'#0c182b',margin:'0 0 .3rem',lineHeight:1,letterSpacing:'.02em'}}>RANKING</h1>
          <p style={{...MUTED,margin:0}}>{sel?`Tabla de "${sel.titulo}"`:' Seleccioná una apuesta para ver la tabla de posiciones'}</p>
        </div>

        {!sel&&(
          <div className="din" style={{animationDelay:'60ms'}}>
            {lb?(
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                {[1,2,3].map(i=><div key={i} style={{height:70,...CARD,animation:'skp 1.4s ease infinite'}}/>)}
              </div>
            ):bets.length===0?(
              <div style={{...CARD,borderRadius:18,padding:'3rem',textAlign:'center'}}>
                <p style={{fontWeight:600,color:'#5f6e8a',margin:0}}>No hay apuestas disponibles</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:'.65rem'}}>
                {bets.map(bet=>{
                  const open=isOpen(bet)
                  const estadoLabel=bet.estado==='finalizada'?'Finalizada':open?'Activa':'Cerrada'
                  const estadoColor=bet.estado==='finalizada'?'#c99f16':open?'#1b8a5a':'#5f6e8a'
                  return(
                    <div key={bet.id} style={{...CARD,padding:'.9rem 1.1rem',display:'flex',alignItems:'center',gap:'1rem',cursor:'pointer',transition:'all .17s'}}
                      onClick={()=>cargar(bet)}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#ebc32b';e.currentTarget.style.transform='translateX(3px)';e.currentTarget.style.boxShadow='0 6px 18px rgba(12,24,43,.08)'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#f0eadb';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 0 rgba(12,24,43,.04)'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:'.9rem',color:'#0c182b',margin:'0 0 .2rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bet.titulo}</p>
                        <p style={{...MUTED,margin:0}}>{bet.premio||''}{bet.partidos_ids?` · ${bet.partidos_ids.split(',').filter(Boolean).length} partidos`:''}</p>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'1rem',flexShrink:0}}>
                        <div style={{textAlign:'right'}}>
                          <p style={{fontSize:'.6rem',textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',margin:'0 0 2px'}}>Participantes</p>
                          <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',color:'#0c182b',margin:0,lineHeight:1}}>{bet.participantes||0}</p>
                        </div>
                        <span style={{padding:'.22rem .65rem',borderRadius:99,fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',background:`${estadoColor}14`,color:estadoColor,border:`1px solid ${estadoColor}33`}}>{estadoLabel}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8b2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {sel&&(
          <div className="din">
            <button onClick={()=>{setSel(null);setTabla([])}} style={{display:'inline-flex',alignItems:'center',gap:'.4rem',marginBottom:'1.5rem',background:'transparent',border:'1px solid #f0eadb',borderRadius:99,padding:'.35rem .85rem',fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem',fontWeight:600,color:'#5f6e8a',cursor:'pointer',transition:'all .16s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#0c182b';e.currentTarget.style.color='#0c182b'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#f0eadb';e.currentTarget.style.color='#5f6e8a'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Volver
            </button>

            {/* Banner de la apuesta */}
            <div style={{borderRadius:16,padding:'1.2rem 1.5rem',marginBottom:'1.4rem',background:'#0c182b',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,width:220,height:'100%',background:'radial-gradient(ellipse at 80% 50%,rgba(235,195,43,.14),transparent 65%)',pointerEvents:'none'}}/>
              <p style={{fontWeight:700,fontSize:'.65rem',textTransform:'uppercase',letterSpacing:'.14em',color:'rgba(235,195,43,.7)',margin:'0 0 .3rem'}}>Tabla de posiciones</p>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.6rem',color:'#fff',margin:'0 0 .2rem',letterSpacing:'.02em'}}>{sel.titulo}</h2>
              {meta.total>0&&<p style={{fontSize:'.78rem',color:'rgba(255,255,255,.45)',margin:0}}>{meta.total} participantes{meta.mi_posicion?` · Tu posición: #${meta.mi_posicion}`:''}</p>}
            </div>

            {loading?(
              <div style={{...CARD,borderRadius:16,overflow:'hidden'}}>
                {[...Array(5)].map((_,i)=><div key={i} style={{height:52,borderBottom:'1px solid #f0eadb',animation:'skp 1.4s ease infinite'}}/>)}
              </div>
            ):tabla.length===0?(
              <div style={{...CARD,borderRadius:16,padding:'3rem',textAlign:'center'}}>
                <p style={{fontWeight:600,color:'#5f6e8a',margin:0}}>Sin participantes todavía</p>
              </div>
            ):(
              <div style={{...CARD,borderRadius:16,overflow:'hidden'}}>
                {/* Head */}
                <div style={{display:'grid',gridTemplateColumns:'44px 1fr 60px 60px 60px 72px',padding:'.6rem 1rem',background:'rgba(12,24,43,.03)',borderBottom:'1px solid #f0eadb'}}>
                  {['#','Participante','Pred.','Exactos','Dif.','Puntos'].map(h=>(
                    <span key={h} style={{fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8b2c4',textAlign:h==='Puntos'?'right':h==='Pred.'||h==='Exactos'||h==='Dif.'?'center':'left'}}>{h}</span>
                  ))}
                </div>
                {/* Rows */}
                {tabla.map((u,i)=>{
                  const me=u.user_id===user?.id
                  return(
                    <div key={u.user_id} style={{display:'grid',gridTemplateColumns:'44px 1fr 60px 60px 60px 72px',padding:'.72rem 1rem',borderBottom:i<tabla.length-1?'1px solid #f5f3ee':'none',background:me?'rgba(235,195,43,.06)':i%2===0?'rgba(12,24,43,.015)':'#fff',transition:'background .15s'}}
                      onMouseEnter={e=>{if(!me)e.currentTarget.style.background='rgba(12,24,43,.04)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background=me?'rgba(235,195,43,.06)':i%2===0?'rgba(12,24,43,.015)':'#fff'}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.05rem',color:i<3?'#c99f16':'#a8b2c4'}}>{MEDALS[i]||i+1}</span>
                      <span style={{fontWeight:me?700:500,fontSize:'.86rem',color:me?'#c99f16':'#0c182b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {u.nombre} {me&&<span style={{fontSize:'.65rem',color:'#a8b2c4'}}>(vos)</span>}
                      </span>
                      <span style={{textAlign:'center',fontSize:'.84rem',color:'#5f6e8a'}}>{u.predicciones}</span>
                      <span style={{textAlign:'center',fontWeight:600,fontSize:'.84rem',color:'#1b8a5a'}}>{u.aciertos_exactos}</span>
                      <span style={{textAlign:'center',fontWeight:600,fontSize:'.84rem',color:'#c99f16'}}>{u.aciertos_diferencia||0}</span>
                      <span style={{textAlign:'right',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',color:'#0c182b'}}>{u.puntos_totales}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
