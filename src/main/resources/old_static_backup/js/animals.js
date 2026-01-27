/* c:/Users/Dani B/Desktop/BienestarAnimal/frontend/js/animals.js */

document.addEventListener('DOMContentLoaded', () => {
    loadAnimals();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadAnimals(e.target.value));
    }
    const animalForm = document.getElementById('animalForm');
    if (animalForm) animalForm.addEventListener('submit', handleSaveAnimal);

    const fotoFile = document.getElementById('fotoFile');
    if (fotoFile) {
        fotoFile.addEventListener('change', (e) => {
            const status = document.getElementById('uploadStatus');
            if (e.target.files.length > 0) {
                status.textContent = `📄 ${e.target.files[0].name} seleccionado.`;
                status.style.display = 'block';
            } else {
                status.style.display = 'none';
            }
        });
    }
});

async function loadAnimals(query = '') {
    const grid = document.getElementById('animalGrid');
    if (!grid) return;

    grid.innerHTML = '<div style="color: var(--text-muted); padding: 2rem;">Accediendo al censo...</div>';

    try {
        const animals = await window.Api.getAnimals();
        const filtered = animals.filter(a =>
            (a.nombre && a.nombre.toLowerCase().includes(query.toLowerCase())) ||
            (a.especie && a.especie.toLowerCase().includes(query.toLowerCase()))
        );

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="glass-panel" style="padding: 3rem; width: 100%; text-align: center; color: var(--text-muted);">Sin coincidencias en el registro operativo.</div>';
            return;
        }

        filtered.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'glass-panel animal-card';

            card.innerHTML = `
                <div class="animal-img-box">
                    <img src="${animal.fotoUrl || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=60&w=600'}" class="animal-img" alt="${animal.nombre}">
                    <div class="img-overlay">
                        <h3 style="color: white; font-size: 1.5rem; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${animal.nombre}</h3>
                        <span class="status-badge">ACTIVO</span>
                    </div>
                </div>
                <div class="animal-info">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">${animal.especie}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">|</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">ID: #${animal.id}</span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${animal.notas || 'No se han registrado observaciones clínicas para este sujeto.'}
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <button onclick="editAnimal(${animal.id})" class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--glass-border); padding: 0.7rem; font-size: 0.85rem;">MODIFICAR</button>
                        <a href="evaluation.html?animalId=${animal.id}" class="btn btn-primary" style="padding: 0.7rem; font-size: 0.85rem; color: var(--base-dark); text-decoration: none; justify-content: center;">AUDITAR</a>
                    </div>
                    <button onclick="deleteAnimal(${animal.id})" style="width:100%; margin-top: 1rem; background:transparent; border:none; color: var(--danger); font-size: 0.7rem; cursor:pointer; opacity: 0.6;">ELIMINAR DEL REGISTRO</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="text-danger">Error de enlace Quantum: ${error.message}</div>`;
    }
}

window.openModal = function (isEdit = false) {
    const modal = document.getElementById('animalModal');
    if (!modal) return;
    if (!isEdit) {
        document.getElementById('animalForm').reset();
        document.getElementById('animalId').value = '';
        document.getElementById('modalTitle').textContent = 'Registro de Sujeto';
        document.getElementById('uploadStatus').style.display = 'none';
    } else {
        document.getElementById('modalTitle').textContent = 'Actualizar Protocolo';
    }
    modal.classList.add('active');
};

window.closeModal = () => document.getElementById('animalModal').classList.remove('active');

window.editAnimal = async function (id) {
    try {
        const animals = await window.Api.getAnimals();
        const animal = animals.find(a => a.id === id);
        if (animal) {
            document.getElementById('animalId').value = animal.id;
            document.getElementById('nombre').value = animal.nombre;
            document.getElementById('especie').value = animal.especie;
            document.getElementById('fechaNacimiento').value = animal.fechaNacimiento;
            document.getElementById('fotoUrl').value = animal.fotoUrl || '';
            document.getElementById('notas').value = animal.notas || '';
            document.getElementById('uploadStatus').style.display = 'none';
            window.openModal(true);
        }
    } catch (err) { alert("Error de recuperación"); }
};

window.deleteAnimal = async function (id) {
    if (!confirm('¿Confirmar baja definitiva del ejemplar?')) return;
    try {
        await window.Api.deleteAnimal(id);
        loadAnimals();
    } catch (err) { alert("Acceso denegado"); }
};

async function handleSaveAnimal(e) {
    e.preventDefault();
    const id = document.getElementById('animalId').value;
    const fotoFileInput = document.getElementById('fotoFile');
    let fotoUrl = document.getElementById('fotoUrl').value;

    try {
        // First - Upload file if exists
        if (fotoFileInput.files && fotoFileInput.files.length > 0) {
            const uploadResult = await window.Api.uploadFile(fotoFileInput.files[0]);
            fotoUrl = uploadResult.url;
        }

        const data = {
            nombre: document.getElementById('nombre').value,
            especie: document.getElementById('especie').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            fotoUrl: fotoUrl,
            notas: document.getElementById('notas').value
        };

        if (id) await window.Api.updateAnimal(id, data);
        else await window.Api.createAnimal(data);

        window.closeModal();
        loadAnimals();
    } catch (err) {
        console.error(err);
        alert("Error de sincronización multimedia: " + err.message);
    }
}
