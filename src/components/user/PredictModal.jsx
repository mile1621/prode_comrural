/**
 * PredictModal.jsx — src/dashboard/components/PredictModal.jsx
 *
 * Rediseño v4 — "Match Center Pro"
 * - Mobile-first con navegación adaptativa
 * - Microinteracciones pulidas
 * - Scroll management profesional
 * - Validación inline + autosave
 * - Sistema de diseño consistente
 */

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBets } from '../../hooks/useBets.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { timeLeft, isBetOpen } from '../../utils/index.js'

// ──────────────────────────────────────────────────────────────────
// 🎨 DESIGN TOKENS
// ──────────────────────────────────────────────────────────────────
const C = {
  // Neutros
  cream50:   '#fcf9f1',
  cream100:  '#f7f1e1',
  cream200:  '#ede4cc',
  
  ink900:    '#050a18',
  ink800:    '#0a1226',
  ink700:    '#1a2540',
  ink600:    '#2d3a5a',
  
  steel400:  '#a8b2c4',
  steel300:  '#c4cbd8',
  
  // Acentos
  gold600:   '#a87a0b',
  gold500:   '#d4a017',
  gold400:   '#ebc32b',
  
  red500:    '#e03252',
  green500:  '#1f9d6b',
}

// ─── Detección de eliminatoria ─
function esEliminatoria(fase) {
  if (!fase) return false
  return String(fase).trim().toLowerCase() !== 'grupos'
}

// ─── Debounce hook ─
function useDebounce(callback, delay, deps) {
  useEffect(() => {
    const handler = setTimeout(callback, delay)
    return () => clearTimeout(handler)
  }, [...deps, delay])
}

