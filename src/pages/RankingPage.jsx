import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { useBets } from '../hooks/useBets.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { isBetOpen } from '../utils/index.js'
import sheetsApi from '../services/sheetsApi.js'

export default function RankingPage() {
    const { bets, loading: loadingBets } = useBets()
    const { isPro } = useAuth()
    const [apuestaSel, setApuestaSel] = useState(null)
    const [tabla, setTabla] = useState([])
    const [loadingTabla, setLoadingTabla] = useState(false)
    const [montado, setMontado] = useState(false)

    useEffect(() => {
        if (!loadingBets) setMontado(true)
    }, [loadingBets])

    async function cargarRanking(apuesta) {
        setApuestaSel(apuesta)
        setLoadingTabla(true)
        setTabla([])
        try {
            const resp = await sheetsApi.predicciones.tabla(apuesta.id)
            setTabla(resp.tabla || [])
        } catch (err) {
            alert('Error cargando ranking: ' + err.message)
        } finally {
            setLoadingTabla(false)
        }
    }

    function volver() {
        setApuestaSel(null)
        setTabla([])
    }

    const mostrarSkeleton = !montado || loadingBets
    const mostrarEmpty = montado && !loadingBets && bets.length === 0
    const mostrarListado = montado && !loadingBets && bets.length > 0

    return (
        <AppLayout>
            <div className="bg-brand-grad rounded-[var(--radius-lg)] p-6 mb-6 text-white shadow-md animate-fade-in">
                <h1 className="font-display text-4xl text-white">Ranking</h1>
                <p className="text-white opacity-80 font-body text-sm mt-1">
                    {apuestaSel
                        ? `Participantes de "${apuestaSel.titulo}"`
                        : 'Seleccioná una apuesta para ver su tabla de posiciones'}
                </p>
            </div>

            {!apuestaSel && (
                <>
                    {mostrarSkeleton && <ListaSkeleton />}

                    {mostrarEmpty && (
                        <Card className="py-16 px-6 text-center">
                            <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">
                                Sin apuestas activas
                            </h2>
                            <p className="text-[var(--color-text-muted)] font-body text-sm max-w-md mx-auto mb-6">
                                No hay apuestas creadas todavía. Andá al panel de administración para crear la primera.
                            </p>
                            <Link to="/admin">
                                <Button size="sm">Ir al panel admin</Button>
                            </Link>
                        </Card>
                    )}

                    {mostrarListado && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {bets.map(bet => {
                                const activa = isBetOpen(bet)
                                const estado = bet.estado === 'finalizada' ? 'Finalizada' : activa ? 'Activa' : 'Cerrada'
                                const variante = bet.estado === 'finalizada' ? 'warn' : activa ? 'accent' : 'muted'

                                return (
                                    <Card
                                        key={bet.id}
                                        className="flex items-center justify-between gap-4 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                                        onClick={() => cargarRanking(bet)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body font-semibold text-[var(--color-text)] truncate">
                                                {bet.titulo}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-muted)] font-body mt-0.5">
                                                {bet.premio}
                                                {isPro && ` · ${bet.tipo === 'grupos' ? 'Equipos' : 'Libre'}`}
                                                {bet.partidos_ids && ` · ${bet.partidos_ids.split(',').filter(Boolean).length} partidos`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                                                    Participantes
                                                </p>
                                                <p className="font-display text-2xl text-[var(--color-accent)] leading-none mt-0.5">
                                                    {bet.participantes || 0}
                                                </p>
                                            </div>
                                            <Badge variant={variante}>{estado}</Badge>
                                            <span className="text-[var(--color-text-muted)] text-lg">→</span>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {apuestaSel && (
                <div className="animate-fade-in">
                    <Button size="sm" variant="ghost" onClick={volver} className="mb-4">
                        ← Volver
                    </Button>

                    {loadingTabla ? (
                        <TablaSkeleton />
                    ) : tabla.length === 0 ? (
                        <Card className="py-16 px-6 text-center">
                            <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">
                                Sin participantes
                            </h2>
                            <p className="text-[var(--color-text-muted)] font-body text-sm max-w-md mx-auto">
                                Nadie ingresó predicciones en esta apuesta todavía.
                            </p>
                        </Card>
                    ) : (
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-sm font-body">
                                <thead className="bg-[var(--color-bg-2)]">
                                    <tr className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                                        <th className="px-4 py-3 text-left w-12">#</th>
                                        <th className="px-4 py-3 text-left">Participante</th>
                                        <th className="px-4 py-3 text-center">Pred.</th>
                                        <th className="px-4 py-3 text-center" title="Marcador exacto">Exactos</th>
                                        <th className="px-4 py-3 text-center" title="Acertó la diferencia de goles">Diferencia</th>
                                        <th className="px-4 py-3 text-center" title="Acertó solo el ganador">Resultado</th>
                                        <th className="px-4 py-3 text-right">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {tabla.map((u, i) => (
                                        <tr key={u.user_id} className="hover:bg-[var(--color-bg-2)] transition-colors">
                                            <td className="px-4 py-3 text-[var(--color-text-muted)] font-semibold">{i + 1}</td>
                                            <td className="px-4 py-3 text-[var(--color-text)] font-semibold">{u.nombre}</td>
                                            <td className="px-4 py-3 text-center text-[var(--color-text-muted)]">{u.predicciones}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[var(--color-accent)] font-semibold">{u.aciertos_exactos}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[var(--color-warn)] font-semibold">{u.aciertos_diferencia || 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-[var(--color-text-muted)]">{u.aciertos_resultado}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-display text-2xl text-[var(--color-warn)]">{u.puntos_totales}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </div>
            )}
        </AppLayout>
    )
}

function ListaSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-48 bg-[var(--color-bg-2)] rounded" />
                        <div className="h-3 w-32 bg-[var(--color-bg-2)] rounded" />
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="space-y-2 text-right">
                            <div className="h-2 w-16 bg-[var(--color-bg-2)] rounded ml-auto" />
                            <div className="h-6 w-10 bg-[var(--color-bg-2)] rounded ml-auto" />
                        </div>
                        <div className="h-6 w-16 bg-[var(--color-bg-2)] rounded-full" />
                    </div>
                </Card>
            ))}
        </div>
    )
}

function TablaSkeleton() {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="bg-[var(--color-bg-2)] px-4 py-3 flex items-center justify-between">
                <div className="h-2 w-20 bg-[var(--color-bg-3)] rounded" />
                <div className="h-2 w-20 bg-[var(--color-bg-3)] rounded" />
            </div>
            <div className="divide-y divide-[var(--color-border)]">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                        <div className="h-4 w-6 bg-[var(--color-bg-2)] rounded" />
                        <div className="h-4 flex-1 bg-[var(--color-bg-2)] rounded" />
                        <div className="h-4 w-8 bg-[var(--color-bg-2)] rounded" />
                        <div className="h-4 w-8 bg-[var(--color-bg-2)] rounded" />
                        <div className="h-6 w-12 bg-[var(--color-bg-2)] rounded" />
                    </div>
                ))}
            </div>
        </Card>
    )
}