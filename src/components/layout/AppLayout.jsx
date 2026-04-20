import Navbar from './Navbar.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-text-faint)] font-body">
        Prode One © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
