import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    background: '#1e293b', /* Slightly lighter background than base-dark */
                    color: '#f8fafc',
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 style={{ color: '#38bdf8', marginBottom: '1rem', fontSize: '1.5rem' }}>Sincronización Interrumpida</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Ocurrió un error inesperado en la interfaz técnica.</p>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        maxWidth: '90%',
                        marginBottom: '2rem',
                        color: '#ef4444',
                        fontFamily: 'monospace',
                        wordBreak: 'break-word',
                        textAlign: 'left'
                    }}>
                        <strong>Error Técnico:</strong><br />
                        {this.state.error && this.state.error.toString()}
                    </div>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        style={{
                            padding: '1rem 2rem',
                            background: '#38bdf8',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
                        }}
                    >
                        Reestablecer Conexión
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
