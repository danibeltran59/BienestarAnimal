import React, { useState, useEffect, useRef } from 'react';
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
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Brain, TrendingUp, BarChart3 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Graphs = () => {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState('');
    const [chartData, setChartData] = useState(null);
    const [stats, setStats] = useState({ avg: 0, count: 0, trend: 'stable' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const data = await Api.getAnimals();
                setAnimals(data);
                if (data.length > 0) {
                    setSelectedAnimalId(data[0].id);
                    loadAnimalStats(data[0].id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    const loadAnimalStats = async (id) => {
        try {
            const evals = await Api.getEvaluationsByAnimal(id);
            const sorted = evals.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

            if (sorted.length === 0) {
                setChartData(null);
                setStats({ avg: 0, count: 0, trend: 'No hay datos' });
                return;
            }

            const labels = sorted.map(e => new Date(e.fechaHora).toLocaleDateString());
            const values = sorted.map(e => e.puntuacionGlobal);

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

            const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            let trend = 'Estable';
            if (values.length > 1) {
                const last = values[values.length - 1];
                const prev = values[values.length - 2];
                trend = last > prev ? 'En ascenso' : (last < prev ? 'En descenso' : 'Estable');
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#38bdf8',
                bodyColor: '#fff',
                borderColor: '#38bdf8',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                }
            }
        }
    };

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Inteligencia de Datos</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Análisis predictivo y seguimiento histórico</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <select
                            className="form-control"
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '1rem', cursor: 'pointer' }}
                            value={selectedAnimalId}
                            onChange={handleAnimalChange}
                        >
                            <option value="" style={{ color: '#000' }}>Seleccionar Sujeto...</option>
                            {animals.map(a => <option key={a.id} value={a.id} style={{ color: '#000' }}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <UserDropdown />
                </div>
            </header>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.avg}%</div>
                    <div className="stat-label">Media Histórica</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value">{stats.count}</div>
                    <div className="stat-label">Evaluaciones Realizadas</div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: stats.trend === 'En descenso' ? 'var(--danger)' : 'var(--accent)' }}>
                        {stats.trend}
                    </div>
                    <div className="stat-label">Tendencia Operativa</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem', height: '500px', position: 'relative' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} /> CURVA DE BIENESTAR DINÁMICA
                </h2>

                {chartData ? (
                    <div style={{ height: '380px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div style={{ height: '380px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                        Solo la inteligencia de datos puede salvar vidas. Selecciona un sujeto para comenzar el análisis.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={18} /> ANÁLISIS BIO-MÉTRICO
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Basado en los últimos {stats.count} registros, el sujeto mantiene un índice de {stats.avg}%.
                        {stats.avg > 80 ? ' Los protocolos actuales son efectivos.' : ' Se recomienda una revisión inmediata de las condiciones de alojamiento y dieta.'}
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={18} /> DISTRIBUCIÓN DE DOMINIOS
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                        El desglose por categorías (Alimentación, Salud, Comportamiento) estará disponible en la versión 2.0 del motor de inteligencia.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Graphs;
