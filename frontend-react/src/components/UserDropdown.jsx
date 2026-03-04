import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle2, RefreshCw } from 'lucide-react';

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getInitial = (email) => {
        if (!email || typeof email !== 'string') return 'U';
        return email.charAt(0).toUpperCase();
    };

    const handleSwitchAccount = () => {
        logout();
    };

    if (!user) return null;

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <button
                className="user-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                <div className="user-avatar">
                    {getInitial(user.email)}
                </div>
                <div className="user-info">
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{user.role}</span>
                </div>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="user-avatar-large">
                            {getInitial(user.email)}
                        </div>
                        <div className="user-details">
                            <div className="user-email-large">{user.email}</div>
                            <div className="user-role-badge">{user.role}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button
                        className="dropdown-item"
                        onClick={handleSwitchAccount}
                    >
                        <RefreshCw size={18} />
                        <span>Cambiar de cuenta</span>
                    </button>

                    <button
                        className="dropdown-item"
                        onClick={logout}
                    >
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
