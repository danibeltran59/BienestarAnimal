import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PawPrint, ClipboardCheck, BarChart3, Lock } from 'lucide-react'

const Sidebar = () => {
    const location = useLocation()

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
                    <a href="#" id="logoutBtn" style={{ color: 'var(--danger)' }}>
                        <span><Lock size={20} /></span> Desconexión
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Sidebar
