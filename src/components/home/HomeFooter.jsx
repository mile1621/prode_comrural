import { Link } from 'react-router-dom'

export default function HomeFooter() {
  return (
    <footer style={{ background: '#05090f', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10"
          style={{ borderBottom: '1px solid rgba(235,195,43,.15)' }}>

          {/* Col 1: Brand */}
          <div>
            <img
              src="./imgprode/one-prode-talento-new3.png"
              alt="Prode Talento"
              style={{ height: 52, width: 'auto', marginBottom: '1rem', opacity: .92, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.4))' }}
            />
            <p className="font-body text-sm leading-relaxed mb-5"
              style={{ color: 'rgba(255,255,255,.5)', maxWidth: '22rem' }}>
              Consultora especializada en Recursos Humanos. Clima laboral, evaluación de personas y cultura organizacional.
            </p>
            <span className="inline-flex items-center gap-2 font-body font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ fontSize: '.68rem', border: '1px solid #ebc32b', color: '#ebc32b', background: 'rgba(235,195,43,.1)' }}>
              Prode Talento · Mundial 2026
            </span>
          </div>

          {/* Col 2: Prode 2026 */}
          <div>
            <p className="font-body font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: '#ebc32b', letterSpacing: '.18em' }}>
              Prode 2026
            </p>
            <ul className="space-y-2.5">
              {[
                ['#como-funciona', 'Cómo funciona'],
                ['#funcionalidades', 'Funcionalidades'],
                ['#faq', 'Preguntas frecuentes'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href}
                    className="font-body text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/login"
                  className="font-body text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}>
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/register"
                  className="font-body text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}>
                  Crear mi cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacto */}
          <div>
            <p className="font-body font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: '#ebc32b', letterSpacing: '.18em' }}>
              Contacto
            </p>
            <ul className="space-y-2.5">
              {[
                ['mailto:mferreyra@escencialconsult.com.ar', 'mferreyra@escencialconsult.com.ar'],
                ['https://wa.me/5491133588062', '+54 9 11 3358-8062'],
                ['https://escencialconsultora.com.ar', 'escencialconsultora.com.ar'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="font-body text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ebc32b' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider dorado — igual que rule-on-dark */}
        <div className="my-5" style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(235,195,43,.35) 20%,rgba(235,195,43,.35) 80%,transparent)' }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>
            © 2026 Escencial Consultora. Todos los derechos reservados.
          </span>
          <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>
            Términos · Juego Responsable
          </span>
        </div>
      </div>
    </footer>
  )
}