export default function PredictModal({ bet, onSubmit, onClose, loading }) {
  const { predictions } = useBets()
  const { user } = useAuth()
  const [scores, setScores] = useState({})
  const [clasificados, setClasificados] = useState({})
  const [activeMatchIdx, setActiveMatchIdx] = useState(0)
  const matchRefs = useRef({})
  const listRef = useRef(null)
  const navRef = useRef(null)

  const esApuestaGrupos = bet?.tipo === 'grupos' || bet?.type === 'grupos'
  const esJefe = user?.tipo_usuario === 'jefe'
  const areaUsuario = user?.area_id
  const areasParticipantes = bet?.areas_ids ? String(bet.areas_ids).split(',').map(id => id.trim()) : []
  const miAreaParticipa = areaUsuario && areasParticipantes.includes(String(areaUsuario))
  const estaBloqueado = esApuestaGrupos && (!esJefe || !miAreaParticipa)

  let razonBloqueo = null
  if (estaBloqueado) {
    if (!esJefe) {
      razonBloqueo = {
        titulo: 'Solo el jefe de área puede cargar predicciones',
        detalle: 'Esta apuesta es grupal: cada área compite como equipo y las predicciones las carga únicamente el jefe. Podés ver los partidos pero no modificar el marcador.',
      }
    } else if (!miAreaParticipa) {
      razonBloqueo = {
        titulo: 'Tu área no participa en esta apuesta',
        detalle: 'Esta apuesta grupal está reservada a otras áreas de la empresa. Podés ver los partidos pero no cargar predicciones.',
      }
    }
  }

  // ─── Init scores & clasificados ─
  useEffect(() => {
    if (bet?.partidos) {
      const initialScores = {}
      const initialClasif = {}
      bet.partidos.forEach(p => {
        const existingPred = predictions?.[p.id]
        initialScores[p.id] = {
          local: existingPred?.pred_local != null ? String(existingPred.pred_local) : '',
          visitante: existingPred?.pred_visitante != null ? String(existingPred.pred_visitante) : '',
        }
        initialClasif[p.id] = existingPred?.pred_clasificado || ''
      })
      setScores(initialScores)
      setClasificados(initialClasif)
    }
  }, [bet, predictions])

  // ─── Autosave draft to localStorage ─
  useDebounce(() => {
    if (!bet?.id) return
    try {
      localStorage.setItem(`bet-${bet.id}-draft`, JSON.stringify({ scores, clasificados }))
    } catch (e) {
      console.warn('Error saving draft:', e)
    }
  }, 2000, [scores, clasificados])

  // ─── Load draft on mount ─
  useEffect(() => {
    if (!bet?.id) return
    try {
      const draft = localStorage.getItem(`bet-${bet.id}-draft`)
      if (draft) {
        const { scores: dScores, clasificados: dClasif } = JSON.parse(draft)
        if (dScores) setScores(prev => ({ ...prev, ...dScores }))
        if (dClasif) setClasificados(prev => ({ ...prev, ...dClasif }))
      }
    } catch (e) {
      console.warn('Error loading draft:', e)
    }
  }, [bet?.id])

  // ─── ESC to close ─
  useEffect(() => {
    if (!bet) return
    function handleKeyDown(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bet, onClose])

  // ─── Prevent body scroll ─
  useEffect(() => {
    if (!bet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [bet])

  // ─── Scrollspy: track visible match ─
  useEffect(() => {
    if (!bet?.partidos || !listRef.current) return
    
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.matchId
            const idx = bet.partidos.findIndex(p => String(p.id) === id)
            if (idx !== -1) setActiveMatchIdx(idx)
          }
        })
      },
      { root: listRef.current, threshold: 0.6 }
    )

    Object.values(matchRefs.current).forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [bet?.partidos])

  if (!bet) return null

  const open = isBetOpen(bet)
  const remaining = timeLeft(bet.fecha_cierre)
  const isClosingSoon = open && remaining !== 'Cerrada' && !remaining.includes('d')

  const totalMatches = bet.partidos?.length || 0

  function predicionCompleta(match) {
    const sc = scores[match.id]
    if (!sc || sc.local === '' || sc.visitante === '') return false
    if (esEliminatoria(match.fase)) {
      const pl = parseInt(sc.local, 10)
      const pv = parseInt(sc.visitante, 10)
      if (!isNaN(pl) && !isNaN(pv) && pl === pv && !clasificados[match.id]) return false
    }
    return true
  }

  const filledCount = bet.partidos?.filter(predicionCompleta).length || 0
  const hadPredictions = bet.partidos?.some(p => predictions?.[p.id]) ?? false
  const progressPct = totalMatches > 0 ? (filledCount / totalMatches) * 100 : 0
  const pendingCount = totalMatches - filledCount

  function handleSubmit(e) {
    e.preventDefault()
    if (estaBloqueado) return

    const matchPredictions = []
    const empatesSinClasificado = []

    for (const match of (bet.partidos || [])) {
      const vals = scores[match.id]
      if (!vals) continue
      const pl = parseInt(vals.local, 10)
      const pv = parseInt(vals.visitante, 10)
      if (isNaN(pl) || isNaN(pv)) continue

      const item = { partido_id: match.id, pred_local: pl, pred_visitante: pv }

      if (esEliminatoria(match.fase)) {
        if (pl !== pv) {
          item.pred_clasificado = pl > pv ? match.codigo_local : match.codigo_visitante
        } else {
          const clasif = clasificados[match.id]
          if (!clasif) {
            empatesSinClasificado.push(match.equipo_local + ' vs ' + match.equipo_visitante)
            continue
          }
          item.pred_clasificado = clasif
        }
      }
      matchPredictions.push(item)
    }

    if (empatesSinClasificado.length > 0) {
      alert(
        'Predijiste un empate y no indicaste quién pasa por penales.\n\nFalta el clasificado en:\n• ' +
        empatesSinClasificado.join('\n• ')
      )
      return
    }

    if (matchPredictions.length === 0) {
      alert('Ingresá al menos una predicción válida.')
      return
    }

    // Clear draft on submit
    try {
      localStorage.removeItem(`bet-${bet.id}-draft`)
    } catch (e) {}

    onSubmit(bet.id, matchPredictions)
  }

  function updateScore(partidoId, side, value) {
    if (value !== '' && !/^\d{1,2}$/.test(value)) return
    setScores(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [side]: value } }))
    
    // Auto-clear clasificado if score is no longer a tie
    setClasificados(prev => {
      const match = bet.partidos?.find(p => p.id === partidoId)
      if (!match || !esEliminatoria(match.fase)) return prev
      const otherSide = side === 'local' ? 'visitante' : 'local'
      const otherVal = scores[partidoId]?.[otherSide]
      const newPl = side === 'local' ? parseInt(value, 10) : parseInt(otherVal, 10)
      const newPv = side === 'visitante' ? parseInt(value, 10) : parseInt(otherVal, 10)
      if (!isNaN(newPl) && !isNaN(newPv) && newPl !== newPv && prev[partidoId]) {
        const next = { ...prev }
        delete next[partidoId]
        return next
      }
      return prev
    })
  }

  function updateClasificado(partidoId, codigo) {
    setClasificados(prev => ({ ...prev, [partidoId]: codigo }))
  }

  function scrollToMatch(id, idx) {
    const el = matchRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setActiveMatchIdx(idx)
    }
  }

  const modalContent = (
    <>
      <style>{`
        @keyframes pm-fade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pm-zoom  { from { opacity: 0; transform: scale(.97) } to { opacity: 1; transform: scale(1) } }
        @keyframes pm-slide { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes pm-spin  { to { transform: rotate(360deg) } }
        @keyframes pm-pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }
        @keyframes pm-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes pm-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }

        * { box-sizing: border-box; }

        /* ─── OVERLAY ─── */
        .pm-overlay {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at center, rgba(10,18,38,.8) 0%, rgba(5,10,24,.94) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 99999;
          display: flex; 
          align-items: center; 
          justify-content: center;
          padding: 1.5rem;
          animation: pm-fade .2s ease both;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

.pm-shell {
  position: relative;
  width: 100%; 
  max-width: 1200px;
  height: calc(100vh - 3rem);
  max-height: 900px;
  background: ${C.cream100};
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(212,160,23,.15),
    0 50px 100px rgba(0,0,0,.7);
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 1fr;  /* ← AGREGÁ ESTA LÍNEA */
  overflow: hidden;
  animation: pm-zoom .28s cubic-bezier(.2,.8,.2,1) both;
}

        @media (max-width: 900px) {
          .pm-overlay { 
            padding: 0; 
            align-items: flex-end; 
          }
          .pm-shell {
            grid-template-columns: 1fr;
            height: 96vh;
            max-height: none;
            border-radius: 16px 16px 0 0;
            animation: pm-slide .32s cubic-bezier(.2,.8,.2,1) both;
          }
        }

        /* ─── SIDEBAR (desktop only) ─── */
        .pm-side {
          background: ${C.ink800};
          color: ${C.cream100};
          display: flex; 
          flex-direction: column;
          border-right: 1px solid ${C.ink700};
          overflow: hidden;
        }

        @media (max-width: 900px) { 
          .pm-side { display: none; } 
        }

        .pm-side-head {
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .pm-side-eyebrow {
          font-size: 0.6875rem; 
          font-weight: 700;
          letter-spacing: 0.1em;
          color: ${C.gold400}; 
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .pm-side-title {
          font-size: 1.25rem; 
          font-weight: 700;
          line-height: 1.2; 
          margin: 0;
          color: ${C.cream50};
        }

        /* Stats */
        .pm-stats {
          padding: 1rem 1.25rem;
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .pm-stat {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 6px;
          padding: 0.75rem;
        }

        .pm-stat-num {
          font-size: 1.75rem; 
          font-weight: 800;
          line-height: 1;
          color: ${C.gold400};
        }

        .pm-stat-num.dim { 
          color: ${C.steel400}; 
        }

        .pm-stat-lab {
          font-size: 0.6875rem; 
          letter-spacing: 0.08em;
          color: ${C.steel400}; 
          text-transform: uppercase;
          margin-top: 0.375rem;
          font-weight: 600;
        }

        /* Status */
        .pm-side-status {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .pm-side-pill {
          display: inline-flex; 
          align-items: center; 
          gap: 0.5rem;
          padding: 0.5rem 0.875rem; 
          border-radius: 999px;
          font-size: 0.6875rem; 
          font-weight: 700;
          letter-spacing: 0.08em; 
          text-transform: uppercase;
        }

        .pm-pill-open { 
          background: rgba(212,160,23,.12); 
          color: ${C.gold400}; 
          border: 1px solid rgba(212,160,23,.3); 
        }

        .pm-pill-soon { 
          background: rgba(224,50,82,.12); 
          color: #ff8095; 
          border: 1px solid rgba(224,50,82,.35); 
          animation: pm-pulse 1.8s ease-in-out infinite; 
        }

        .pm-pill-closed { 
          background: rgba(168,178,196,.08); 
          color: ${C.steel400}; 
          border: 1px solid rgba(168,178,196,.2); 
        }

        .pm-side-status-detail {
          margin-top: 0.625rem; 
          font-size: 0.8125rem;
          color: ${C.steel400}; 
          line-height: 1.5;
        }

        /* Nav list */
        .pm-nav {
          flex: 1; 
          overflow-y: auto;
          padding: 0.5rem 0.75rem 1rem;
        }

        .pm-nav::-webkit-scrollbar { width: 5px; }
        .pm-nav::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,.12); 
          border-radius: 3px; 
        }

        .pm-nav-title {
          padding: 0.875rem 0.625rem 0.5rem;
          font-size: 0.6875rem; 
          letter-spacing: 0.12em;
          color: ${C.steel400}; 
          text-transform: uppercase;
          font-weight: 700;
        }

        .pm-nav-item {
          display: flex; 
          align-items: center; 
          gap: 0.625rem;
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: transparent; 
          border: none;
          color: ${C.cream100};
          text-align: left; 
          cursor: pointer;
          border-radius: 6px;
          font-size: 0.8125rem;
          transition: all .18s;
          border-left: 2px solid transparent;
          margin-bottom: 0.25rem;
        }

        .pm-nav-item:hover { 
          background: rgba(255,255,255,.05); 
        }

        .pm-nav-item.active {
          background: rgba(212,160,23,.12);
          border-left-color: ${C.gold400};
        }

        .pm-nav-item.done { 
          border-left-color: ${C.gold500}; 
        }

        .pm-nav-item.live { 
          border-left-color: ${C.red500}; 
        }

        .pm-nav-num {
          width: 24px; 
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.06);
          border-radius: 4px;
          color: ${C.steel400}; 
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .pm-nav-item.done .pm-nav-num { 
          background: ${C.gold500};
          color: ${C.ink900};
        }

        .pm-nav-item.live .pm-nav-num {
          background: ${C.red500};
          color: white;
          animation: pm-pulse 1.2s ease-in-out infinite;
        }

        .pm-nav-teams {
          flex: 1; 
          min-width: 0;
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis;
        }

        .pm-nav-dot {
          width: 6px; 
          height: 6px; 
          border-radius: 50%;
          background: rgba(255,255,255,.15);
          flex-shrink: 0;
        }

        .pm-nav-item.done .pm-nav-dot { 
          background: ${C.gold400}; 
        }

        .pm-nav-item.live .pm-nav-dot { 
          background: ${C.red500}; 
        }

        /* ─── MAIN COLUMN ─── */
.pm-main {
  display: flex; 
  flex-direction: column;
  background: ${C.cream50};
  min-width: 0;
  height: 100%;
  overflow: hidden;  /* ← AGREGÁ ESTO TAMBIÉN */
}

        /* Top bar */
        .pm-topbar {
padding: 0.875rem 1rem;
          background: white;
          border-bottom: 1px solid ${C.cream200};
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          gap: 1rem;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .pm-topbar { 
            padding: 1rem; 
          }
        }

        .pm-topbar-info { 
          min-width: 0; 
          flex: 1;
        }

        .pm-topbar-eyebrow {
          font-size: 0.6875rem; 
          letter-spacing: 0.1em;
          color: ${C.gold600}; 
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .pm-topbar-title {
          font-size: clamp(1.125rem, 3vw, 1.5rem);
          font-weight: 700;
          color: ${C.ink900}; 
          margin: 0;
          line-height: 1.2;
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis;
        }

        .pm-topbar-actions { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          flex-shrink: 0; 
        }

        .pm-mobile-status {
          display: none;
        }

        @media (max-width: 900px) {
          .pm-mobile-status { 
            display: inline-flex; 
          }
        }

        .pm-icon-btn {
          width: 36px; 
          height: 36px;
          background: transparent;
          border: 1px solid ${C.cream200};
          color: ${C.steel400};
          border-radius: 6px;
          display: inline-flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer; 
          transition: all .18s;
          flex-shrink: 0;
        }

        .pm-icon-btn:hover {
          background: ${C.ink800}; 
          border-color: ${C.ink800}; 
          color: white;
        }

        /* Mobile quick nav */
        .pm-quick-nav {
          display: none;
          padding: 0.75rem 1rem;
          background: white;
          border-bottom: 1px solid ${C.cream200};
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .pm-quick-nav::-webkit-scrollbar { display: none; }

        @media (max-width: 900px) {
          .pm-quick-nav { 
            display: block; 
          }
        }

        .pm-quick-row {
          display: inline-flex;
          gap: 0.5rem;
          min-width: min-content;
        }

        .pm-quick-pill {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${C.cream100};
          border: 1.5px solid ${C.cream200};
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: ${C.ink700};
          cursor: pointer;
          transition: all .18s;
          flex-shrink: 0;
          scroll-snap-align: start;
        }

        .pm-quick-pill.active {
          background: ${C.ink800};
          border-color: ${C.gold500};
          color: ${C.gold400};
          box-shadow: 0 0 0 3px rgba(212,160,23,.15);
        }

        .pm-quick-pill.done {
          background: ${C.gold500};
          border-color: ${C.gold500};
          color: ${C.ink900};
        }

        .pm-quick-pill.live {
          background: ${C.red500};
          border-color: ${C.red500};
          color: white;
          animation: pm-pulse 1.2s ease-in-out infinite;
        }

/* List */
.pm-list {
  flex: 1; 
  overflow-y: auto;
padding: 0.875rem 1rem;
  scroll-behavior: smooth;
  
  /* ← AGREGÁ ESTAS LÍNEAS */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  contain: layout style paint;
}

        .pm-list::-webkit-scrollbar { width: 8px; }
        .pm-list::-webkit-scrollbar-track { background: transparent; }
        .pm-list::-webkit-scrollbar-thumb { 
          background: ${C.cream200}; 
          border-radius: 4px; 
        }
        .pm-list::-webkit-scrollbar-thumb:hover { 
          background: ${C.gold500}; 
        }

        @media (max-width: 600px) {
          .pm-list { 
            padding: 1rem; 
          }
        }

        /* Empty state */
        .pm-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          color: ${C.steel400};
        }

        .pm-empty svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .pm-empty h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${C.ink700};
          margin: 0 0 0.5rem;
        }

        .pm-empty p {
          font-size: 0.9375rem;
          margin: 0;
        }

        /* Block message */
        .pm-block {
          display: flex; 
          gap: 0.875rem;
          background: white;
          border: 1px solid ${C.cream200};
          border-left: 4px solid ${C.red500};
          border-radius: 8px;
          padding: 1.125rem 1.25rem;
margin-bottom: 0.75rem;
        }

        .pm-block-icon {
          width: 36px; 
          height: 36px; 
          flex-shrink: 0;
          border-radius: 6px;
          background: ${C.red500}; 
          color: white;
          font-weight: 800;
          font-size: 1.125rem;
          display: flex; 
          align-items: center; 
          justify-content: center;
        }

        .pm-block-content {
          flex: 1;
          min-width: 0;
        }

        .pm-block-title { 
          font-weight: 700; 
          color: ${C.ink800}; 
          margin-bottom: 0.375rem;
          font-size: 0.9375rem;
        }

        .pm-block-detail { 
          font-size: 0.8125rem; 
          color: ${C.steel400}; 
          line-height: 1.5; 
        }

        /* ─── MATCH CARD ─── */
.pm-card {
  background: white;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(10,18,38,.03),
    0 4px 12px rgba(10,18,38,.08);
  border: 1.5px solid ${C.cream200};
  transition: all .22s cubic-bezier(.2,.8,.2,1);
  
  /* ← AGREGÁ ESTAS 3 LÍNEAS */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

        .pm-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 2px 0 rgba(10,18,38,.04), 
            0 12px 24px rgba(10,18,38,.14);
        }

        .pm-card.done { 
          border-color: ${C.gold500}; 
          box-shadow: 
            0 0 0 1px ${C.gold500}, 
            0 8px 20px rgba(212,160,23,.25); 
        }

        .pm-card.live { 
          border-color: ${C.red500}; 
          box-shadow:
            0 0 0 1px ${C.red500},
            0 8px 20px rgba(224,50,82,.25);
        }

        /* Strip */
        .pm-strip {
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          padding: 0.625rem 1rem;
          background: ${C.ink800};
          color: ${C.cream100};
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em; 
          text-transform: uppercase;
        }

        .pm-card.done .pm-strip { 
          background: linear-gradient(90deg, ${C.ink800}, ${C.ink700}); 
        }

        .pm-strip-left { 
          display: flex; 
          align-items: center; 
          gap: 0.625rem; 
        }

        .pm-strip-num {
          background: ${C.gold400}; 
          color: ${C.ink900};
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem; 
          border-radius: 4px;
          min-width: 32px;
          text-align: center;
        }

        .pm-strip-fase {
          color: ${C.gold400};
        }

        .pm-strip-right { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
        }

        .pm-tag {
          display: inline-flex; 
          align-items: center; 
          gap: 0.375rem;
          font-size: 0.625rem; 
          font-weight: 700;
          letter-spacing: 0.1em; 
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .pm-tag-live { 
          background: ${C.red500}; 
          color: white; 
        }

        .pm-tag-fin { 
          background: ${C.steel400}; 
          color: white; 
        }

        .pm-tag-done { 
          background: ${C.gold400}; 
          color: ${C.ink900}; 
        }

        .pm-tag-dot {
          width: 5px; 
          height: 5px; 
          border-radius: 50%;
          background: currentColor;
        }

        .pm-tag-dot.pulse { 
          animation: pm-pulse 1.2s ease-in-out infinite; 
        }

        /* Board */
        .pm-board {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: stretch;
          min-height: 100px;
        }

        @media (max-width: 600px) {
          .pm-board { 
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        .pm-side-team {
          display: flex; 
          align-items: center; 
          gap: 1rem;
          padding: 1.25rem;
        }

        .pm-side-team.left {
          background: linear-gradient(90deg, white 0%, ${C.cream50} 100%);
        }

        .pm-side-team.right {
          flex-direction: row-reverse;
          text-align: right;
          background: linear-gradient(270deg, white 0%, ${C.cream50} 100%);
        }

        @media (max-width: 600px) {
          .pm-side-team {
            padding: 1rem;
          }

          .pm-side-team.right {
            flex-direction: row;
            text-align: left;
            border-top: 1px dashed ${C.cream200};
          }

          .pm-side-team.left {
            border-bottom: 1px dashed ${C.cream200};
          }
        }

        .pm-flag-lg {
          width: 48px; 
          height: 34px;
          object-fit: cover; 
          border-radius: 4px;
          box-shadow: 
            0 0 0 1px rgba(0,0,0,.08), 
            0 2px 6px rgba(0,0,0,.1);
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .pm-flag-lg {
            width: 40px;
            height: 28px;
          }
        }

        .pm-team-block { 
          min-width: 0; 
          flex: 1;
        }

        .pm-team-code {
          font-size: 0.6875rem; 
          font-weight: 700;
          letter-spacing: 0.12em;
          color: ${C.gold600}; 
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .pm-team-nm {
          font-size: 1.125rem; 
          font-weight: 700;
          letter-spacing: 0.01em;
          color: ${C.ink800}; 
          line-height: 1.1;
        }

        @media (max-width: 600px) {
          .pm-team-nm {
            font-size: 1rem;
          }
        }

        /* Center */
        .pm-center {
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: ${C.ink800};
          position: relative;
        }

        @media (min-width: 601px) {
          .pm-center::before, 
          .pm-center::after {
            content: '';
            position: absolute; 
            top: 50%; 
            transform: translateY(-50%);
            width: 0; 
            height: 0;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
          }

          .pm-center::before { 
            left: -1px; 
            border-right: 12px solid white;
          }

          .pm-center::after { 
            right: -1px; 
            border-left: 12px solid white;
          }
        }

.pm-input {
  width: 52px;
  height: 52px;
  font-size: 1.75rem;
          text-align: center;
          font-weight: 800;
          background: ${C.cream50};
          color: ${C.ink900};
          border: 2px solid ${C.gold500};
          border-radius: 8px;
          outline: none;
          transition: all .2s;
          -moz-appearance: textfield;
          font-variant-numeric: tabular-nums;
        }

        .pm-input::-webkit-outer-spin-button,
        .pm-input::-webkit-inner-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }

        .pm-input::placeholder { 
          color: ${C.steel400}; 
          opacity: .4; 
        }

        .pm-input:focus:not(:disabled) {
          border-color: ${C.gold400};
          background: white;
          box-shadow: 0 0 0 4px rgba(212,160,23,.2);
          transform: scale(1.05);
        }

        .pm-input:disabled {
          background: ${C.cream200};
          color: ${C.steel400};
          border-color: ${C.cream200};
          cursor: not-allowed;
        }

        .pm-input.error {
          border-color: ${C.red500};
          animation: pm-shake .4s;
        }

@media (max-width: 600px) {
  .pm-input {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
}

        .pm-dash {
          font-size: 2rem;
          font-weight: 800;
          color: ${C.gold400};
        }

        /* Extra */
        .pm-extra {
          padding: 1rem 1.25rem;
          background: ${C.cream50};
          border-top: 1px dashed ${C.cream200};
        }

        .pm-clasif-label {
          display: flex; 
          align-items: center; 
          gap: 0.5rem;
          font-size: 0.6875rem; 
          font-weight: 700;
          letter-spacing: 0.1em; 
          text-transform: uppercase;
          color: ${C.gold600};
          margin-bottom: 0.75rem;
        }

        .pm-clasif-row {
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 0.625rem;
        }

        .pm-radio {
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.8125rem; 
          font-weight: 600;
          cursor: pointer; 
          transition: all .18s;
          border: 1.5px solid ${C.cream200};
          background: white;
          color: ${C.ink700};
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .pm-radio:hover:not(:disabled) {
          border-color: ${C.gold500};
          background: ${C.cream50};
        }

        .pm-radio.active {
          background: ${C.ink800};
          border-color: ${C.gold500};
          color: ${C.gold400};
          box-shadow: 0 0 0 3px rgba(212,160,23,.15);
        }

        .pm-radio:disabled { 
          cursor: not-allowed; 
          opacity: .5; 
        }

        .pm-warn {
          margin-top: 0.625rem;
          font-size: 0.75rem; 
          color: ${C.red500};
          display: flex; 
          align-items: center; 
          gap: 0.375rem;
          font-weight: 600;
        }

        .pm-auto {
          display: flex; 
          align-items: center; 
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 6px;
          border: 1.5px solid ${C.cream200};
        }

        .pm-auto-arrow { 
          color: ${C.gold500}; 
          font-size: 1rem;
        }

        .pm-auto-lab {
          color: ${C.steel400}; 
          text-transform: uppercase;
          letter-spacing: 0.08em; 
          font-weight: 600; 
          font-size: 0.6875rem;
        }

        .pm-auto-team {
          font-size: 0.9375rem; 
          font-weight: 700;
          color: ${C.ink800}; 
          text-transform: uppercase;
          display: inline-flex; 
          align-items: center; 
          gap: 0.5rem;
        }

        .pm-result {
          display: flex; 
          align-items: center; 
          gap: 0.875rem;
          padding: 0.75rem 1rem;
          background: ${C.ink800};
          border-radius: 6px;
          color: white;
        }

        .pm-result-lab {
          font-size: 0.6875rem; 
          letter-spacing: 0.1em;
          color: ${C.gold400}; 
          text-transform: uppercase;
          font-weight: 700;
        }

        .pm-result-sc {
          font-size: 1.25rem; 
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .pm-result-pen { 
          color: ${C.steel400}; 
          font-size: 0.75rem; 
          margin-left: auto; 
        }

        /* ─── FOOTER ─── */
        .pm-foot {
          padding: 1.125rem 1.5rem;
          background: ${C.ink800};
          color: white;
          border-top: 3px solid ${C.gold500};
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.25rem;
          align-items: center;
          flex-shrink: 0;
        }

        @media (max-width: 700px) {
          .pm-foot { 
            grid-template-columns: 1fr; 
            padding: 1rem; 
          }
        }

        .pm-progress-wrap { 
          min-width: 0; 
        }

        .pm-progress-row {
          display: flex; 
          align-items: baseline; 
          justify-content: space-between;
          font-size: 0.6875rem; 
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .pm-progress-lab { 
          color: ${C.steel400}; 
          font-weight: 700; 
        }

        .pm-progress-cn { 
          color: white; 
          font-weight: 600;
        }

        .pm-progress-cn strong {
          color: ${C.gold400};
          font-size: 1.125rem; 
          margin-right: 0.25rem;
          font-weight: 800;
        }

        .pm-progress-bar {
          height: 6px;
          background: rgba(255,255,255,.1);
          border-radius: 999px; 
          overflow: hidden;
        }

        .pm-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${C.gold500}, ${C.gold400}, ${C.gold500});
          background-size: 200% 100%;
          border-radius: 999px;
          transition: width .4s cubic-bezier(.2,.8,.2,1);
          animation: pm-shimmer 2.5s linear infinite;
        }

        .pm-actions { 
          display: flex; 
          gap: 0.625rem; 
          justify-content: flex-end; 
        }

        @media (max-width: 700px) {
          .pm-actions {
            justify-content: stretch;
          }

          .pm-actions .pm-btn {
            flex: 1;
          }
        }

        .pm-btn {
          font-size: 0.875rem; 
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 0.875rem 1.625rem;
          border-radius: 6px;
          cursor: pointer; 
          transition: all .2s;
          text-transform: uppercase;
          display: inline-flex; 
          align-items: center; 
          justify-content: center;
          gap: 0.5rem;
          border: none;
          white-space: nowrap;
        }

        .pm-btn-cancel {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,.2);
          color: ${C.steel400};
        }

        .pm-btn-cancel:hover { 
          border-color: white; 
          color: white; 
        }

        .pm-btn-submit {
          background: linear-gradient(135deg, ${C.gold500}, ${C.gold400});
          color: ${C.ink900};
          box-shadow: 0 4px 14px rgba(212,160,23,.35);
          border: 1.5px solid transparent;
        }

        .pm-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212,160,23,.5);
        }

        .pm-btn-submit:disabled { 
          opacity: .45; 
          cursor: not-allowed; 
          box-shadow: none; 
        }

        .pm-spin {
          width: 14px; 
          height: 14px;
          border: 2px solid rgba(10,18,38,.25);
          border-top-color: ${C.ink900};
          border-radius: 50%;
          animation: pm-spin .65s linear infinite;
        }

        .pm-foot-note {
          grid-column: 1 / -1;
          font-size: 0.75rem; 
          color: ${C.steel400};
          text-align: center; 
          letter-spacing: 0.02em;
          margin-top: 0.25rem;
        }

        .pm-foot-note.warn { 
          color: #ffb0bd; 
        }
      `}</style>

      <div className="pm-overlay" onClick={onClose}>
        <form className="pm-shell" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>

          {/* ═══════════════ SIDEBAR (desktop) ═══════════════ */}
          <aside className="pm-side">
            <div className="pm-side-head">
              <div className="pm-side-eyebrow">Predicciones · Mundial 2026</div>
              <h2 className="pm-side-title">{bet.titulo}</h2>
            </div>

            <div className="pm-stats">
              <div className="pm-stat">
                <div className="pm-stat-num">{filledCount}</div>
                <div className="pm-stat-lab">Cargadas</div>
              </div>
              <div className="pm-stat">
                <div className={`pm-stat-num ${pendingCount === 0 ? '' : 'dim'}`}>{pendingCount}</div>
                <div className="pm-stat-lab">Pendientes</div>
              </div>
            </div>

            <div className="pm-side-status">
              {open ? (
                <span className={`pm-side-pill ${isClosingSoon ? 'pm-pill-soon' : 'pm-pill-open'}`}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                  {remaining}
                </span>
              ) : (
                <span className="pm-side-pill pm-pill-closed">Cerrada</span>
              )}
              <div className="pm-side-status-detail">
                {open
                  ? hadPredictions
                    ? 'Revisá o ajustá tus predicciones antes del cierre.'
                    : 'Cargá el resultado de cada partido. Podés editar mientras esté abierta.'
                  : 'Modo solo lectura — la apuesta ya cerró.'}
              </div>
            </div>

            <nav className="pm-nav">
              <div className="pm-nav-title">Partidos ({totalMatches})</div>
              {bet.partidos?.map((m, idx) => {
                const done = predicionCompleta(m)
                const live = m.estado === 'en_vivo'
                const isActive = idx === activeMatchIdx
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`pm-nav-item ${done ? 'done' : ''} ${live ? 'live' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => scrollToMatch(m.id, idx)}
                  >
                    <span className="pm-nav-num">{idx + 1}</span>
                    <span className="pm-nav-teams">
                      {m.codigo_local || m.equipo_local} · {m.codigo_visitante || m.equipo_visitante}
                    </span>
                    <span className="pm-nav-dot" />
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* ═══════════════ MAIN ═══════════════ */}
          <div className="pm-main">

            {/* Top bar */}
            <header className="pm-topbar">
              <div className="pm-topbar-info">
                <div className="pm-topbar-eyebrow">Centro de Predicciones</div>
                <h2 className="pm-topbar-title">{bet.titulo}</h2>
              </div>
              <div className="pm-topbar-actions">
                {open && (
                  <span className={`pm-side-pill pm-mobile-status ${isClosingSoon ? 'pm-pill-soon' : 'pm-pill-open'}`}>
                    {remaining}
                  </span>
                )}
                <button
                  type="button"
                  className="pm-icon-btn"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Mobile quick nav */}
            <div className="pm-quick-nav" ref={navRef}>
              <div className="pm-quick-row">
                {bet.partidos?.map((m, idx) => {
                  const done = predicionCompleta(m)
                  const live = m.estado === 'en_vivo'
                  const isActive = idx === activeMatchIdx
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`pm-quick-pill ${done ? 'done' : ''} ${live ? 'live' : ''} ${isActive ? 'active' : ''}`}
                      onClick={() => scrollToMatch(m.id, idx)}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Match list */}
            <div className="pm-list" ref={listRef}>

              {razonBloqueo && (
                <div className="pm-block">
                  <div className="pm-block-icon">!</div>
                  <div className="pm-block-content">
                    <div className="pm-block-title">{razonBloqueo.titulo}</div>
                    <div className="pm-block-detail">{razonBloqueo.detalle}</div>
                  </div>
                </div>
              )}

              {totalMatches === 0 && (
                <div className="pm-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <h3>No hay partidos disponibles</h3>
                  <p>Esta apuesta aún no tiene fixture cargado</p>
                </div>
              )}

              {bet.partidos?.map((match, idx) => {
                const isLive     = match.estado === 'en_vivo'
                const isFinished = match.estado === 'finalizado'
                const isDisabled = !open || isLive || isFinished || estaBloqueado
                const sc         = scores[match.id] || { local: '', visitante: '' }
                const hasScore   = sc.local !== '' && sc.visitante !== ''
                const elim       = esEliminatoria(match.fase)
                const pl         = sc.local !== '' ? parseInt(sc.local, 10) : null
                const pv         = sc.visitante !== '' ? parseInt(sc.visitante, 10) : null
                const empate     = hasScore && pl === pv
                const clasifElegido = clasificados[match.id] || ''
                const completo   = predicionCompleta(match)

                const cardClass = [
                  'pm-card',
                  completo && !isLive && !isFinished ? 'done' : '',
                  isLive ? 'live' : '',
                ].filter(Boolean).join(' ')

                return (
                  <div
                    key={match.id}
                    ref={el => { matchRefs.current[match.id] = el }}
                    data-match-id={match.id}
                    className={cardClass}
                  >
                    {/* Strip */}
                    <div className="pm-strip">
                      <div className="pm-strip-left">
                        <span className="pm-strip-num">{String(idx + 1).padStart(2, '0')}</span>
                        <span>Partido</span>
                        {elim && <span className="pm-strip-fase">· Eliminación</span>}
                      </div>
                      <div className="pm-strip-right">
                        {isLive && (
                          <span className="pm-tag pm-tag-live">
                            <span className="pm-tag-dot pulse" /> LIVE
                          </span>
                        )}
                        {isFinished && <span className="pm-tag pm-tag-fin">FT</span>}
                        {!isLive && !isFinished && completo && (
                          <span className="pm-tag pm-tag-done">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Lista
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Board */}
                    <div className="pm-board">
                      <div className="pm-side-team left">
                        {match.bandera_local && (
                          <img src={match.bandera_local} alt="" className="pm-flag-lg" />
                        )}
                        <div className="pm-team-block">
                          {match.codigo_local && <div className="pm-team-code">{match.codigo_local}</div>}
                          <div className="pm-team-nm">{match.equipo_local}</div>
                        </div>
                      </div>

                      <div className="pm-center">
                        <input
                          type="text" 
                          inputMode="numeric" 
                          maxLength={2}
                          value={sc.local}
                          onChange={e => updateScore(match.id, 'local', e.target.value)}
                          placeholder="—"
                          disabled={isDisabled}
                          aria-label={`Goles ${match.equipo_local}`}
                          className="pm-input"
                        />
                        <span className="pm-dash">:</span>
                        <input
                          type="text" 
                          inputMode="numeric" 
                          maxLength={2}
                          value={sc.visitante}
                          onChange={e => updateScore(match.id, 'visitante', e.target.value)}
                          placeholder="—"
                          disabled={isDisabled}
                          aria-label={`Goles ${match.equipo_visitante}`}
                          className="pm-input"
                        />
                      </div>

                      <div className="pm-side-team right">
                        {match.bandera_visitante && (
                          <img src={match.bandera_visitante} alt="" className="pm-flag-lg" />
                        )}
                        <div className="pm-team-block">
                          {match.codigo_visitante && <div className="pm-team-code">{match.codigo_visitante}</div>}
                          <div className="pm-team-nm">{match.equipo_visitante}</div>
                        </div>
                      </div>
                    </div>

                    {/* Extra: clasificado / auto / resultado */}
                    {elim && empate && (
                      <div className="pm-extra">
                        <div className="pm-clasif-label">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          ¿Quién pasa por penales?
                        </div>
                        <div className="pm-clasif-row">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => updateClasificado(match.id, match.codigo_local)}
                            className={`pm-radio ${clasifElegido === match.codigo_local ? 'active' : ''}`}
                          >
                            {match.bandera_local && (
                              <img 
                                src={match.bandera_local} 
                                alt="" 
                                style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} 
                              />
                            )}
                            {match.equipo_local}
                          </button>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => updateClasificado(match.id, match.codigo_visitante)}
                            className={`pm-radio ${clasifElegido === match.codigo_visitante ? 'active' : ''}`}
                          >
                            {match.bandera_visitante && (
                              <img 
                                src={match.bandera_visitante} 
                                alt="" 
                                style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} 
                              />
                            )}
                            {match.equipo_visitante}
                          </button>
                        </div>
                        {!clasifElegido && (
                          <div className="pm-warn">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="9" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Tenés que elegir quién pasa
                          </div>
                        )}
                      </div>
                    )}

                    {elim && hasScore && !empate && (
                      <div className="pm-extra">
                        <div className="pm-auto">
                          <span className="pm-auto-arrow">▸</span>
                          <span className="pm-auto-lab">Pasa según tu marcador:</span>
                          <span className="pm-auto-team">
                            {(() => {
                              const ganador = pl > pv
                                ? { nombre: match.equipo_local, bandera: match.bandera_local }
                                : { nombre: match.equipo_visitante, bandera: match.bandera_visitante }
                              return (
                                <>
                                  {ganador.bandera && (
                                    <img 
                                      src={ganador.bandera} 
                                      alt="" 
                                      style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} 
                                    />
                                  )}
                                  {ganador.nombre}
                                </>
                              )
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                    {(isLive || isFinished) && (match.goles_local != null || match.goles_visitante != null) && (
                      <div className="pm-extra">
                        <div className="pm-result">
                          <span className="pm-result-lab">{isLive ? 'En vivo' : 'Resultado'}</span>
                          <span className="pm-result-sc">
                            {match.goles_local ?? 0} - {match.goles_visitante ?? 0}
                          </span>
                          {match.penales_local != null && match.penales_local !== '' &&
                            match.penales_visit != null && match.penales_visit !== '' && (
                              <span className="pm-result-pen">
                                (pen {match.penales_local}-{match.penales_visit})
                              </span>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <footer className="pm-foot">
              <div className="pm-progress-wrap">
                {open && (
                  <>
                    <div className="pm-progress-row">
                      <span className="pm-progress-lab">Progreso</span>
                      <span className="pm-progress-cn">
                        <strong>{filledCount}</strong>/ {totalMatches}
                      </span>
                    </div>
                    <div className="pm-progress-bar">
                      <div className="pm-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </>
                )}
              </div>

              <div className="pm-actions">
                <button type="button" className="pm-btn pm-btn-cancel" onClick={onClose}>
                  Cancelar
                </button>
                {open && !estaBloqueado && (
                  <button
                    type="submit"
                    className="pm-btn pm-btn-submit"
                    disabled={loading || filledCount === 0}
                  >
                    {loading ? (
                      <>
                        <span className="pm-spin" />
                        Guardando
                      </>
                    ) : hadPredictions ? 'Actualizar' : 'Guardar'}
                  </button>
                )}
              </div>

              {open && !estaBloqueado && (
                <div className="pm-foot-note">
                  Podés editar tus predicciones mientras la apuesta siga abierta
                </div>
              )}
              {open && estaBloqueado && (
                <div className="pm-foot-note warn">
                  Modo solo lectura · No podés modificar predicciones
                </div>
              )}
            </footer>
          </div>
        </form>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}