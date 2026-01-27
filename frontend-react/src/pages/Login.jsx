import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
                window.location.href = '/dashboard';
            } else {
                await Api.register({ nombre, email, password });
                alert('Registro completado. Ahora puedes iniciar sesión.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message || 'Error en la operación');
        }
    };

    return (
        <div className="login-container" style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="glass-panel login-card" style={{
                padding: '3rem',
                width: '90%',
                maxWidth: '450px',
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>
                    {isLogin ? 'Bienestar' : 'Registro'}
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    {isLogin ? 'Gestión Profesional de Fauna' : 'Únete al equipo de cuidadores'}
                </p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Nombre Completo</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Correo Institucional</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-danger" style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {isLogin ? 'Acceder al Portal' : 'Finalizar Registro'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {isLogin ? (
                        <>¿Solicitar acceso? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Crear cuenta nueva</a></>
                    ) : (
                        <>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión aquí</a></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
