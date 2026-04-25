import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useBets } from '../../hooks/useBets.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { timeLeft, isBetOpen } from '../../utils/index.js'

export default function PredictModal({ bet, onSubmit, onClose, loading }) {
  const { predictions } = useBets()
  const { user } = useAuth()
  const [scores, setScores] = useState({})

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

  useEffect(() => {
    if (bet?.partidos) {
      const initial = {}
      bet.partidos.forEach(p => {
        const existingPred = predictions?.[p.id]
        initial[p.id] = {
          local: existingPred?.pred_local != null ? String(existingPred.pred_local) : '',
          visitante: existingPred?.pred_visitante != null ? String(existingPred.pred_visitante) : '',
        }
      })
      setScores(initial)
    }
  }, [bet, predictions])

  useEffect(() => {
    if (!bet) return
    function handleKeyDown(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bet, onClose])

  useEffect(() => {
    if (!bet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [bet])

  if (!bet) return null

  const open = isBetOpen(bet)
  const remaining = timeLeft(bet.fecha_cierre)
  const isClosingSoon = open && remaining !== 'Cerrada' && !remaining.includes('d')

  const totalMatches = bet.partidos?.length || 0
  const filledCount = Object.values(scores).filter(v => v.local !== '' && v.visitante !== '').length
  const hadPredictions = bet.partidos?.some(p => predictions?.[p.id]) ?? false

  function handleSubmit(e) {
    e.preventDefault()
    if (estaBloqueado) return
    const matchPredictions = Object.entries(scores).map(([partido_id, vals]) => ({
      partido_id,
      pred_local: parseInt(vals.local, 10),
      pred_visitante: parseInt(vals.visitante, 10),
    })).filter(p => !isNaN(p.pred_local) && !isNaN(p.pred_visitante))
    if (matchPredictions.length === 0) { alert('Ingresá al menos una predicción válida.'); return }
    onSubmit(bet.id, matchPredictions)
  }

  function updateScore(partidoId, side, value) {
    if (value !== '' && !/^\d{1,2}$/.test(value)) return
    setScores(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [side]: value } }))
  }

  /* ══════════════════════════════════════════════════════════
     SOLUCIÓN: React Portal a document.body
     Al renderizar el modal directamente en <body>, queda fuera
     de cualquier ancestor con transform/filter/contain que pueda
     romper el position: fixed. Esto garantiza que se centre
     correctamente respecto al VIEWPORT y no respecto a un frame.
     ══════════════════════════════════════════════════════════ */

  const modalContent = (
    <>
      <style>{`
        @keyframes pm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pm-scale { from { opacity: 0; transform: translateY(16px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes pm-slideup { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes pm-spin { to { transform: rotate(360deg) } }
        @keyframes pm-pulse { 0%,100% { opacity: 1 } 50% { opacity: .5 } }

        .pm-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(2,15,39,0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: pm-fade .2s ease both;
          overflow-y: auto;
        }
        .pm-box {
          position: relative;
          width: 100%;
          max-width: 720px;
          max-height: calc(100vh - 2rem);
          background: linear-gradient(145deg, rgba(15,43,79,0.98) 0%, rgba(15,33,69,0.98) 100%);
          border: 1px solid rgba(34,217,223,0.2);
          border-radius: 20px;
          box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(34,217,223,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: pm-scale .25s ease both;
          margin: auto;
        }
        @media (max-width: 640px) {
          .pm-overlay {
            padding: 0;
            align-items: flex-end;
          }
          .pm-box {
            max-height: 92vh;
            border-radius: 16px 16px 0 0;
            animation: pm-slideup .28s ease both;
          }
        }
      `}</style>

      <div className="pm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="predict-modal-title">
        <div className="pm-box" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(180deg, rgba(15,43,79,0.95) 0%, rgba(15,33,69,0.9) 100%)',
            borderBottom: '1px solid rgba(34,217,223,0.15)',
            flexShrink: 0,
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {open && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke={isClosingSoon ? '#f4b42a' : '#22d9df'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.15em', color: '#8499c2', fontFamily: "'DM Sans',sans-serif" }}>
                    Cierra en
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '.04em', color: isClosingSoon ? '#f4b42a' : '#22d9df' }}>
                    {remaining}
                  </span>
                </div>
              )}

              {!open && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '.15rem .5rem', borderRadius: 4,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em',
                    background: 'rgba(132,153,194,0.1)', color: '#8499c2',
                    border: '1px solid rgba(132,153,194,0.2)', fontFamily: "'DM Sans',sans-serif",
                  }}>Apuesta cerrada</span>
                </div>
              )}

              <h2 id="predict-modal-title" style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
                color: '#fff', letterSpacing: '.03em', lineHeight: 1.1, margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{bet.titulo}</h2>

              <p style={{ fontSize: '.8rem', color: '#8499c2', fontFamily: "'DM Sans',sans-serif", marginTop: 4, marginBottom: 0 }}>
                {open
                  ? hadPredictions
                    ? 'Revisá tus predicciones o ajustalas antes del cierre.'
                    : 'Ingresá el resultado exacto de cada partido.'
                  : 'Podés ver tus predicciones pero ya no se pueden editar.'}
              </p>
            </div>

            <button onClick={onClose} aria-label="Cerrar" style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(2,15,39,0.4)', border: '1px solid rgba(132,153,194,0.2)',
              color: '#8499c2', cursor: 'pointer', transition: 'all .15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,77,109,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,77,109,0.4)'
                e.currentTarget.style.color = '#ff4d6d'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(2,15,39,0.4)'
                e.currentTarget.style.borderColor = 'rgba(132,153,194,0.2)'
                e.currentTarget.style.color = '#8499c2'
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Cuerpo */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            <form onSubmit={handleSubmit} id="predict-form" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>

              {razonBloqueo && (
                <div style={{
                  borderRadius: 12, padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                  background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.4)',
                  boxShadow: '0 4px 16px rgba(255,77,109,0.08)',
                }}>
                  <div style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.4)',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#ff4d6d', fontSize: '.9rem', margin: '0 0 4px' }}>
                      {razonBloqueo.titulo}
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', color: '#8499c2', lineHeight: 1.5, margin: 0 }}>
                      {razonBloqueo.detalle}
                    </p>
                  </div>
                </div>
              )}

              {bet.partidos?.map((match, idx) => {
                const isLive     = match.estado === 'en_vivo'
                const isFinished = match.estado === 'finalizado'
                const isDisabled = !open || isLive || isFinished || estaBloqueado
                const hasPred    = scores[match.id]?.local !== '' && scores[match.id]?.visitante !== ''
                const matchState = isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : null

                return (
                  <div key={match.id} style={{
                    borderRadius: 12, padding: '1rem 1.25rem',
                    background: 'rgba(2,15,39,0.45)',
                    border: `1px solid ${isLive ? 'rgba(255,61,113,0.35)' : hasPred ? 'rgba(34,217,223,0.3)' : 'rgba(132,153,194,0.2)'}`,
                    transition: 'all .2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: '#8499c2', fontFamily: "'DM Sans',sans-serif" }}>
                        Partido {idx + 1}
                      </span>

                      {matchState && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                          padding: '.1rem .5rem', borderRadius: 4,
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em',
                          background: isLive ? 'rgba(255,61,113,0.15)' : 'rgba(244,180,42,0.1)',
                          color: isLive ? '#ff3d71' : '#f4b42a',
                          border: `1px solid ${isLive ? 'rgba(255,61,113,0.35)' : 'rgba(244,180,42,0.3)'}`,
                          fontFamily: "'DM Sans',sans-serif",
                        }}>
                          {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3d71', animation: 'pm-pulse 1.4s ease infinite' }} />}
                          {matchState}
                        </span>
                      )}

                      {!matchState && hasPred && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#22d9df', fontFamily: "'DM Sans',sans-serif" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Guardada
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto 1fr', alignItems: 'center', gap: '.6rem' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#fff', fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {match.equipo_local}
                      </span>

                      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                        value={scores[match.id]?.local ?? ''}
                        onChange={e => updateScore(match.id, 'local', e.target.value)}
                        placeholder="—" disabled={isDisabled}
                        aria-label={`Goles ${match.equipo_local}`}
                        style={{
                          width: 56, height: 56, textAlign: 'center',
                          fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem',
                          borderRadius: 8, outline: 'none',
                          background: 'rgba(15,43,79,0.8)', border: '1px solid rgba(132,153,194,0.2)', color: '#22d9df',
                          opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'text',
                          transition: 'all .15s',
                        }}
                        onFocus={e => { if (isDisabled) return; e.target.style.borderColor = '#22d9df'; e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.2)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(132,153,194,0.2)'; e.target.style.boxShadow = 'none' }}
                      />

                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.3rem', color: '#f4b42a', padding: '0 .25rem' }}>vs</span>

                      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                        value={scores[match.id]?.visitante ?? ''}
                        onChange={e => updateScore(match.id, 'visitante', e.target.value)}
                        placeholder="—" disabled={isDisabled}
                        aria-label={`Goles ${match.equipo_visitante}`}
                        style={{
                          width: 56, height: 56, textAlign: 'center',
                          fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem',
                          borderRadius: 8, outline: 'none',
                          background: 'rgba(15,43,79,0.8)', border: '1px solid rgba(132,153,194,0.2)', color: '#22d9df',
                          opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'text',
                          transition: 'all .15s',
                        }}
                        onFocus={e => { if (isDisabled) return; e.target.style.borderColor = '#22d9df'; e.target.style.boxShadow = '0 0 0 3px rgba(34,217,223,0.2)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(132,153,194,0.2)'; e.target.style.boxShadow = 'none' }}
                      />

                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#fff', fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {match.equipo_visitante}
                      </span>
                    </div>

                    {(isLive || isFinished) && (match.goles_local != null || match.goles_visitante != null) && (
                      <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid rgba(132,153,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', fontSize: '.75rem', fontFamily: "'DM Sans',sans-serif" }}>
                        <span style={{ color: '#8499c2', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 10 }}>
                          {isLive ? 'En vivo' : 'Resultado'}:
                        </span>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', letterSpacing: '.04em', color: isLive ? '#ff3d71' : '#fff' }}>
                          {match.goles_local ?? 0} - {match.goles_visitante ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

            </form>
          </div>

          {/* Footer */}
          <div style={{
            flexShrink: 0, padding: '1rem 1.25rem',
            background: 'linear-gradient(0deg, rgba(15,33,69,0.98) 0%, rgba(15,43,79,0.92) 100%)',
            borderTop: '1px solid rgba(34,217,223,0.15)',
          }}>
            {open && (
              <div style={{ marginBottom: '.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: '#8499c2', fontFamily: "'DM Sans',sans-serif" }}>
                    Progreso
                  </span>
                  <span style={{ fontSize: 12, color: '#8499c2', fontFamily: "'DM Sans',sans-serif" }}>
                    Predijiste{' '}
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: '#22d9df', letterSpacing: '.04em' }}>
                      {filledCount}
                    </span>
                    {' '}de {totalMatches} partidos
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, overflow: 'hidden', background: 'rgba(2,15,39,0.6)' }}>
                  <div style={{
                    height: '100%', transition: 'width .5s', borderRadius: 99,
                    width: totalMatches > 0 ? `${(filledCount / totalMatches) * 100}%` : '0%',
                    background: 'linear-gradient(90deg, #22d9df 0%, #7af5f8 100%)',
                    boxShadow: '0 0 12px rgba(34,217,223,0.4)',
                  }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button type="button" onClick={onClose} style={{
                padding: '.75rem 1.25rem', borderRadius: 8,
                fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14,
                background: 'transparent', border: '1px solid rgba(132,153,194,0.2)',
                color: '#8499c2', cursor: 'pointer', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,217,223,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(132,153,194,0.2)'; e.currentTarget.style.color = '#8499c2' }}>
                Cancelar
              </button>

              {open && !estaBloqueado && (
                <button type="submit" form="predict-form" disabled={loading || filledCount === 0} style={{
                  flex: 1, padding: '.75rem', borderRadius: 8,
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', border: 'none',
                  background: (loading || filledCount === 0) ? 'rgba(34,217,223,0.3)' : 'linear-gradient(135deg, #22d9df 0%, #7af5f8 100%)',
                  color: '#020F27',
                  boxShadow: (loading || filledCount === 0) ? 'none' : '0 6px 24px rgba(34,217,223,0.35)',
                  opacity: (loading || filledCount === 0) ? 0.5 : 1,
                  cursor: (loading || filledCount === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { if (!loading && filledCount > 0) { e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,217,223,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { if (!loading && filledCount > 0) { e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,217,223,0.35)'; e.currentTarget.style.transform = 'translateY(0)' } }}>
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'pm-spin .8s linear infinite' }} />
                      Guardando...
                    </>
                  ) : hadPredictions ? 'Actualizar predicciones' : 'Guardar predicciones'}
                </button>
              )}
            </div>

            {open && !estaBloqueado && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', marginTop: '.75rem', marginBottom: 0 }}>
                Podés editar tus predicciones mientras la apuesta siga abierta
              </p>
            )}

            {open && estaBloqueado && (
              <p style={{ fontSize: 10, color: '#ff4d6d', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', marginTop: '.75rem', marginBottom: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Modo solo lectura · No podés modificar predicciones
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  )

  // ★ CLAVE: renderizamos con Portal directamente en document.body
  //   Esto saca el modal de cualquier ancestor que pueda romper el fixed.
  return createPortal(modalContent, document.body)
}
