import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BetsPage from './pages/BetsPage.jsx'
import PartidosPage from './pages/PartidosPage.jsx'
import MisPrediccionesPage from './pages/MisPrediccionesPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import RankingPage from './pages/RankingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

import DashboardPage       from './dashboard/DashboardPage.jsx'
import BetsPage            from './dashboard/BetsPage.jsx'
import PartidosPage        from './dashboard/FixturePage.jsx'
import MisPrediccionesPage from './dashboard/MisPredesPage.jsx'
import RankingPage         from './dashboard/RankingPage.jsx'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Raíz: home pública siempre */}
          <Route path="/" element={<HomePage />} />

{/* Usuario autenticado */}
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/apuestas" element={<BetsPage />} />
  <Route path="/partidos" element={<PartidosPage />} />
  <Route path="/mis-predicciones" element={<MisPrediccionesPage />} />
  <Route path="/ranking" element={<RankingPage />} />
</Route>

{/* Solo admin */}
<Route element={<ProtectedRoute requireAdmin />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}