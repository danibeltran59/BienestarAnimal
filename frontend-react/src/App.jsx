import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import Evaluation from './pages/Evaluation'
import Graphs from './pages/Graphs'

const PrivateRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const Dashboard = () => (
    <Layout>
        <header className="content-header">
            <div>
                <h1>Inteligencia de Bienestar</h1>
                <p style={{ color: 'var(--text-muted)' }}>Sincronización en tiempo real con el Zoo</p>
            </div>
        </header>
        <div className="dashboard-grid">
            <div className="glass-panel stat-card">
                <div className="stat-value">--</div>
                <div className="stat-label">Stock de Fauna</div>
            </div>
            <div className="glass-panel stat-card">
                <div className="stat-value">--</div>
                <div className="stat-label">Registros Históricos</div>
            </div>
        </div>
    </Layout>
)

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Private Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/animals" element={<Layout><h1>Censo Operativo</h1></Layout>} />
                        <Route path="/auditoria" element={<Layout><h1>Auditoría de Bienestar</h1></Layout>} />
                        <Route path="/inteligencia" element={<Layout><h1>Inteligencia de Datos</h1></Layout>} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App


