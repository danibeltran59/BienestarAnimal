import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Eye, Search } from 'lucide-react';

const EvaluationHistory = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await Api.getAllEvaluations();
                // Sort desc
                data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
                setEvaluations(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = (evaluations || []).filter(ev => {
        if (!ev) return false;
        const animalName = (ev.animalNombre || (ev.animal ? ev.animal.nombre : '') || '').toLowerCase();
        const evaluadorName = (ev.evaluador || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return animalName.includes(term) || evaluadorName.includes(term);
    });

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Historial de Auditorías</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registro acumulativo de evaluaciones de bienestar</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <UserDropdown />
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', flex: 1, minWidth: '250px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Buscar por sujeto o evaluador..."
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => navigate('/auditoria/protocolo')}
                    className="btn btn-primary"
                    style={{ flexShrink: 0 }}
                >
                    <Plus size={20} /> NUEVA AUDITORÍA
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando registros...</div>
                ) : (
                    <>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>FECHA</th>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SUJETO</th>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>EVALUADOR</th>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SCORE</th>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ESTADO</th>
                                        <th style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No se encontraron evaluaciones coincidentes.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map(ev => {
                                            const score = ev.puntuacionGlobal;
                                            let statusColor = score > 80 ? 'var(--accent)' : score > 60 ? 'var(--warning)' : 'var(--danger)';
                                            let statusText = score > 80 ? 'ÓPTIMO' : score > 60 ? 'ACEPTABLE' : 'CRÍTICO';

                                            return (
                                                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        {new Date(ev.fechaHora).toLocaleDateString()} <br />
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {new Date(ev.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                                                        {ev.animalNombre || (ev.animal ? ev.animal.nombre : 'S/N')}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                                {ev.evaluador ? ev.evaluador.charAt(0) : 'E'}
                                                            </div>
                                                            {ev.evaluador}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                                        {score}%
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '20px',
                                                            background: `${statusColor}20`,
                                                            color: statusColor,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            border: `1px solid ${statusColor}40`
                                                        }}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                        <Link
                                                            to={`/auditoria/protocolo?id=${ev.id}`}
                                                            className="btn"
                                                            style={{
                                                                background: 'transparent',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                padding: '0.5rem 1rem'
                                                            }}
                                                        >
                                                            <Eye size={16} /> Ver / PDF
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-cards-container">
                            {filtered.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay registros.</p>
                            ) : (
                                filtered.map(ev => {
                                    const score = ev.puntuacionGlobal;
                                    let statusColor = score > 80 ? 'var(--accent)' : score > 60 ? 'var(--warning)' : 'var(--danger)';
                                    return (
                                        <div key={ev.id} className="mobile-card-eval">
                                            <div className="mobile-card-header">
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                                                        {ev.animalNombre || (ev.animal ? ev.animal.nombre : 'S/N')}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {(() => {
                                                            try {
                                                                const d = new Date(ev.fechaHora);
                                                                return isNaN(d.getTime()) ? 'Fecha inválida' : `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                                            } catch (e) { return 'Fecha n/a'; }
                                                        })()}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>{score}%</div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SCORE</div>
                                                </div>
                                            </div>
                                            <div className="mobile-card-body">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                        {ev.evaluador ? ev.evaluador.charAt(0) : 'E'}
                                                    </div>
                                                    {ev.evaluador}
                                                </div>
                                                <Link
                                                    to={`/auditoria/protocolo?id=${ev.id}`}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}
                                                >
                                                    DETALLES
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default EvaluationHistory;
