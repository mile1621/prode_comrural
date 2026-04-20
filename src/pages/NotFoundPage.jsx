import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)] text-center">
      <p className="font-display text-[10rem] leading-none text-[var(--color-surface)] select-none">
        404
      </p>
      <h1 className="font-display text-3xl text-[var(--color-text)] -mt-4 mb-2">
        Página no encontrada
      </h1>
      <p className="text-[var(--color-text-muted)] font-body mb-8">
        La ruta que buscás no existe o fue movida.
      </p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
