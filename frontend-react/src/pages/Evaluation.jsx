import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const Evaluation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const animalIdFromQuery = searchParams.get('animalId');
    const evaluationId = searchParams.get('id');
    const isEditMode = !!evaluationId;

    const [animals, setAnimals] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState(animalIdFromQuery || '');
    const [evaluador, setEvaluador] = useState('');
    // respuestas: Map of QuestionId -> { puntos: 5, comentario: "...", seleccion: "A" }
    const [respuestas, setRespuestas] = useState({});
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [animalsData, questionsData] = await Promise.all([
                    Api.getAnimals(),
                    Api.getQuestions()
                ]);
                setAnimals(animalsData);
                setQuestions(questionsData);

                if (isEditMode) {
                    const evalData = await Api.getEvaluationById(evaluationId);
                    setSelectedAnimalId(evalData.animal.id);
                    setEvaluador(evalData.evaluador);
                    setNotas(evalData.notas);

                    const answersMap = {};
                    if (evalData.respuestasDetalladas) {
                        evalData.respuestasDetalladas.forEach(ans => {
                            answersMap[ans.pregunta.id] = {
                                seleccion: ans.seleccion,
                                puntos: ans.puntos,
                                comentario: ans.comentario
                            };
                        });
                    }
                    setRespuestas(answersMap);
                }
            } catch (err) {
                console.error("Error loading evaluation data:", err);
                alert("Error cargando los datos del protocolo.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [isEditMode, evaluationId]);

    const handleScoreChange = (qId, score) => {
        // Map score 1-5 to A-E for backend compatibility if needed, or just store points
        // Assuming 5=A, 4=B, 3=C, 2=D, 1=E as per previous logic
        const mapSel = score === 5 ? 'A' : score === 4 ? 'B' : score === 3 ? 'C' : score === 2 ? 'D' : 'E';

        setRespuestas(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                puntos: parseInt(score),
                seleccion: mapSel
            }
        }));
    };

    const handleCommentChange = (qId, comment) => {
        setRespuestas(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                comentario: comment
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAnimalId) return alert("Por favor, selecciona un animal.");

        // Check completion (ensure points are selected for all questions)
        const answeredCount = Object.keys(respuestas).filter(k => respuestas[k].puntos).length;
        if (answeredCount < questions.length) {
            const missing = questions.length - answeredCount;
            if (!window.confirm(`Faltan ${missing} preguntas por responder. ¿Deseas guardar de todas formas?`)) {
                return;
            }
        }

        let totalPts = 0;
        let maxPossible = questions.length * 5;
        Object.values(respuestas).forEach(ans => totalPts += (ans.puntos || 0));

        const score0to100 = maxPossible > 0 ? Math.round((totalPts / maxPossible) * 100) : 0;

        const respuestasDetalladas = Object.keys(respuestas).map(qId => ({
            pregunta: { id: parseInt(qId) },
            seleccion: respuestas[qId].seleccion || 'E',
            puntos: respuestas[qId].puntos || 0,
            comentario: respuestas[qId].comentario || ''
        }));

        const evaluationData = {
            id: isEditMode ? parseInt(evaluationId) : null,
            animal: { id: parseInt(selectedAnimalId) },
            fechaHora: new Date().toISOString(),
            evaluador: evaluador || 'Técnico de Bienestar',
            puntuacionGlobal: score0to100,
            nivelConfianza: 5,
            respuestasDetalladas: respuestasDetalladas,
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

    if (loading) return (
        <Layout>
            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando protocolo...</div>
        </Layout>
    );

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Protocolo de Auditoría</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluación técnica del bienestar animal (Escala 1-5)</p>
                </div>
                <UserDropdown />
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
                    {questions.map((q) => {
                        const currentAns = respuestas[q.id] || {};
                        return (
                            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{q.categoria}</span>
                                    <p style={{ margin: '0.25rem 0', fontWeight: 500, fontSize: '0.95rem' }}>{q.texto}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Puntuación:</span>
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <label
                                            key={score}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: currentAns.puntos === score
                                                    ? (score >= 4 ? 'var(--primary)' : score <= 2 ? 'var(--danger)' : 'var(--accent)')
                                                    : 'rgba(255,255,255,0.05)',
                                                border: currentAns.puntos === score ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                transition: 'all 0.2s',
                                                boxShadow: currentAns.puntos === score ? '0 0 10px rgba(0,0,0,0.3)' : 'none'
                                            }}
                                            title={`${score} Puntos`}
                                        >
                                            <span style={{ fontWeight: 'bold', color: currentAns.puntos === score ? '#fff' : 'var(--text-muted)' }}>{score}</span>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={score}
                                                checked={currentAns.puntos === score}
                                                onChange={() => handleScoreChange(q.id, score)}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    ))}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                        (1=Peor, 5=Mejor)
                                    </span>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Comentario u observación sobre esta pregunta..."
                                        style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        value={currentAns.comentario || ''}
                                        onChange={(e) => handleCommentChange(q.id, e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                    <label className="form-label">Observaciones Generales</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Conclusiones generales de la auditoría..."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    ></textarea>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1.5rem' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={20} /> {isEditMode ? 'Actualizar Auditoría' : 'Finalizar y Sincronizar'}
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Evaluation;
