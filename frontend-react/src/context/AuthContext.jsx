import React, { createContext, useContext, useState, useEffect } from 'react';
import { Api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('jwt_token');
        if (token) {
            // Fetch user profile from backend
            Api.getCurrentUser()
                .then(data => {
                    setUser({ token, email: data.email, role: data.role });
                })
                .catch(err => {
                    console.error('Error fetching user profile:', err);
                    sessionStorage.removeItem('jwt_token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await Api.login(email, password);
        sessionStorage.setItem('jwt_token', data.token);

        // Fetch user profile after login
        const userProfile = await Api.getCurrentUser();
        setUser({ token: data.token, email: userProfile.email, role: userProfile.role });
        return data;
    };

    const logout = () => {
        sessionStorage.removeItem('jwt_token');
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
