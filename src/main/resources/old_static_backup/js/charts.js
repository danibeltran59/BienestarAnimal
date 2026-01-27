/* c:/Users/Dani B/Desktop/BienestarAnimal/frontend/js/charts.js */

let historyChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadAnimalsIntoSelect();

    document.getElementById('graphAnimalSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            loadChartData(e.target.value);
        }
    });
});

async function loadAnimalsIntoSelect() {
    try {
        const animals = await window.Api.getAnimals();
        const select = document.getElementById('graphAnimalSelect');
        animals.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.nombre;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error("Error loading animals for charts", e);
    }
}

async function loadChartData(animalId) {
    try {
        const evaluations = await window.Api.getEvaluationsByAnimal(animalId);
        if (!evaluations || evaluations.length === 0) return;

        // 1. History Chart (Line)
        evaluations.sort((a, b) => new Date(a.fechaHora || a.fecha) - new Date(b.fechaHora || b.fecha));
        const labels = evaluations.map(e => new Date(e.fechaHora || e.fecha).toLocaleDateString());
        const dataPoints = evaluations.map(e => e.puntuacionGlobal);
        renderHistoryChart(labels, dataPoints);

        // 2. Category Chart (Radar) - Using the latest evaluation
        const latest = evaluations[evaluations.length - 1];
        if (latest.respuestasDetalladas) {
            const catData = processCategoryData(latest.respuestasDetalladas);
            renderCategoryChart(catData.labels, catData.scores);
        }

    } catch (error) {
        console.error("Error loading chart data", error);
    }
}

function processCategoryData(respuestas) {
    const cats = {};
    respuestas.forEach(r => {
        const cat = r.pregunta.categoria;
        if (!cats[cat]) cats[cat] = { total: 0, count: 0 };
        cats[cat].total += r.puntos;
        cats[cat].count += 1;
    });

    const labels = Object.keys(cats);
    const scores = labels.map(l => {
        const avg = cats[l].total / (cats[l].count * 3); // Max points per question is 3
        return Math.round(avg * 100);
    });

    return { labels, scores };
}

function renderHistoryChart(labels, dataPoints) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (historyChart) historyChart.destroy();

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Puntuación Global',
                data: dataPoints,
                borderColor: '#008080',
                backgroundColor: 'rgba(0, 128, 128, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

function renderCategoryChart(labels, scores) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bienestar por Categoría (%)',
                data: scores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}
