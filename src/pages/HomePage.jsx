import { Link } from 'react-router-dom'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] overflow-x-hidden">

      <nav
        className="sticky top-0 z-50 border-b border-[var(--color-border)] w-full"
        style={{ background: 'rgba(2,15,39,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-full max-w-[1400px] mx-auto pl-6 pr-8 md:pl-10 md:pr-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[var(--color-text-muted)] text-[10px] tracking-widest font-body whitespace-nowrap">
              LOGO EMPRESA
            </div>
            <div className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />
            <div className="font-display text-lg md:text-xl text-[var(--color-accent)] tracking-wider whitespace-nowrap">
              PRODE<span className="text-[var(--color-text)]">ONE</span>
            </div>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 text-[var(--color-accent)] border border-[var(--color-accent)]/40 rounded-lg text-sm font-body font-semibold hover:bg-[var(--color-accent-soft)] whitespace-nowrap"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(' + HERO_IMAGE + ')' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,15,39,0.55) 0%, rgba(2,15,39,0.8) 60%, #020F27 100%)' }} />
        <div className="relative z-10 px-6 md:px-12 py-24 md:py-32 flex items-center justify-center min-h-[600px]">
          <div className="max-w-3xl text-center animate-fade-in w-full">
            <span
              className="inline-block px-7 py-2 rounded-full text-sm font-body font-bold mb-8"
              style={{ background: '#F4B42A', color: '#020F27', boxShadow: '0 4px 20px rgba(244,180,42,0.35)' }}
            >
              MUNDIAL 2026 · ARRANCA EN JUNIO
            </span>
            <h1
              className="font-display text-5xl md:text-7xl text-white mb-6 leading-[0.95]"
              style={{ textShadow: '0 4px 32px rgba(0,0,0,0.8)' }}
            >
              EL MUNDIAL<br />SE VIVE <span className="text-[var(--color-accent)]">ACÁ</span>
            </h1>
            <p
              className="text-base md:text-xl font-body mb-10 max-w-xl mx-auto"
              style={{ color: '#E0E8F5', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              El prode interno de <span className="font-semibold text-white">tu empresa</span>.
              Pronosticá, sumá puntos, ganá premios reales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto sm:min-w-[220px] text-center bg-[var(--color-accent)] font-body font-bold px-8 py-4 rounded-xl text-base md:text-lg hover:bg-[var(--color-accent-bright)] transition-all"
                style={{ color: '#020F27', boxShadow: '0 6px 24px rgba(34,217,223,0.4)' }}
              >
                Crear mi cuenta
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto sm:min-w-[220px] text-center text-white border-2 border-white/30 bg-white/5 px-8 py-4 rounded-xl text-base md:text-lg font-body font-semibold hover:bg-white/15 transition-all"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--color-accent)] text-xs uppercase tracking-widest font-body font-bold mb-3">
              Cómo funciona
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-white">3 PASOS Y ESTÁS JUGANDO</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-accent)]"
                style={{ background: 'rgba(34,217,223,0.12)', border: '1px solid rgba(34,217,223,0.3)' }}>
                1
              </div>
              <h3 className="font-display text-2xl text-white mb-3">REGISTRATE</h3>
              <p className="text-[var(--color-text-muted)] text-sm font-body leading-relaxed">
                Con tu email de la empresa. RRHH te aprueba en minutos.
              </p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-accent)]"
                style={{ background: 'rgba(34,217,223,0.12)', border: '1px solid rgba(34,217,223,0.3)' }}>
                2
              </div>
              <h3 className="font-display text-2xl text-white mb-3">PRONOSTICÁ</h3>
              <p className="text-[var(--color-text-muted)] text-sm font-body leading-relaxed">
                Cargá el resultado de cada partido antes de que arranque.
              </p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-warn)]"
                style={{ background: 'rgba(244,180,42,0.12)', border: '1px solid rgba(244,180,42,0.3)' }}>
                3
              </div>
              <h3 className="font-display text-2xl text-white mb-3">GANÁ</h3>
              <p className="text-[var(--color-text-muted)] text-sm font-body leading-relaxed">
                Sumá puntos por aciertos. El ranking final se lleva el premio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(244,180,42,0.1), rgba(11,74,110,0.15))',
              border: '1px solid rgba(244,180,42,0.3)'
            }}
          >
            <div
              className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(244,180,42,0.15)' }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[var(--color-warn)] text-xs font-body font-bold uppercase tracking-widest mb-2">
                Premio del torneo
              </p>
              <h3 className="font-display text-2xl md:text-3xl text-white mb-2">
                DEFINIDO POR TU EMPRESA
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm md:text-base font-body">
                Cada organización define su propio incentivo para el primer puesto del ranking
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--color-text-faint)] text-xs md:text-sm font-body text-center sm:text-left">
            Prode One · Plataforma de <span className="text-[var(--color-text-muted)]">Escencial Consultora</span>
          </p>
          <p className="text-[var(--color-text-faint)] text-xs font-body text-center sm:text-right">
            Juego responsable · Solo mayores de 18 años
          </p>
        </div>
      </footer>

    </div>
  )
}