import Navbar from './Navbar.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center font-body text-xs"
        style={{
          borderTop: '1px solid rgba(235,195,43,.1)',
          color: 'rgba(255,255,255,.22)',
        }}>
        Prode Talento © {new Date().getFullYear()} · Escencial Consultora
      </footer>
    </div>
  )
}