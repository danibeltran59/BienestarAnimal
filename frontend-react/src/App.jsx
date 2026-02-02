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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Private Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/animals" element={<Animals />} />
                        <Route path="/auditoria" element={<Evaluation />} />
                        <Route path="/inteligencia" element={<Graphs />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App;


