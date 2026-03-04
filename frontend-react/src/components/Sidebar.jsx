import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, PawPrint, ClipboardCheck, BarChart3, Lock, Download, FileText } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

const Sidebar = () => {
    const location = useLocation()
    const { logout } = useAuth()
    const { installable, isIOS, isStandalone, install } = usePWA()

    const handleInstallClick = () => {
        install();
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/animals', label: 'Fauna', icon: <PawPrint size={20} /> },
        { path: '/auditoria', label: 'Auditoría', icon: <ClipboardCheck size={20} /> },
        { path: '/inteligencia', label: 'Inteligencia', icon: <BarChart3 size={20} /> },

    ]

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <span style={{ color: 'var(--primary)' }}>Q</span>uantum
            </div>

            {(installable || isIOS) && (
                <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={handleInstallClick}
                        className="btn"
                        style={{
                            width: '100%',
                            fontSize: '0.8rem',
                            padding: '0.6rem',
                            background: 'var(--primary)',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <Download size={16} /> Descargar App
                    </button>
                </div>
            )}

            <ul className="nav-links">
                {navLinks.map((link) => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={location.pathname === link.path ? 'active' : ''}
                        >
                            <span>{link.icon}</span> {link.label}
                        </Link>
                    </li>
                ))}
                <li style={{ marginTop: 'auto' }}>
                    <a href="#" id="logoutBtn" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: 'var(--danger)' }}>
                        <span><Lock size={20} /></span> Desconexión
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Sidebar
