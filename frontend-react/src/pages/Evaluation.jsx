import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const Evaluation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const animalIdFromQuery = searchParams.get('animalId');

    const [animals, setAnimals] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState(animalIdFromQuery || '');
    const [evaluador, setEvaluador] = useState('');
    const [respuestas, setRespuestas] = useState(Array(18).fill(3)); // Initial value 3 (Neutral/Good)
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(true);

    const questions = [
        // 1. Alimentación
        { id: 1, text: "¿El animal tiene acceso constante a agua limpia y fresca?", category: "Alimentación" },
        { id: 2, text: "¿La dieta es nutricionalmente equilibrada y adecuada para su especie?", category: "Alimentación" },
        { id: 3, text: "¿El animal mantiene un peso corporal óptimo (ni obeso ni emaciado)?", category: "Alimentación" },
        // 2. Alojamiento
        { id: 4, text: "¿El recinto proporciona suficiente espacio para moverse libremente?", category: "Alojamiento" },
        { id: 5, text: "¿El refugio protege adecuadamente contra las inclemencias climáticas?", category: "Alojamiento" },
        { id: 6, text: "¿La superficie del suelo es cómoda y segura para el animal?", category: "Alojamiento" },
        // 3. Estado Sanitario
        { id: 7, text: "¿El animal está libre de signos evidentes de enfermedad o lesiones?", category: "Salud" },
        { id: 8, text: "¿Se cumple rigurosamente con el plan de vacunación y desparasitación?", category: "Salud" },
        { id: 9, text: "¿El animal muestra una movilidad normal y sin dolor aparente?", category: "Salud" },
        // 4. Comportamiento
        { id: 10, text: "¿El animal manifiesta comportamientos naturales de su especie?", category: "Comportamiento" },
        { id: 11, text: "¿La interacción con otros animales (si aplica) es pacífica y social?", category: "Comportamiento" },
        { id: 12, text: "¿El animal se muestra curioso y alerta ante estímulos del entorno?", category: "Comportamiento" },
        // 5. Estado Emocional
        { id: 13, text: "¿El animal parece relajado y tranquilo en su entorno habitual?", category: "Emocional" },
        { id: 14, text: "¿La relación con los cuidadores humanos es de confianza y sin miedo?", category: "Emocional" },
        { id: 15, text: "¿El animal está libre de comportamientos estereotipados (balanceos, etc.)?", category: "Emocional" },
        // 6. Higiene y Entorno
        { id: 16, text: "¿El recinto se encuentra en condiciones de higiene óptimas?", category: "Entorno" },
        { id: 17, text: "¿Existe un programa de enriquecimiento ambiental activo y variado?", category: "Entorno" },
        { id: 18, text: "¿Los niveles de ruido y luz son adecuados y no causan estrés?", category: "Entorno" }
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await Api.getAnimals();
                setAnimals(data);
            } catch (err) {
                console.error("Error loading animals:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleRadioChange = (index, value) => {
        const newRespuestas = [...respuestas];
        newRespuestas[index] = parseInt(value);
        setRespuestas(newRespuestas);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAnimalId) return alert("Por favor, selecciona un animal.");

        // Calculate global score (average 1-5 scaled to 0-100)
        const total = respuestas.reduce((a, b) => a + b, 0);
        const score0to100 = Math.round(((total / (questions.length * 5)) * 100));

        const evaluationData = {
            animal: { id: parseInt(selectedAnimalId) },
            fechaHora: new Date().toISOString(),
            evaluador: evaluador || 'Técnico de Bienestar',
            puntuacionGlobal: score0to100,
            nivelConfianza: 5,
            respuestas: respuestas,
            notas: notas
        };

        try {
            await Api.createEvaluation(evaluationData);
            alert("Protocolo de Auditoría sincronizado con éxito.");
            navigate('/dashboard');
        } catch (err) {
            alert("Error al sincronizar: " + err.message);
        }
    };

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Protocolo de Auditoría</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluación técnica del bienestar animal (Protocolo Welfare Quality)</p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Sujeto a Evaluar</label>
                            <select
                                className="form-control"
                                value={selectedAnimalId}
                                onChange={(e) => setSelectedAnimalId(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar del censo...</option>
                                {animals.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.especie})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Técnico Evaluador</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre del profesional"
                                value={evaluador}
                                onChange={(e) => setEvaluador(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {questions.map((q, i) => (
                        <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{q.category}</span>
                                <p style={{ margin: '0.25rem 0', fontWeight: 500 }}>{q.id}. {q.text}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {[1, 2, 3, 4, 5].map(val => (
                                    <label key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '0.25rem' }}>
                                        <input
                                            type="radio"
                                            name={`q${q.id}`}
                                            value={val}
                                            checked={respuestas[i] === val}
                                            onChange={(e) => handleRadioChange(i, e.target.value)}
                                            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: respuestas[i] === val ? 'var(--primary)' : 'var(--text-muted)' }}>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                    <label className="form-label">Observaciones Técnicas Adicionales</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Registra cualquier anomalía o comentario relevante..."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    ></textarea>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1.5rem' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={20} /> Finalizar y Sincronizar
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Evaluation;
