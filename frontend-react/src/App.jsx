import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import Evaluation from './pages/Evaluation'
import EvaluationHistory from './pages/EvaluationHistory'
import Graphs from './pages/Graphs'
import Guides from './pages/Guides'

const PrivateRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#38bdf8',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                marginBottom: '1rem',
                animation: 'spin 1s linear infinite'
            }}></div>
            <span>Estableciendo Conexión Segura...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Private Routes wrapped in ErrorBoundary for maximum stability */}
                    <Route element={<ErrorBoundary><PrivateRoute /></ErrorBoundary>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/animals" element={<Animals />} />
                        <Route path="/auditoria" element={<EvaluationHistory />} />
                        <Route path="/auditoria/protocolo" element={<Evaluation />} />
                        <Route path="/inteligencia" element={<Graphs />} />
                        <Route path="/guias" element={<Guides />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App;


