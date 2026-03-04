import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Printer } from 'lucide-react';

const Evaluation = () => {
    // CSS to hide non-printable elements and format report
    const printStyles = `
        @media print {
            body { background: white !important; color: black !important; overflow: visible !important; }
            .no-print, .sidebar { display: none !important; }
            .glass-panel { 
                background: white !important; 
                border: 1px solid #ddd !important; 
                box-shadow: none !important;
                color: black !important;
                padding: 10px !important;
                margin-bottom: 20px !important;
                page-break-inside: avoid !important;
            }
            .content-header h1 { color: black !important; }
            .form-control { 
                border: 1px solid #eee !important; 
                background: transparent !important; 
                color: black !important;
                padding: 5px !important;
            }
            textarea { 
                resize: none; 
                overflow: visible !important; 
                height: auto !important; 
                min-height: 50px;
                border: 1px solid #eee !important;
            }
            /* Expand radio buttons for readability or hide unselected */
            input[type="radio"] { display: inline-block !important; }
            label { 
                color: black !important; 
                border: 1px solid #ccc !important; 
                background: #f9f9f9 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .print-header { display: block !important; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .print-only { display: block !important; }
            
            /* Page break control */
            .question-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 15px !important;
                border: 1px solid #ddd !important;
                box-shadow: none !important;
                background: white !important;
            }
            .question-card p {
                color: black !important;
            }
            .print-category-header {
                page-break-after: avoid !important;
                margin-top: 30px !important;
                color: #2c3e50 !important;
                border-bottom: 2px solid #2c3e50 !important;
            }
            .no-print { display: none !important; }
            /* Hide print button in print view */
            button { display: none !important; }
            /* Ensure text areas expand */
            textarea {
                border: 1px solid #ccc !important;
                color: black !important;
                font-family: inherit;
            }
        }
        .print-only { display: none; }
    `;

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const animalIdFromQuery = searchParams.get('animalId');
    const evaluationId = searchParams.get('id');
    const isEditMode = !!evaluationId;

    const [animals, setAnimals] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState(animalIdFromQuery || '');
    const [evaluador, setEvaluador] = useState('');
    const [cargo, setCargo] = useState('');
    const [recinto, setRecinto] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 16));
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 16));
    // respuestas: Map of QuestionId -> { puntos: 5, comentario: "...", seleccion: "A" }
    const [respuestas, setRespuestas] = useState({});
    const [notas, setNotas] = useState('');
    const [planAccion, setPlanAccion] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [animalsData, questionsData] = await Promise.all([
                    Api.getAnimals(),
                    Api.getQuestions()
                ]);
                setAnimals(Array.isArray(animalsData) ? animalsData : []);
                setQuestions(Array.isArray(questionsData) ? questionsData : []);

                if (isEditMode) {
                    const evalData = await Api.getEvaluationById(evaluationId);
                    setSelectedAnimalId(evalData.animal.id);
                    setEvaluador(evalData.evaluador || '');
                    setCargo(evalData.cargo || '');
                    setRecinto(evalData.recinto || '');
                    if (evalData.fechaInicio) setFechaInicio(evalData.fechaInicio.slice(0, 16));
                    if (evalData.fechaFin) setFechaFin(evalData.fechaFin.slice(0, 16));
                    setNotas(evalData.notas);
                    setPlanAccion(evalData.planAccion || '');

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

    const handleScoreChange = (qId, option) => {
        // option: 'A', 'B', 'C'
        const pts = option === 'A' ? 100 : option === 'B' ? 50 : 0;

        setRespuestas(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                puntos: pts,
                seleccion: option
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

        // Check completion (ensure an option is selected for all questions)
        // We filter questions that do NOT have a corresponding valid selection in 'respuestas'
        const unansweredQuestions = questions.filter(q => {
            // Try both number and string keys just to be safe
            const ans = (respuestas || {})[q.id] || (respuestas || {})[String(q.id)];
            if (!ans || !ans.seleccion) {
                return true;
            }
            return false;
        });

        if (unansweredQuestions.length > 0) {
            // Debug info: List missing question numbers
            const missingIds = unansweredQuestions.map((q, idx) => questions.indexOf(q) + 1).join(', ');
            if (!window.confirm(`Faltan ${unansweredQuestions.length} preguntas por responder (Números: ${missingIds}). ¿Deseas guardar de todas formas?`)) {
                return;
            }
        }

        let totalPts = 0;
        let maxPossible = questions.length * 100;
        Object.values(respuestas).forEach(ans => totalPts += (ans.puntos ?? 0));

        const score0to100 = maxPossible > 0 ? Math.round((totalPts / maxPossible) * 100) : 0;

        const respuestasDetalladas = Object.keys(respuestas).map(qId => ({
            pregunta: { id: parseInt(qId) },
            seleccion: respuestas[qId].seleccion || 'E',
            puntos: (respuestas[qId].puntos !== undefined && respuestas[qId].puntos !== null) ? respuestas[qId].puntos : 0,
            comentario: respuestas[qId].comentario || ''
        }));

        const evaluationData = {
            id: isEditMode ? parseInt(evaluationId) : null,
            animal: { id: parseInt(selectedAnimalId) },
            fechaHora: new Date().toISOString(),
            fechaInicio: new Date(fechaInicio).toISOString(),
            fechaFin: new Date(fechaFin).toISOString(),
            evaluador: evaluador,
            cargo: cargo,
            recinto: recinto,
            puntuacionGlobal: score0to100,
            nivelConfianza: 5,
            respuestasDetalladas: respuestasDetalladas,
            notas: notas,
            planAccion: planAccion
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
            <style>{printStyles}</style>
            <div className="print-only print-header">
                <h1>Informe de Auditoría de Bienestar Animal</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
                    <div>
                        <p><strong>Fecha Inicio:</strong> {(() => { try { return new Date(fechaInicio).toLocaleString(); } catch { return fechaInicio; } })()}</p>
                        <p><strong>Fecha Fin:</strong> {(() => { try { return new Date(fechaFin).toLocaleString(); } catch { return fechaFin; } })()}</p>
                        <p><strong>Especie:</strong> {animals.find(a => a.id == selectedAnimalId)?.especie || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Recinto:</strong> {recinto || 'N/A'}</p>
                        <p><strong>Sujeto:</strong> {animals.find(a => a.id == selectedAnimalId)?.nombre || 'N/A'}</p>
                        <p><strong>Evaluador/Cargo:</strong> {evaluador} {cargo ? `/ ${cargo}` : ''}</p>
                    </div>
                </div>
            </div>

            <header className="content-header no-print">
                <div>
                    <h1>Protocolo de Auditoría</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluación técnica del bienestar animal (Escala Cualitativa)</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => window.print()}
                        className="btn"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                        <Printer size={18} /> Imprimir / PDF
                    </button>
                    <UserDropdown />
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="glass-panel mobile-p-1" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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
                            <label className="form-label">Recinto / Área</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej: Granja, Sabana..."
                                value={recinto}
                                onChange={(e) => setRecinto(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Evaluador Principal</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nombre completo"
                                value={evaluador}
                                onChange={(e) => setEvaluador(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cargo / Institución</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej: Estudiantes Galileo"
                                value={cargo}
                                onChange={(e) => setCargo(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha/Hora Inicio</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha/Hora Fin</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {questions.map((q, index) => {
                        const currentAns = respuestas[q.id] || {};
                        const isInCategoryHeader = index === 0 || questions[index - 1].categoria !== q.categoria;

                        return (
                            <React.Fragment key={q.id}>
                                {isInCategoryHeader && (
                                    <h2 className="print-category-header" style={{
                                        margin: '2rem 0 1rem',
                                        color: 'var(--primary)',
                                        borderBottom: '2px solid var(--primary)',
                                        paddingBottom: '0.5rem',
                                        textTransform: 'uppercase',
                                        fontSize: '1.2rem'
                                    }}>{q.categoria}</h2>
                                )}
                                <div className="glass-panel mobile-p-1 question-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ margin: '0.25rem 0', fontWeight: 700, fontSize: '1rem' }}>
                                            {index + 1}. {q.texto}
                                        </p>
                                    </div>

                                    <div className="options-container no-print" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'A', label: q.opcionA || 'Bien', sub: '(Óptimo)', color: 'var(--accent)' },
                                            { id: 'B', label: q.opcionB || 'Regular', sub: '(Aceptable)', color: 'var(--warning)' },
                                            { id: 'C', label: q.opcionC || 'Mal', sub: '(Crítico)', color: 'var(--danger)' }
                                        ].map((opt) => (
                                            <label
                                                key={opt.id}
                                                onClick={(e) => {
                                                    // Prevent default to avoid double-toggling if input also fires
                                                    // e.preventDefault(); 
                                                    // actually, for radio headers, we want to just set values.
                                                    handleScoreChange(q.id, opt.id);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    padding: '0.75rem 1.25rem',
                                                    borderRadius: '12px',
                                                    background: currentAns.seleccion === opt.id
                                                        ? opt.color
                                                        : 'rgba(255,255,255,0.05)',
                                                    border: currentAns.seleccion === opt.id ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.2s',
                                                    minWidth: '100px',
                                                    maxWidth: '250px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: currentAns.seleccion === opt.id ? '#000' : 'white' }}>{opt.label}</span>
                                                <span className="no-print" style={{ fontSize: '0.65rem', color: currentAns.seleccion === opt.id ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)' }}>{opt.sub}</span>
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={opt.id}
                                                    checked={currentAns.seleccion === opt.id}
                                                    readOnly
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <div className="print-answers print-only" style={{ marginBottom: '1rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        <p><strong>Resultado:</strong> {
                                            currentAns.seleccion === 'A' ? `A: ${q.opcionA || 'Bien'}` :
                                                currentAns.seleccion === 'B' ? `B: ${q.opcionB || 'Regular'}` :
                                                    currentAns.seleccion === 'C' ? `C: ${q.opcionC || 'Mal'}` : 'Sin responder'
                                        }</p>
                                        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                                            (Opciones posibles: A: {q.opcionA || 'Bien'} | B: {q.opcionB || 'Regular'} | C: {q.opcionC || 'Mal'})
                                        </p>
                                    </div>

                                    <div>
                                        <label className="print-only" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Comentarios:</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Comentario u observación sobre esta pregunta..."
                                            style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            value={currentAns.comentario || ''}
                                            onChange={(e) => handleCommentChange(q.id, e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="glass-panel mobile-p-1" style={{ padding: '2rem', marginTop: '2rem' }}>
                    <label className="form-label">Observaciones Generales</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Conclusiones generales de la auditoría..."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    ></textarea>

                    {/* ACTION PLAN SECTION - Visible if score is low or if plan exists */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <label className="form-label" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> PLAN DE ACCIÓN / RECOMENDACIONES
                        </label>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Requerido si la puntuación global es inferior al 70% o si se detectan "estados de sufrimiento" en el dominio mental.
                        </p>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Detalle las medidas correctivas inmediatas y a largo plazo..."
                            value={planAccion}
                            onChange={(e) => setPlanAccion(e.target.value)}
                            style={{
                                borderColor: 'var(--warning)',
                                background: 'rgba(234, 179, 8, 0.05)',
                                minHeight: '100px'
                            }}
                        ></textarea>
                    </div>

                    <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1.5rem' }}>
                        <button type="button" onClick={() => navigate('/auditoria')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={20} /> {isEditMode ? 'Actualizar Auditoría' : 'Finalizar y Sincronizar'}
                        </button>
                    </div>
                </div>
            </form>
        </Layout >
    );
};

export default Evaluation;
