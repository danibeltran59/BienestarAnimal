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
        <div className="login-page">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <h1>{isLogin ? 'Quantum' : 'Registro'}</h1>
                    <p>{isLogin ? 'Gestión Profesional de Fauna' : 'Únete al equipo de cuidadores'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
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
                        <div className="text-danger login-error">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary login-submit">
                        {isLogin ? 'Acceder al Portal' : 'Finalizar Registro'}
                    </button>
                </form>

                <div className="login-footer">
                    {isLogin ? (
                        <p>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Crear cuenta nueva</a></p>
                    ) : (
                        <p>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Inicia sesión aquí</a></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
