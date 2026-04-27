/**
 * Eliminatorias.jsx — src/dashboard/Eliminatorias.jsx
 *
 * Bracket completo que:
 * - Escala automáticamente para entrar en pantalla (useRef + transform scale)
 * - Sin scrollbar
 * - Mobile: acordeón por ronda
 * - Desktop: bracket completo escalado
 */
import { useState, useMemo, useRef, useEffect } from 'react'

const LLAVES_16 = {
  A: [
    { local:'1° Grupo A', visitante:'2° Grupo B' },
    { local:'1° Grupo C', visitante:'2° Grupo D' },
    { local:'1° Grupo E', visitante:'2° Grupo F' },
    { local:'1° Grupo G', visitante:'2° Grupo H' },
  ],
  B: [
    { local:'1° Grupo B', visitante:'2° Grupo A' },
    { local:'1° Grupo D', visitante:'2° Grupo C' },
    { local:'1° Grupo F', visitante:'2° Grupo E' },
    { local:'1° Grupo H', visitante:'2° Grupo G' },
  ],
}

/* ─── Dimensiones fijas del bracket interno (en px, antes del scale) ─── */
const CARD_W   = 164
const CARD_H   = 52
const COL_GAP  = 28   // espacio horizontal entre columna y conector
const CONN_W   = 24   // ancho del conector svg
const COL_STEP = CARD_W + COL_GAP * 2 + CONN_W  // ancho total de col + conector
const VGAP_16  = 12   // gap vertical entre cards de 16avos
const FINAL_W  = 180

/* ─── Paleta ─── */
const C = {
  bg:        '#080f1e',
  bgCard:    'rgba(255,255,255,.055)',
  bgCardFin: 'rgba(235,195,43,.07)',
  border:    'rgba(255,255,255,.08)',
  borderFin: 'rgba(235,195,43,.5)',
  borderLive:'rgba(255,80,100,.6)',
  gold:      '#ebc32b',
  goldDim:   'rgba(235,195,43,.4)',
  goldFaint: 'rgba(235,195,43,.18)',
  white:     '#fff',
  muted:     'rgba(255,255,255,.5)',
  faint:     'rgba(255,255,255,.18)',
  live:      '#ff6070',
  conn:      'rgba(255,255,255,.12)',
  connGold:  'rgba(235,195,43,.35)',
  win:       'rgba(235,195,43,.09)',
}

