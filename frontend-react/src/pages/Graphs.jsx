import React, { useState, useEffect } from 'react';
import SafeChart from '../components/SafeChart';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import { Brain, TrendingUp, BarChart3, Hexagon } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Graphs = () => {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState('');
    const [chartData, setChartData] = useState(null);
    const [radarData, setRadarData] = useState(null);
    const [stats, setStats] = useState({ avg: 0, count: 0, trend: 'stable' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const data = await Api.getAnimals();
                if (data && Array.isArray(data)) {
                    setAnimals(data);
                    if (data.length > 0) {
                        const firstId = data[0]?.id;
                        if (firstId) {
                            setSelectedAnimalId(firstId);
                            loadAnimalStats(firstId);
                        }
                    }
                } else {
                    setAnimals([]);
                }
            } catch (err) {
                console.error(err);
                setAnimals([]);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    const loadAnimalStats = async (id) => {
        try {
            const evals = await Api.getEvaluationsByAnimal(id);

            if (!evals || !Array.isArray(evals)) {
                setChartData(null);
                setRadarData(null);
                setStats({ avg: 0, count: 0, trend: 'No hay datos' });
                return;
            }

            const sorted = evals.sort((a, b) => {
                const dateA = new Date(a.fechaHora || 0);
                const dateB = new Date(b.fechaHora || 0);
                return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
            });

            if (sorted.length === 0) {
                setChartData(null);
                setRadarData(null);
                setStats({ avg: 0, count: 0, trend: 'No hay datos' });
                return;
            }

            // 1. Line Chart Data (History)
            const labels = sorted.map(e => {
                try {
                    return new Date(e.fechaHora).toLocaleDateString();
                } catch { return 'N/A'; }
            });
            const values = sorted.map(e => e.puntuacionGlobal);

            if (labels.length > 0) {
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Índice de Bienestar (%)',
                            data: values,
                            fill: true,
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            tension: 0.4,
                            pointBackgroundColor: '#38bdf8',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 6,
                        }
                    ]
                });
            } else {
                setChartData(null);
            }

            // 2. Radar Chart Data (Latest Evaluation Domains)
            const latest = sorted[sorted.length - 1];
            if (latest.respuestasDetalladas) {
                const domainScores = {};
                const domainCounts = {};

                // Initialize specific 5 domains to ensure order and presence
                const standardDomains = ["NUTRICIÓN", "ENTORNO", "SALUD FÍSICA", "INTERACCIONES", "ESTADO MENTAL"];
                standardDomains.forEach(d => {
                    domainScores[d] = 0;
                    domainCounts[d] = 0;
                });

                latest.respuestasDetalladas.forEach(ans => {
                    // Safe access to nested properties to prevent CRASH caused by backend DTO limits
                    if (!ans || !ans.pregunta) return;

                    const cat = ans.pregunta.categoria;
                    // Handle potential case mismatches or legacy categories if any
                    let normalizedCat = cat;
                    if (cat === "ALIMENTACIÓN") normalizedCat = "NUTRICIÓN"; // Just in case

                    domainScores[normalizedCat] = (domainScores[normalizedCat] || 0) + (ans.puntos || 0);
                    domainCounts[normalizedCat] = (domainCounts[normalizedCat] || 0) + 1;
                });

                const radarValues = standardDomains.map(label => {
                    const score = domainScores[label] || 0;
                    const count = domainCounts[label] || 0;
                    if (count === 0) return 0;
                    return Math.round((score / (count * 5)) * 100);
                });

                setRadarData({
                    labels: standardDomains,
                    datasets: [
                        {
                            label: 'Puntuación por Dominio (%)',
                            data: radarValues,
                            backgroundColor: 'rgba(56, 189, 248, 0.25)',
                            borderColor: '#38bdf8',
                            pointBackgroundColor: '#38bdf8',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#38bdf8',
                            borderWidth: 2,
                        },
                        // Add a "Target" dataset for comparison/baseline if needed, or just fill
                        {
                            label: 'Mínimo Aceptable',
                            data: [60, 60, 60, 60, 60],
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(239, 68, 68, 0.3)', // Reddish for danger zone
                            borderWidth: 1,
                            pointRadius: 0,
                            borderDash: [5, 5]
                        }
                    ]
                });
            }

            const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            let trend = 'Estable';
            if (values.length > 1) {
                const lastVal = values[values.length - 1];
                const prevVal = values[values.length - 2];
                trend = lastVal > prevVal ? 'En ascenso' : (lastVal < prevVal ? 'En descenso' : 'Estable');
            }

            setStats({
                avg,
                count: values.length,
                trend
            });

        } catch (err) {
            console.error(err);
        }
    };

    const handleAnimalChange = (e) => {
        const id = e.target.value;
        setSelectedAnimalId(id);
        if (id) loadAnimalStats(id);
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        let timeoutId = null;
        const handleResize = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobile(window.innerWidth <= 1024);
            }, 100);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                display: !isMobile,
                labels: { color: 'white', font: { size: isMobile ? 10 : 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: isMobile ? 10 : 12 } },
                suggestedMin: 0,
                suggestedMax: 100
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: { size: isMobile ? 9 : 12 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: isMobile ? 4 : 8
                }
            }
        }
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: isMobile ? 10 : 12, weight: '500' },
                    padding: isMobile ? 5 : 15
                },
                ticks: { display: false, stepSize: 20 },
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    };

    // Safe render state
    const [error, setError] = useState(null);

    if (error) {
        return (
            <Layout>
                <div style={{ padding: '2rem', color: 'var(--danger)', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                    <h2>⚠️ Error en Visualización</h2>
                    <p>Ocurrió un problema al generar los gráficos: {error.message}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Recargar Página
                    </button>
                </div>
            </Layout>
        );
    }

    // Safety wrapper catch
    useEffect(() => {
        const errorHandler = (e) => setError(e);
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);


    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Inteligencia de Datos</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Análisis predictivo y seguimiento histórico</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'space-between' }} className="mobile-m-t-1">
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', flex: 1 }}>
                        <select
                            className="form-control"
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}
                            value={selectedAnimalId}
                            onChange={handleAnimalChange}
                        >
                            <option value="" style={{ color: '#000' }}>Sujeto...</option>
                            {animals.map(a => <option key={a.id} value={a.id} style={{ color: '#000' }}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <UserDropdown />
                </div>
            </header>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{Number(stats.avg || 0).toFixed(0)}%</div>
                    <div className="stat-label">Media Histórica</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.count || 0}</div>
                    <div className="stat-label">Evaluaciones Realizadas</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: stats.trend === 'En descenso' ? 'var(--danger)' : 'var(--accent)' }}>
                        {stats.trend || 'Estable'}
                    </div>
                    <div className="stat-label">Tendencia Operativa</div>
                </div>
            </div>

            <div className="dashboard-grid mobile-m-t-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '2rem' }}>
                <div className="glass-panel mobile-p-1 chart-container-adaptive" style={{ padding: isMobile ? '1rem' : '2rem', height: '450px', position: 'relative' }}>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} /> HISTÓRICO DE BIENESTAR
                    </h2>
                    {chartData && chartData.datasets ? (
                        <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                            <SafeChart>
                                <Line data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                            </SafeChart>
                        </div>
                    ) : (
                        <div style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem' }}>📈</div>
                            <p>{loading ? 'Analizando registros...' : 'No hay datos históricos para este sujeto.'}</p>
                        </div>
                    )}
                </div>

                <div className="glass-panel mobile-p-1 chart-container-adaptive" style={{ padding: isMobile ? '1rem' : '2rem', height: '450px', position: 'relative' }}>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Hexagon size={18} /> BALANCE DE DOMINIOS (ACTUAL)
                    </h2>
                    {radarData && radarData.datasets ? (
                        <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                            <SafeChart>
                                <Radar data={radarData} options={{ ...radarOptions, maintainAspectRatio: false }} />
                            </SafeChart>
                        </div>
                    ) : (
                        <div style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem' }}>🕸️</div>
                            <p>{loading ? 'Calculando balance...' : 'Selecciona un sujeto con evaluaciones para ver el balance de dominios.'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel mobile-p-1" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={18} /> ANÁLISIS POR DOMINIOS
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        El gráfico de radar muestra el equilibrio entre las 5 áreas críticas de bienestar.
                        Un área contraída indica un cuello de botella en los protocolos de cuidado actuales.
                    </p>
                </div>
                <div className="glass-panel mobile-p-1" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={18} /> INTERPRETACIÓN GBL
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {(stats.avg || 0) > 80
                            ? '✅ Estado óptimo: El sujeto manifiesta comportamientos positivos y salud estable.'
                            : '⚠️ Atención requerida: Se observan deficiencias perceptibles en uno o más dominios.'}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Graphs;
