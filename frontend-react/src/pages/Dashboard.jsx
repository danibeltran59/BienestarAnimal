import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import { AlertTriangle, Activity, Brain, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWA } from '../hooks/usePWA';

const Dashboard = () => {
    const { installable, isIOS, isStandalone, install } = usePWA();
    const [stats, setStats] = useState({ totalAnimals: '--', totalEvaluations: '--', avgWelfare: '--%' });
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [mentalStatus, setMentalStatus] = useState({ index: '--%', label: 'PROCESANDO...', color: 'var(--accent)' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [animals, evaluations] = await Promise.all([
                    Api.getAnimals(),
                    Api.getAllEvaluations()
                ]);


                // 1. Calculate Stats
                const totalAnimals = animals.length;
                const totalEvaluations = evaluations.length;
                let avg = 0;

                if (totalEvaluations > 0) {
                    const sum = (evaluations || []).reduce((s, e) => s + (e?.puntuacionGlobal || 0), 0);
                    avg = Math.round(sum / totalEvaluations);
                }

                setStats({
                    totalAnimals,
                    totalEvaluations,
                    avgWelfare: `${avg}% `
                });

                // 2. Mental Status (Global Average of all evaluations)
                let mentalScoreSum = 0;
                let validMentalCount = 0;

                evaluations.forEach(ev => {
                    // Use the 5th domain score (puntuacionMental) which is calculated on backend
                    if (ev.puntuacionMental !== undefined && ev.puntuacionMental !== null) {
                        mentalScoreSum += ev.puntuacionMental;
                        validMentalCount++;
                    }
                });

                const mentalIndex = validMentalCount > 0 ? Math.round(mentalScoreSum / validMentalCount) : 0;

                let statusLabel = "PENDIENTE";
                let statusColor = "var(--text-muted)";

                if (validMentalCount > 0) {
                    if (mentalIndex >= 80) {
                        statusLabel = "BIENESTAR ÓPTIMO";
                        statusColor = "var(--primary)";
                    } else if (mentalIndex >= 60) {
                        statusLabel = "NIVEL ACEPTABLE";
                        statusColor = "var(--warning)";
                    } else {
                        statusLabel = "CRÍTICO / INTERVENCIÓN";
                        statusColor = "var(--danger)";
                    }
                }

                setMentalStatus({
                    index: validMentalCount > 0 ? `${mentalIndex}%` : '--%',
                    label: statusLabel,
                    color: statusColor
                });

                // 3. Critical Alerts (Last evaluation per animal <= 60%)
                const lastEvalsByAnimal = {};
                evaluations.forEach(ev => {
                    // Use animalId from DTO if available, fallback to animal.id
                    const id = ev.animalId || (ev.animal ? ev.animal.id : null);
                    if (id) {
                        if (!lastEvalsByAnimal[id] || new Date(ev.fechaHora) > new Date(lastEvalsByAnimal[id].fechaHora)) {
                            lastEvalsByAnimal[id] = ev;
                        }
                    }
                });

                const atRisk = Object.values(lastEvalsByAnimal)
                    .filter(ev => ev && (ev.puntuacionGlobal !== undefined) && ev.puntuacionGlobal <= 60)
                    .sort((a, b) => (a?.puntuacionGlobal || 0) - (b?.puntuacionGlobal || 0));

                setCriticalAlerts(atRisk || []);

                // 4. Recent Activity
                const recent = [...evaluations].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 10);
                setRecentActivity(recent);

            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Inteligencia de Bienestar</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sincronización en tiempo real con el Zoo</p>
                </div>
                <UserDropdown />
            </header>

            {(installable || isIOS) && !isStandalone && (
                <div className="glass-panel" style={{
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '16px'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Aplicación disponible</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Descarga la App para una experiencia profesional</p>
                    </div>
                    <button
                        onClick={install}
                        className="btn"
                        style={{
                            background: '#000',
                            color: '#fff',
                            padding: '0.6rem 1.2rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderRadius: '12px'
                        }}
                    >
                        <Download size={18} /> Descargar
                    </button>
                </div>
            )}

            <div className="dashboard-grid mobile-grid-2">
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.totalAnimals}</div>
                    <div className="stat-label">Stock de Fauna</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.totalEvaluations}</div>
                    <div className="stat-label">Registros Históricos</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.avgWelfare}</div>
                    <div className="stat-label">Welfare Index (GBL)</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {/* ALERTS SECTION */}
                <section className="glass-panel mobile-p-1-5" style={{ padding: '2rem', borderTop: '4px solid var(--danger)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} /> ALERTAS CRÍTICAS
                    </h2>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {criticalAlerts.length === 0 ? (
                            <p style={{ color: 'var(--accent)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem' }}>
                                ✅ Todos los sujetos están en parámetros de seguridad.
                            </p>
                        ) : (
                            criticalAlerts.map(ev => (
                                <div key={ev.id} className="activity-row" style={{
                                    padding: '1.25rem',
                                    borderBottom: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: ev.puntuacionGlobal < 60 ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.2rem' }}>{ev.puntuacionGlobal < 60 ? '🔴' : '🟡'}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: ev.puntuacionGlobal < 60 ? 'var(--danger)' : 'var(--warning)' }}>
                                                {ev.animalNombre || (ev.animal ? ev.animal.nombre : 'Desconocido')}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                Nivel: {ev.puntuacionGlobal}%
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/auditoria?id=${ev.id}`} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                                        DETALLES
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* RECENT ACTIVITY */}
                <section className="glass-panel mobile-p-1-5" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} /> LOG OPERATIVO
                    </h2>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {recentActivity.map(ev => (
                            <Link key={ev.id} to={`/auditoria?id=${ev.id}`} className="activity-row" style={{
                                padding: '1.25rem',
                                borderBottom: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: ev.puntuacionGlobal > 80 ? 'var(--accent)' : (ev.puntuacionGlobal > 60 ? 'var(--warning)' : 'var(--danger)')
                                    }}></div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 600 }}>{ev.animalNombre || (ev.animal ? ev.animal.nombre : 'S/N')}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> - {ev.evaluador || 'Sistema'}</span>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                                    {ev.puntuacionGlobal}%
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* GENERAL STATUS */}
                <section className="glass-panel mobile-p-1-5" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={20} /> ESTADO MENTAL GBL
                    </h2>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '6px solid var(--base-dark)',
                        boxShadow: '0 0 30px var(--primary-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {mentalStatus.index}
                        </span>
                    </div>
                    <p style={{ color: mentalStatus.color, fontWeight: 700, letterSpacing: '1px', fontSize: '0.8rem' }}>
                        {mentalStatus.label}
                    </p>
                </section>
            </div>
        </Layout>
    );
};

export default Dashboard;