/* ─── Tarjeta de partido ─── */
function Card({ match, ph, isFinal = false, scale = 1 }) {
  const eq1  = match?.equipo_local    || ph?.local     || 'Por definir'
  const eq2  = match?.equipo_visitante || ph?.visitante || 'Por definir'
  const b1   = match?.bandera_local
  const b2   = match?.bandera_visitante
  const fin  = match?.estado === 'finalizado'
  const live = match?.estado === 'en_vivo'
  const g1   = match?.goles_local    ?? null
  const g2   = match?.goles_visitante ?? null
  const w1   = fin && g1 != null && Number(g1) > Number(g2)
  const w2   = fin && g2 != null && Number(g2) > Number(g1)
  const empty = !match && !ph

  const w = isFinal ? FINAL_W : CARD_W
  const rowH = isFinal ? 28 : 24
  const fs = isFinal ? 12 : 10.5
  const fsScore = isFinal ? 16 : 13

  return (
    <div style={{
      width: w,
      background: isFinal ? C.bgCardFin : empty ? 'rgba(255,255,255,.02)' : C.bgCard,
      border: `${isFinal ? 2 : 1}px solid ${live ? C.borderLive : fin ? C.borderFin : isFinal ? C.goldFaint : C.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: live
        ? '0 0 16px rgba(255,80,100,.2)'
        : fin ? '0 0 10px rgba(235,195,43,.12)'
        : isFinal ? '0 0 20px rgba(235,195,43,.15)'
        : 'none',
    }}>
      {/* Header dorado para la final */}
      {isFinal && (
        <div style={{ background:'linear-gradient(90deg,rgba(235,195,43,.15),rgba(235,195,43,.04))', padding:'3px 10px', borderBottom:`1px solid ${C.goldFaint}` }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:9, letterSpacing:'.18em', color:C.goldDim }}>MUNDIAL 2026</span>
        </div>
      )}
      {/* Fila 1 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: rowH, padding:'0 8px', background: w1 ? C.win : 'transparent', borderBottom:`1px solid rgba(255,255,255,.05)` }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0, flex:1 }}>
          {b1
            ? <img src={b1} alt="" style={{ width:14, height:10, objectFit:'cover', borderRadius:1, flexShrink:0, opacity:.85 }}/>
            : <div style={{ width:14, height:10, borderRadius:1, background: empty ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.1)', flexShrink:0 }}/>
          }
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize: fs, fontWeight: w1 ? 600 : 400, color: empty ? C.faint : w1 ? C.white : C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {eq1}
          </span>
        </div>
        {g1 != null && (
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: fsScore, lineHeight:1, color: w1 ? C.gold : live ? C.live : 'rgba(255,255,255,.25)', flexShrink:0, marginLeft:6 }}>{g1}</span>
        )}
      </div>
      {/* Fila 2 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: rowH, padding:'0 8px', background: w2 ? C.win : 'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0, flex:1 }}>
          {b2
            ? <img src={b2} alt="" style={{ width:14, height:10, objectFit:'cover', borderRadius:1, flexShrink:0, opacity:.85 }}/>
            : <div style={{ width:14, height:10, borderRadius:1, background: empty ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.1)', flexShrink:0 }}/>
          }
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize: fs, fontWeight: w2 ? 600 : 400, color: empty ? C.faint : w2 ? C.white : C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {eq2}
          </span>
        </div>
        {g2 != null && (
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: fsScore, lineHeight:1, color: w2 ? C.gold : live ? C.live : 'rgba(255,255,255,.25)', flexShrink:0, marginLeft:6 }}>{g2}</span>
        )}
      </div>
      {/* Badge live/fin */}
      {(live || fin) && (
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'2px 8px', background:'rgba(0,0,0,.12)', borderTop:'1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:7, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color: live ? C.live : '#c99f16', display:'inline-flex', alignItems:'center', gap:3 }}>
            {live && <span style={{ width:3, height:3, borderRadius:'50%', background:C.live, animation:'ep 1.2s ease infinite', display:'inline-block' }}/>}
            {live ? (match?.minuto ? `${match.minuto}'` : 'EN VIVO') : 'FIN'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Conectores SVG entre columnas ─────────────────────────────────────
   Modo normal (expand=false): fromYs tiene más elementos, toYs menos.
     Cada par from[2i], from[2i+1] converge → to[i]
   Modo expand (expand=true):  fromYs tiene menos, toYs más.
     from[i] diverge → to[2i], to[2i+1]
*/
function Connectors({ x1, x2, fromYs, toYs, color = C.conn, expand = false }) {
  const xMid = (x1 + x2) / 2
  if (!expand) {
    return (
      <>
        {toYs.map((yTo, i) => {
          const ya = fromYs[i * 2]
          const yb = fromYs[i * 2 + 1]
          if (ya == null || yb == null) return null
          return (
            <g key={i}>
              <line x1={x1} y1={ya} x2={xMid} y2={ya} stroke={color} strokeWidth={1} strokeLinecap="round"/>
              <line x1={x1} y1={yb} x2={xMid} y2={yb} stroke={color} strokeWidth={1} strokeLinecap="round"/>
              <line x1={xMid} y1={ya} x2={xMid} y2={yb} stroke={color} strokeWidth={1} strokeLinecap="round"/>
              <line x1={xMid} y1={yTo} x2={x2} y2={yTo} stroke={color} strokeWidth={1} strokeLinecap="round"/>
            </g>
          )
        })}
      </>
    )
  }
  // expand: fromYs[i] → toYs[2i] y toYs[2i+1]
  return (
    <>
      {fromYs.map((yFrom, i) => {
        const ya = toYs[i * 2]
        const yb = toYs[i * 2 + 1]
        if (ya == null || yb == null) return null
        return (
          <g key={i}>
            <line x1={x1} y1={yFrom} x2={xMid} y2={yFrom} stroke={color} strokeWidth={1} strokeLinecap="round"/>
            <line x1={xMid} y1={ya} x2={xMid} y2={yb} stroke={color} strokeWidth={1} strokeLinecap="round"/>
            <line x1={xMid} y1={ya} x2={x2} y2={ya} stroke={color} strokeWidth={1} strokeLinecap="round"/>
            <line x1={xMid} y1={yb} x2={x2} y2={yb} stroke={color} strokeWidth={1} strokeLinecap="round"/>
          </g>
        )
      })}
    </>
  )
}

/* ─── Línea simple A→B ─── */
function Line({ x1, y1, x2, y2, color = C.connGold, w = 1.5 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round"/>
}

/* ─── Bracket Desktop ─── */
function BracketDesktop({ porFase }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  /* ─ Slots ─ */
  const mk = (fase, idx, ph) => ({
    match: porFase[fase]?.[idx] || null,
    ph:    porFase[fase]?.[idx] ? null : ph,
  })
  const s16A   = LLAVES_16.A.map((ph,i) => mk('16avos',i,ph))
  const s16B   = LLAVES_16.B.map((ph,i) => mk('16avos',i+4,ph))
  const sCuarA = [mk('cuartos',0,{local:'Gan. A1',visitante:'Gan. A2'}), mk('cuartos',1,{local:'Gan. A3',visitante:'Gan. A4'})]
  const sCuarB = [mk('cuartos',2,{local:'Gan. B1',visitante:'Gan. B2'}), mk('cuartos',3,{local:'Gan. B3',visitante:'Gan. B4'})]
  const sSemiA = [mk('semis',0,{local:'Gan. CuarA1',visitante:'Gan. CuarA2'})]
  const sSemiB = [mk('semis',1,{local:'Gan. CuarB1',visitante:'Gan. CuarB2'})]
  const mFin   = porFase['final']?.[0]      || null
  const m3er   = porFase['3er_puesto']?.[0] || null

  /* ─ Layout matemático ─
     Columnas de izquierda a derecha:
     0: 16avos A   (4 cards)
     1: cuartos A  (2 cards)
     2: semis A    (1 card)
     3: final      (1 card, más ancha)
     4: semis B    (1 card)
     5: cuartos B  (2 cards)
     6: 16avos B   (4 cards)
  */
  const COLS = 7
  const LABEL_H = 28   // altura del label de ronda encima
  const PAD_V   = 16   // padding vertical del bracket
  const PAD_H   = 12   // padding horizontal

  // Altura total: 4 cards + 3 gaps
  const totalH16 = 4 * CARD_H + 3 * VGAP_16
  const BRACKET_H = totalH16 + PAD_V * 2 + LABEL_H

  // Centros Y de los slots (relativos al top del área de cards = PAD_V + LABEL_H)
  function centersY(n) {
    const blockH = n * CARD_H + (n - 1) * VGAP_16
    const startY = (totalH16 - blockH) / 2
    return Array.from({ length: n }, (_, i) => PAD_V + LABEL_H + startY + i * (CARD_H + VGAP_16) + CARD_H / 2)
  }
  const cy16   = centersY(4)
  const cyCuar = centersY(2)
  const cySemi = centersY(1)
  const cyFin  = [PAD_V + LABEL_H + totalH16 / 2]

  // X de inicio de cada columna
  // 7 columnas: 16A | conn | cuarA | conn | semiA | conn | final | conn | semiB | conn | cuarB | conn | 16B
  const CONN = 20  // gap de conectores entre cols
  function colX(i) {
    const widths = [CARD_W, CONN, CARD_W, CONN, CARD_W, CONN, FINAL_W, CONN, CARD_W, CONN, CARD_W, CONN, CARD_W]
    let x = PAD_H
    for (let j = 0; j < i * 2; j++) x += widths[j]
    return x
  }
  const x16A   = colX(0)
  const xCuarA = colX(1)
  const xSemiA = colX(2)
  const xFinal = colX(3)
  const xSemiB = colX(4)
  const xCuarB = colX(5)
  const x16B   = colX(6)

  const TOTAL_W = x16B + CARD_W + PAD_H

  // Tops de cards
  const topY = (cy, idx) => cy[idx] - CARD_H / 2

  // Auto-scale al montar y al resize
  useEffect(() => {
    function calc() {
      if (!containerRef.current) return
      const avail = containerRef.current.offsetWidth
      const s = Math.min(1, avail / TOTAL_W)
      setScale(s)
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [TOTAL_W])

  // Labels de rondas
  const roundLabels = [
    { x: x16A   + CARD_W / 2,   text: 'LLAVE A',    gold: true  },
    { x: xCuarA + CARD_W / 2,   text: 'CUARTOS',    gold: false },
    { x: xSemiA + CARD_W / 2,   text: 'SEMIS',      gold: false },
    { x: xFinal + FINAL_W / 2,  text: 'GRAN FINAL', gold: true  },
    { x: xSemiB + CARD_W / 2,   text: 'SEMIS',      gold: false },
    { x: xCuarB + CARD_W / 2,   text: 'CUARTOS',    gold: false },
    { x: x16B   + CARD_W / 2,   text: 'LLAVE B',    gold: true  },
  ]

  return (
    <div ref={containerRef} style={{ width:'100%' }}>
      <div style={{
        width: TOTAL_W,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        height: BRACKET_H * scale,
      }}>
        {/* ── SVG de fondo: conectores y líneas ── */}
        <svg
          width={TOTAL_W}
          height={BRACKET_H}
          style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }}
        >
          {/* Labels */}
          {roundLabels.map(({ x, text, gold }) => (
            <text key={text+x} x={x} y={PAD_V + 14}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="'Bebas Neue',sans-serif" fontSize={11}
              letterSpacing="0.14em"
              fill={gold ? C.gold : 'rgba(255,255,255,.3)'}>
              {text}
            </text>
          ))}

          {/* Línea separadora bajo labels */}
          <line x1={PAD_H} y1={PAD_V + LABEL_H - 4} x2={TOTAL_W - PAD_H} y2={PAD_V + LABEL_H - 4}
            stroke="rgba(255,255,255,.05)" strokeWidth={1}/>

          {/* Conectores 16A → cuarA */}
          <Connectors
            x1={x16A + CARD_W} x2={xCuarA}
            fromYs={cy16} toYs={cyCuar}
            color={C.conn}
          />
          {/* Conectores cuarA → semiA */}
          <Connectors
            x1={xCuarA + CARD_W} x2={xSemiA}
            fromYs={cyCuar} toYs={cySemi}
            color={C.connGold}
          />
          {/* Línea semiA → final */}
          <Line x1={xSemiA + CARD_W} y1={cySemi[0]} x2={xFinal} y2={cyFin[0]} color={C.connGold} w={1.5}/>
          {/* Línea final → semiB */}
          <Line x1={xFinal + FINAL_W} y1={cyFin[0]} x2={xSemiB} y2={cySemi[0]} color={C.connGold} w={1.5}/>
          {/* Conectores semiB → cuarB (expand: 1→2) */}
          <Connectors
            x1={xSemiB + CARD_W} x2={xCuarB}
            fromYs={cySemi} toYs={cyCuar}
            color={C.connGold} expand
          />
          {/* Conectores cuarB → 16B (expand: 2→4) */}
          <Connectors
            x1={xCuarB + CARD_W} x2={x16B}
            fromYs={cyCuar} toYs={cy16}
            color={C.conn} expand
          />
        </svg>

        {/* ── Cards posicionadas absolutamente ── */}
        <div style={{ position:'relative', width: TOTAL_W, height: BRACKET_H }}>

          {/* 16avos A */}
          {s16A.map((s,i) => (
            <div key={i} style={{ position:'absolute', left: x16A, top: topY(cy16, i) }}>
              <Card match={s.match} ph={s.ph}/>
            </div>
          ))}

          {/* Cuartos A */}
          {sCuarA.map((s,i) => (
            <div key={i} style={{ position:'absolute', left: xCuarA, top: topY(cyCuar, i) }}>
              <Card match={s.match} ph={s.ph}/>
            </div>
          ))}

          {/* Semi A */}
          <div style={{ position:'absolute', left: xSemiA, top: topY(cySemi, 0) }}>
            <Card match={sSemiA[0].match} ph={sSemiA[0].ph}/>
          </div>

          {/* FINAL — trofeo + card */}
          <div style={{ position:'absolute', left: xFinal, top: topY(cyFin, 0) - 40, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f5d75a,#c99f16)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(235,195,43,.55)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#05090f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
            </div>
            <Card match={mFin} ph={{ local:'Gan. Semi A', visitante:'Gan. Semi B' }} isFinal/>
          </div>

          {/* 3er puesto */}
          <div style={{ position:'absolute', left: xFinal, top: topY(cyFin, 0) + CARD_H + 20, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', color:'rgba(255,255,255,.22)' }}>3ER PUESTO</span>
            <Card match={m3er} ph={{ local:'Perd. Semi A', visitante:'Perd. Semi B' }}/>
          </div>

          {/* Semi B */}
          <div style={{ position:'absolute', left: xSemiB, top: topY(cySemi, 0) }}>
            <Card match={sSemiB[0].match} ph={sSemiB[0].ph}/>
          </div>

          {/* Cuartos B */}
          {sCuarB.map((s,i) => (
            <div key={i} style={{ position:'absolute', left: xCuarB, top: topY(cyCuar, i) }}>
              <Card match={s.match} ph={s.ph}/>
            </div>
          ))}

          {/* 16avos B */}
          {s16B.map((s,i) => (
            <div key={i} style={{ position:'absolute', left: x16B, top: topY(cy16, i) }}>
              <Card match={s.match} ph={s.ph}/>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}

/* ─── Bracket Mobile: acordeón ─── */
function BracketMobile({ porFase }) {
  const [abierta, setAbierta] = useState(0)

  const mk = (fase, idx, ph) => ({
    match: porFase[fase]?.[idx] || null,
    ph:    porFase[fase]?.[idx] ? null : ph,
  })

  const rondas = [
    { titulo:'16AVOS — Llave A', gold:true,  slots: LLAVES_16.A.map((ph,i)=>mk('16avos',i,ph)) },
    { titulo:'CUARTOS — Llave A', gold:false, slots: [mk('cuartos',0,{local:'Gan. A1',visitante:'Gan. A2'}),mk('cuartos',1,{local:'Gan. A3',visitante:'Gan. A4'})] },
    { titulo:'SEMIS — Llave A',   gold:false, slots: [mk('semis',0,{local:'Gan. CuarA1',visitante:'Gan. CuarA2'})] },
    { titulo:'SEMIS — Llave B',   gold:false, slots: [mk('semis',1,{local:'Gan. CuarB1',visitante:'Gan. CuarB2'})] },
    { titulo:'CUARTOS — Llave B', gold:false, slots: [mk('cuartos',2,{local:'Gan. B1',visitante:'Gan. B2'}),mk('cuartos',3,{local:'Gan. B3',visitante:'Gan. B4'})] },
    { titulo:'16AVOS — Llave B',  gold:true,  slots: LLAVES_16.B.map((ph,i)=>mk('16avos',i+4,ph)) },
  ]

  const mFin = porFase['final']?.[0]      || null
  const m3er = porFase['3er_puesto']?.[0] || null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {rondas.map((r, ri) => (
        <div key={ri} style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${abierta===ri ? C.goldFaint : C.border}` }}>
          <button
            onClick={() => setAbierta(abierta===ri ? -1 : ri)}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background: abierta===ri ? 'rgba(235,195,43,.06)' : 'rgba(255,255,255,.03)', border:'none', cursor:'pointer' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:'.12em', color: r.gold ? C.gold : 'rgba(255,255,255,.55)' }}>{r.titulo}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:'rgba(255,255,255,.25)', background:'rgba(255,255,255,.06)', borderRadius:99, padding:'1px 6px' }}>{r.slots.length}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: abierta===ri ? 'rotate(180deg)' : 'none', transition:'transform .2s', flexShrink:0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {abierta === ri && (
            <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8, background:'rgba(0,0,0,.15)' }}>
              {r.slots.map((s,si) => <Card key={si} match={s.match} ph={s.ph}/>)}
            </div>
          )}
        </div>
      ))}

      {/* Final */}
      <div style={{ borderRadius:10, overflow:'hidden', border:`2px solid ${C.goldFaint}`, background:'rgba(235,195,43,.04)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'8px 14px', borderBottom:`1px solid ${C.goldFaint}` }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#f5d75a,#c99f16)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#05090f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:'.16em', color:C.gold }}>GRAN FINAL</span>
        </div>
        <div style={{ padding:10 }}>
          <Card match={mFin} ph={{ local:'Gan. Semi A', visitante:'Gan. Semi B' }} isFinal/>
        </div>
      </div>

      {/* 3er */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.14em', color:'rgba(255,255,255,.22)' }}>3ER PUESTO</span>
        <Card match={m3er} ph={{ local:'Perd. Semi A', visitante:'Perd. Semi B' }}/>
      </div>
    </div>
  )
}

/* ══ EXPORT PRINCIPAL ══ */
export default function Eliminatorias({ matches }) {
  const porFase = useMemo(() => {
    const map = {}
    matches
      .filter(m => ['16avos','cuartos','semis','final','3er_puesto'].includes(m.fase))
      .forEach(m => { if (!map[m.fase]) map[m.fase] = []; map[m.fase].push(m) })
    return map
  }, [matches])

  const hayAlgo = Object.keys(porFase).length > 0

  if (!hayAlgo) return (
    <div style={{ borderRadius:14, padding:'3rem 2rem', textAlign:'center', background:'linear-gradient(160deg,#0c1a30,#060d1c)', border:`1px solid ${C.goldFaint}` }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'rgba(235,195,43,.08)', border:`1px solid ${C.goldFaint}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(235,195,43,.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      </div>
      <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:'rgba(255,255,255,.55)', margin:'0 0 6px', letterSpacing:'.05em' }}>LLAVES NO DISPONIBLES AÚN</p>
      <p style={{ fontSize:'.78rem', color:'rgba(255,255,255,.28)', margin:0, lineHeight:1.6 }}>La fase eliminatoria comienza al finalizar la fase de grupos.</p>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes ep { 0%,100%{opacity:1} 50%{opacity:.3} }
        .elim-m { display:none !important; }
        .elim-d { display:block !important; }
        @media (max-width: 640px) {
          .elim-m { display:flex !important; }
          .elim-d { display:none !important; }
        }
      `}</style>

      <div style={{ background:`linear-gradient(160deg,#0c1e38 0%,${C.bg} 100%)`, borderRadius:16, padding:'16px', border:'1px solid rgba(255,255,255,.05)', boxShadow:'0 16px 48px rgba(0,0,0,.5)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,.05)' }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, letterSpacing:'.2em', color:'rgba(235,195,43,.5)' }}>◀ LLAVE A</span>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:'.12em', color:'rgba(255,255,255,.3)' }}>FASE ELIMINATORIA · MUNDIAL 2026</span>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, letterSpacing:'.2em', color:'rgba(235,195,43,.5)' }}>LLAVE B ▶</span>
        </div>

        {/* Desktop */}
        <div className="elim-d">
          <BracketDesktop porFase={porFase}/>
        </div>

        {/* Mobile */}
        <div className="elim-m" style={{ flexDirection:'column' }}>
          <BracketMobile porFase={porFase}/>
        </div>

      </div>
    </>
  )
}