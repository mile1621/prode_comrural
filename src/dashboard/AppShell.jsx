/**
 * AppShell.jsx — Navbar navy + fondo crema (#faf7f0)
 * Ubicación: src/dashboard/AppShell.jsx
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV_ITEMS = [
  { to:'/dashboard',        label:'Dashboard',  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { to:'/apuestas',         label:'Apuestas',   icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
  { to:'/partidos',         label:'Fixture',    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/mis-predicciones', label:'Mis Prodes', icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/ranking',          label:'Ranking',    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
]

const ADMIN_ICON = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>

function initials(name=''){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]?.toUpperCase()||'').join('')}

function NavLink({ to, label, icon, location }) {
  const a = location.pathname === to
  return (
    <Link to={to} style={{textDecoration:'none'}}>
      <span style={{display:'inline-flex',alignItems:'center',gap:'.38rem',padding:'.4rem .78rem',borderRadius:8,fontWeight:700,fontSize:'.75rem',letterSpacing:'.05em',textTransform:'uppercase',color:a?'#ebc32b':'rgba(255,255,255,.45)',background:a?'rgba(235,195,43,.12)':'transparent',border:a?'1px solid rgba(235,195,43,.28)':'1px solid transparent',transition:'all .16s',cursor:'pointer'}}
        onMouseEnter={e=>{if(!a){e.currentTarget.style.color='rgba(255,255,255,.82)';e.currentTarget.style.background='rgba(255,255,255,.05)'}}}
        onMouseLeave={e=>{if(!a){e.currentTarget.style.color='rgba(255,255,255,.45)';e.currentTarget.style.background='transparent'}}}>
        <span style={{color:a?'#ebc32b':'inherit',display:'flex',opacity:a?1:.65}}>{icon}</span>
        {label}
      </span>
    </Link>
  )
}

function NavLinkMob({ to, label, icon, location, onClick }) {
  const a = location.pathname === to
  return (
    <Link to={to} onClick={onClick} style={{textDecoration:'none'}}>
      <span style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.62rem .88rem',borderRadius:8,fontWeight:600,fontSize:'.85rem',color:a?'#ebc32b':'rgba(255,255,255,.6)',background:a?'rgba(235,195,43,.1)':'transparent'}}>
        <span style={{color:a?'#ebc32b':'inherit',display:'flex'}}>{icon}</span>{label}
      </span>
    </Link>
  )
}

export default function AppShell({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mob, setMob] = useState(false)

  const esAdmin = isAdmin || user?.rol === 'admin' || user?.es_admin === true || user?.tipo_usuario === 'admin'

  /* ── Logout con confirmación + toast ────────────────── */
async function doLogout(){ await logout(); navigate('/') }

  return (
    <>
      <style>{`
        @keyframes sh-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .sh-in{animation:sh-in .38s ease both}
        @keyframes ldot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.68)}}
        .ldot{animation:ldot 1.6s ease infinite}
        @media(max-width:860px){.dnav{display:none!important}.mhb{display:flex!important}}
      `}</style>

      <div style={{background:'#faf7f0',display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",minHeight:'100vh',flex:1}}>
  
        {/* NAV */}
        <nav style={{background:'#0c182b',position:'sticky',top:0,zIndex:50,borderBottom:'1px solid rgba(235,195,43,.14)'}}>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'0 1.5rem',height:62,display:'flex',alignItems:'center'}}>

            <Link to="/dashboard" style={{textDecoration:'none',flexShrink:0,marginRight:'1.8rem'}}>
              <img src="/imgprode/one-prode-talento-new3.png" alt="Prode Talento" style={{height:32,width:'auto',filter:'drop-shadow(0 2px 8px rgba(0,0,0,.5))'}}/>
            </Link>

            {/* Desktop nav */}
            <div className="dnav" style={{display:'flex',alignItems:'center',gap:'.15rem',flex:1}}>
              {NAV_ITEMS.map(({to,label,icon}) => (
                <NavLink key={to} to={to} label={label} icon={icon} location={location}/>
              ))}
              {esAdmin && <NavLink to="/admin" label="Admin" icon={ADMIN_ICON} location={location}/>}
            </div>

            <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginLeft:'auto'}}>
              <span style={{display:'flex',alignItems:'center',gap:'.32rem',fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#22c55e'}}>
                <span className="ldot" style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                En vivo
              </span>
              <div style={{display:'flex',alignItems:'center',gap:'.42rem',padding:'.28rem .62rem .28rem .28rem',borderRadius:99,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)'}}>
                <div style={{width:27,height:27,borderRadius:'50%',background:'linear-gradient(135deg,#ebc32b,#c99f16)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:'.88rem',color:'#05090f'}}>
                  {initials(user?.nombre||user?.name||'U')}
                </div>
                <span style={{fontSize:'.78rem',fontWeight:600,color:'rgba(255,255,255,.72)',maxWidth:84,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {user?.nombre||user?.name||'Usuario'}
                </span>
              </div>
              <button onClick={doLogout} style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',borderRadius:7,padding:'.3rem .68rem',fontSize:'.74rem',fontWeight:600,color:'rgba(255,255,255,.35)',cursor:'pointer',transition:'all .16s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,77,109,.45)';e.currentTarget.style.color='#ff4d6d'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.1)';e.currentTarget.style.color='rgba(255,255,255,.35)'}}>
                Salir
              </button>
              <button className="mhb" onClick={()=>setMob(v=>!v)} style={{display:'none',background:'transparent',border:'1px solid rgba(255,255,255,.14)',borderRadius:7,padding:'.36rem',cursor:'pointer',color:'rgba(255,255,255,.6)',alignItems:'center'}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  {mob?<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>:<><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mob && (
            <div style={{borderTop:'1px solid rgba(235,195,43,.1)',padding:'.55rem 1rem .75rem',display:'flex',flexDirection:'column',gap:'.18rem'}}>
              {NAV_ITEMS.map(({to,label,icon}) => (
                <NavLinkMob key={to} to={to} label={label} icon={icon} location={location} onClick={()=>setMob(false)}/>
              ))}
              {esAdmin && <NavLinkMob to="/admin" label="Admin" icon={ADMIN_ICON} location={location} onClick={()=>setMob(false)}/>}
            </div>
          )}
        </nav>

        <main className="sh-in" style={{flex:1, minHeight:0}}>{children}</main>

        <footer style={{background:'#0c182b',padding:'.85rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.4rem',borderTop:'1px solid rgba(235,195,43,.08)'}}>
          <span style={{fontSize:'.7rem',color:'rgba(255,255,255,.2)'}}>Prode Talento © 2026 · Escencial Consultora</span>
          <span style={{fontSize:'.7rem',color:'rgba(255,255,255,.2)'}}>Juego responsable</span>
</footer>
      </div>
    </>
  )
}