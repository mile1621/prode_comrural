/**
 * RankingWrapper.jsx
 * Detecta si es admin o user y muestra el ranking correcto
 */
import { useAuth } from '../hooks/useAuth.jsx'
import RankingPageAdmin from './RankingPageAdmin.jsx'
import RankingPageUser from './RankingPageUser.jsx'

export default function RankingWrapper() {
  const { user } = useAuth()
  
  if (!user) return null
  
  console.log('User completo:', user) // Para debug
  
  // Probá con estos campos (ajusta según tu estructura real)
  const isAdmin = 
    user.es_admin === true || 
    user.es_admin === 'true' || 
    user.tipo_usuario === 'admin' || 
    user.isAdmin === true || 
    user.role === 'admin'
  
  console.log('Is Admin:', isAdmin)
  
  return isAdmin ? <RankingPageAdmin /> : <RankingPageUser />
}