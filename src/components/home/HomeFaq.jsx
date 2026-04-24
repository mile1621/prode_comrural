import { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQS = [
  { q: '¿Cómo me registro?', a: 'Hacé clic en "Crear mi cuenta", ingresá tu nombre y email de la empresa y elegí una contraseña. Un administrador aprueba tu acceso — generalmente en minutos.' },
  { q: '¿Cómo cargo mis predicciones?', a: 'Una vez dentro, entrá a la sección "Apuestas", encontrá un partido abierto y cargá el resultado que creés que va a pasar. La apuesta cierra cuando arranca el partido.' },
  { q: '¿Cómo se calculan los puntos?', a: 'Acertar el resultado exacto suma más puntos que acertar solo quién gana. El sistema lo calcula automáticamente y actualiza el ranking después de cada partido.' },
  { q: '¿Qué es una apuesta grupal por área?', a: 'Es una dinámica donde tu puntaje individual también suma para tu sector. Toda el área compite como equipo contra las demás áreas de la empresa.' },
  { q: '¿Puedo ver mis predicciones anteriores?', a: 'Sí. En "Mis Predicciones" encontrás el historial completo de tus pronósticos, cuántos acertaste y cómo evolucionó tu puntaje durante el torneo.' },
  { q: '¿La plataforma funciona en el celular?', a: 'Sí, está optimizada para cualquier dispositivo. Solo necesitás el link y tu usuario — no hay nada que instalar.' },
]

export default function HomeFaq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative" style={{ background: '#faf7f0', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Left */}
          <div className="lg:sticky" style={{ top: '7rem' }}>
            <span className="inline-flex items-center gap-2 font-body font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ border: '1px solid #ebc32b', color: '#c99f16', background: 'rgba(235,195,43,.1)' }}>
              Ayuda
            </span>
            <h2 className="font-display mb-5" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', color: '#0c182b', lineHeight: 1, letterSpacing: '.01em' }}>
              PREGUNTAS<br />FRECUENTES
            </h2>
            <p className="font-body text-base leading-relaxed mb-8" style={{ color: '#5f6e8a', maxWidth: '26rem' }}>
              Todo lo que necesitás saber para empezar a participar y sacarle el máximo a la plataforma.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 font-body font-bold text-sm px-6 py-3.5 rounded-full transition-all"
              style={{ background: '#0c182b', color: '#fff', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#18243f'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0c182b'; e.currentTarget.style.transform = '' }}>
              Registrarme ahora
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white transition-all duration-200"
                style={{
                  border: open === i ? '1px solid #ebc32b' : '1px solid #f0eadb',
                  boxShadow: open === i ? '0 6px 20px rgba(235,195,43,.12)' : '0 1px 0 rgba(12,24,43,.03)',
                }}>
                <button
                  className="w-full flex items-start justify-between gap-4 text-left px-6 py-5"
                  onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="font-body font-semibold text-sm leading-snug"
                    style={{ color: open === i ? '#0c182b' : '#2b3a5a' }}>{q}</span>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={open === i ? { background: '#ebc32b', color: '#05090f' } : { background: '#f0eadb', color: '#5f6e8a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                      style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <div className="px-6 pb-5" style={{ borderTop: '1px solid #f0eadb' }}>
                    <p className="font-body text-sm leading-relaxed pt-4" style={{ color: '#5f6e8a' }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

{/* Wave FAQ → footer */}
<svg className="absolute bottom-0 left-0 w-full" style={{ display: 'block', height: 100, marginBottom: -2 }}
  viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1440" height="100" fill="#faf7f0" />
  <path d="M0,30 C360,100 720,0 1080,45 C1260,60 1380,35 1440,28 L1440,100 L0,100 Z" fill="#05090f" />
</svg>
    </section>
  )
}