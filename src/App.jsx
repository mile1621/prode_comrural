import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BetsPage from './pages/BetsPage.jsx'
import PartidosPage from './pages/PartidosPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import RankingPage from './pages/RankingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Raíz: home pública siempre */}
          <Route path="/" element={<HomePage />} />

          {/* Usuario autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/apuestas" element={<BetsPage />} />
            <Route path="/partidos" element={<PartidosPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/ranking" element={<RankingPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}