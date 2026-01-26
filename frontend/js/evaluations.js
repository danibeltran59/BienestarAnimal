/* c:/Users/Dani B/Desktop/BienestarAnimal/frontend/js/evaluations.js */

let currentQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadAnimalsForSelect();
    await loadQuestions();
    loadEvaluations();
    document.getElementById('animalFilter').addEventListener('change', (e) => loadEvaluations(e.target.value));
    document.getElementById('evaluationForm').addEventListener('submit', handleSaveEvaluation);
});

async function loadQuestions() {
    try { currentQuestions = await window.Api.getPreguntas(); }
    catch (e) { console.error(e); }
}

async function loadAnimalsForSelect() {
    try {
        const animals = await window.Api.getAnimals();
        const f = document.getElementById('animalFilter');
        const m = document.getElementById('evalAnimalId');
        animals.forEach(a => {
            const o1 = document.createElement('option'); o1.value = a.id; o1.textContent = a.nombre; f.appendChild(o1);
            const o2 = document.createElement('option'); o2.value = a.id; o2.textContent = a.nombre; m.appendChild(o2);
        });
    } catch (e) { console.error(e); }
}

async function loadEvaluations(animalId = '') {
    const list = document.getElementById('evaluationList');
    list.innerHTML = '<div style="color:var(--text-muted); padding:2rem;">Consultando archivos...</div>';
    try {
        const evals = animalId ? await window.Api.getEvaluationsByAnimal(animalId) : await window.Api.getAllEvaluations();
        list.innerHTML = '';
        if (evals.length === 0) {
            list.innerHTML = '<div class="glass-panel" style="padding:3rem; width:100%; text-align:center; color:var(--text-muted);">Sin registros en este sector.</div>';
            return;
        }
        evals.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).forEach(ev => {
            const card = document.createElement('div');
            card.className = 'glass-panel audit-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="font-size:0.75rem; color:var(--primary); font-weight:800; letter-spacing:1px; margin-bottom:0.25rem;">PROTOCOLO #${ev.id}</div>
                        <h3 style="color:var(--text-main); font-size:1.2rem;">${ev.animal ? ev.animal.nombre : 'S/N'}</h3>
                    </div>
                    <div class="score-display">${ev.puntuacionGlobal}%</div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); line-height:1.4;">
                    👤 Auditado por: ${ev.evaluador || 'Anon'}<br>
                    📍 Recinto: ${ev.recinto || '-'}<br>
                    📅 Fecha: ${new Date(ev.fechaHora).toLocaleString()}
                </div>
                <div style="margin-top:0.5rem; padding-top:1rem; border-top:1px solid var(--glass-border);">
                    <p style="font-size:0.85rem; color:var(--text-muted); font-style:italic; opacity:0.8;">"${ev.notas || 'Sin notas adicionales.'}"</p>
                </div>
                <button onclick="deleteEvaluation(${ev.id})" style="background:transparent; border:none; color:var(--danger); font-size:0.7rem; cursor:pointer; width:fit-content; margin-top:0.5rem; opacity:0.5;">ELIMINAR ENTRADA</button>
            `;
            list.appendChild(card);
        });
    } catch (e) { list.innerHTML = '<div class="text-danger">Error de enlace operativo.</div>'; }
}

window.openEvaluationModal = () => {
    if (currentQuestions.length === 0) return alert("Sincronizando base de datos...");
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    const cats = [...new Set(currentQuestions.map(q => q.categoria))];
    cats.forEach(cat => {
        const section = document.createElement('section');
        section.style.marginBottom = '4rem';
        section.innerHTML = `<h3 style="color:var(--primary); font-size:1.1rem; margin-bottom:2rem; border-left:3px solid var(--primary); padding-left:1rem;">DOMINIO: ${cat}</h3>`;
        currentQuestions.filter(q => q.categoria === cat).forEach(q => {
            const div = document.createElement('div');
            div.style.marginBottom = '2.5rem';
            div.innerHTML = `
                <p style="font-weight:600; font-size:1rem; margin-bottom:1rem; color:var(--text-main);">${q.texto}</p>
                <div class="likert-grid">
                    ${[5, 4, 3, 2, 1].map(v => {
                const opt = v === 5 ? 'A' : v === 4 ? 'B' : v === 3 ? 'C' : v === 2 ? 'D' : 'E';
                const text = q[`opcion${opt}`] || '';
                return `
                            <div class="likert-btn" data-q="${q.id}" data-val="${opt}" onclick="selectLikert(this, ${v})">
                                ${v}
                                <input type="radio" name="q_${q.id}" value="${opt}" required>
                            </div>
                        `;
            }).join('')}
                </div>
                <div style="margin-top:1rem;">
                    <input type="text" name="comment_${q.id}" style="background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:var(--text-muted); width:100%; font-size:0.85rem; padding:0.5rem 0;" placeholder="Anotación específica facultativa...">
                </div>
            `;
            section.appendChild(div);
        });
        container.appendChild(section);
    });
    document.getElementById('evalModal').classList.add('active');
};

window.selectLikert = (el, val) => {
    const qId = el.getAttribute('data-q');
    document.querySelectorAll(`.likert-btn[data-q="${qId}"]`).forEach(b => {
        b.classList.remove('active-5', 'active-1');
        b.style.background = 'rgba(255,255,255,0.03)';
    });
    el.classList.add(val >= 4 ? 'active-5' : (val <= 2 ? 'active-1' : 'active-5'));
    el.querySelector('input').checked = true;
};

window.closeEvaluationModal = () => document.getElementById('evalModal').classList.remove('active');

async function handleSaveEvaluation(e) {
    e.preventDefault();
    const now = new Date().toISOString().split('.')[0]; // Formato compatible: YYYY-MM-DDTHH:mm:ss
    const data = {
        animal: { id: document.getElementById('evalAnimalId').value },
        fechaHora: now,
        fechaInicio: now,
        fechaFin: now,
        recinto: document.getElementById('evalRecinto').value,
        evaluador: document.getElementById('evalEvaluador').value,
        notas: document.getElementById('evalNotes').value,
        respuestasDetalladas: []
    };
    let pts = 0;
    for (const q of currentQuestions) {
        const sel = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (!sel) return alert("Auditoría incompleta.");
        const p = sel.value === 'A' ? 5 : sel.value === 'B' ? 4 : sel.value === 'C' ? 3 : sel.value === 'D' ? 2 : 1;
        data.respuestasDetalladas.push({ pregunta: { id: q.id }, seleccion: sel.value, puntos: p, comentario: document.querySelector(`input[name="comment_${q.id}"]`).value });
        pts += p;
    }
    data.puntuacionGlobal = Math.round((pts / (currentQuestions.length * 5)) * 100);
    try {
        await window.Api.createEvaluation(data);
        alert("Auditoría Sincronizada Correctamente.");
        closeEvaluationModal();
        loadEvaluations(data.animal.id);
    }
    catch (err) {
        console.error(err);
        alert("Error de enlace: " + err.message);
    }
}

window.deleteEvaluation = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;
    try { await window.Api.deleteEvaluation(id); loadEvaluations(document.getElementById('animalFilter').value); }
    catch (e) { alert("Error"); }
};
