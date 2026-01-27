import React, { createContext, useContext, useState, useEffect } from 'react';
import { Api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            // Ideally we would fetch user profile here
            // For now, we just assume logged in if token exists
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await Api.login(email, password);
        localStorage.setItem('jwt_token', data.token);
        setUser({ token: data.token });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
