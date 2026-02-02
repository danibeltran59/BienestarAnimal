/* c:/Users/Dani B/Desktop/BienestarAnimal/frontend/js/api.js */

const API_BASE_URL = window.location.origin + '/api';
// Toggle this to true if backend is not running to use mock data
const USE_MOCK_DATA = false;

// Mock Data Store Class with Safe Storage (Memory Fallback)
class MockStore {
    constructor() {
        this.memoryStore = {};
        this.isStorageAvailable = this._testStorage();
        this.CURRENT_VERSION = '3.0'; // Incrementar para forzar reseteo
        this._initData();
    }

    _testStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    _getItem(key) {
        if (this.isStorageAvailable) return localStorage.getItem(key);
        return this.memoryStore[key];
    }

    _setItem(key, value) {
        if (this.isStorageAvailable) localStorage.setItem(key, value);
        else this.memoryStore[key] = value;
    }

    _initData() {
        // Force reset if version changed or not set
        const savedVersion = this._getItem('mock_data_version');
        if (savedVersion !== this.CURRENT_VERSION) {
            console.log("Detectada versión antigua o nueva instalación. Reseteando datos de demo...");
            if (this.isStorageAvailable) {
                localStorage.clear(); // Borrado total para evitar conflictos
                localStorage.setItem('mock_data_version', this.CURRENT_VERSION);
            } else {
                this.memoryStore = {};
                this.memoryStore['mock_data_version'] = this.CURRENT_VERSION;
            }
        }

        if (!this._getItem('mock_animals')) {
            const initialAnimals = [
                { id: 1, nombre: "Luna", especie: "Perro (Mastín)", fechaNacimiento: "2018-05-12", fotoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300", notas: "Recuperada de abandono. Muy sociable." },
                { id: 2, nombre: "Thor", especie: "Perro (Pastor Alemán)", fechaNacimiento: "2020-02-20", fotoUrl: "https://images.unsplash.com/photo-1589944171255-0691764f6976?auto=format&fit=crop&q=80&w=300", notas: "En entrenamiento de obediencia. Energía alta." },
                { id: 3, nombre: "Mika", especie: "Gato (Siamés)", fechaNacimiento: "2021-11-05", fotoUrl: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=300", notas: "Tímida pero cariñosa. Estado de salud excelente." },
                { id: 4, nombre: "Rex", especie: "Perro (Bóxer)", fechaNacimiento: "2015-08-30", fotoUrl: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=300", notas: "Senior. Requiere dieta especial." },
                { id: 5, nombre: "Nala", especie: "Gato (Común)", fechaNacimiento: "2022-01-15", fotoUrl: "https://images.unsplash.com/photo-1573865667367-59657a41748a?auto=format&fit=crop&q=80&w=300", notas: "Muy juguetona. Recién llegada." }
            ];

            // Añadir más animales hasta llegar a 15
            const extras = ["Simba", "Balu", "Kira", "Milo", "Bella", "Coco", "Lola", "Max", "Toby", "Rocky"];
            extras.forEach((name, i) => {
                initialAnimals.push({
                    id: i + 6,
                    nombre: name,
                    especie: i % 2 === 0 ? "Perro" : "Gato",
                    fechaNacimiento: `201${Math.floor(Math.random() * 8)}-0${Math.floor(Math.random() * 9) + 1}-10`,
                    fotoUrl: "https://via.placeholder.com/300?text=" + name,
                    notas: "Animal de la protectora."
                });
            });

            this._setItem('mock_animals', JSON.stringify(initialAnimals));

            if (!this._getItem('mock_evaluations')) {
                const evaluations = [];
                const now = new Date();

                initialAnimals.forEach(animal => {
                    // Generar 5 evaluaciones por animal con una tendencia
                    const trend = Math.random() > 0.5 ? 2 : -1; // Algunos mejoran, otros empeoran levemente
                    let baseScore = animal.id === 4 ? 45 : 65; // Rex empieza bajo, otros medio

                    for (let i = 0; i < 5; i++) {
                        const date = new Date();
                        date.setDate(now.getDate() - ((5 - i) * 15)); // Una cada 15 días

                        const score = Math.min(100, Math.max(0, baseScore + (i * trend) + Math.floor(Math.random() * 5)));

                        evaluations.push({
                            id: Date.now() + Math.random(),
                            animal: { id: animal.id, nombre: animal.nombre },
                            fecha: date.toISOString(),
                            puntuacionGlobal: score,
                            nivelConfianza: 5,
                            respuestas: Array(18).fill(0).map(() => Math.floor(Math.random() * 3) + 3), // Puntuaciones altas
                            notas: i === 4 ? "Evaluación más reciente de seguimiento." : "Control rutinario."
                        });
                    }
                });
                this._setItem('mock_evaluations', JSON.stringify(evaluations));
            }
        }
    }

    getAnimals() {
        return JSON.parse(this._getItem('mock_animals') || '[]');
    }

    saveAnimals(animals) {
        this._setItem('mock_animals', JSON.stringify(animals));
    }

    getEvaluations() {
        return JSON.parse(this._getItem('mock_evaluations') || '[]');
    }

    saveEvaluations(evals) {
        this._setItem('mock_evaluations', JSON.stringify(evals));
    }
}

const mockStore = new MockStore();

const Api = {
    // --- Preguntas ---
    async getPreguntas() {
        if (USE_MOCK_DATA) return [];
        return this._fetchWithAuth(`${API_BASE_URL}/preguntas`);
    },

    // --- Authentication ---
    async login(email, password) {
        if (USE_MOCK_DATA) {
            return new Promise(resolve => setTimeout(() => resolve({ token: 'mock-jwt-token-12345' }), 300));
        }
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return this._handleResponse(response);
    },

    async register(userData) {
        if (USE_MOCK_DATA) {
            return { message: "Usuario registrado (Mock)" };
        }
        const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return this._handleResponse(response);
    },

    async getCurrentUser() {
        if (USE_MOCK_DATA) {
            return { email: 'mock@test.com', role: 'ADMIN' };
        }
        return this._fetchWithAuth(`${API_BASE_URL}/usuarios/me`);
    },

    // --- Animals ---
    async getAnimals() {
        if (USE_MOCK_DATA) return mockStore.getAnimals();
        return this._fetchWithAuth(`${API_BASE_URL}/animales`);
    },

    async createAnimal(animalData) {
        if (USE_MOCK_DATA) {
            const animals = mockStore.getAnimals();
            const newAnimal = { id: Date.now(), ...animalData };
            animals.push(newAnimal);
            mockStore.saveAnimals(animals);
            return newAnimal;
        }
        return this._fetchWithAuth(`${API_BASE_URL}/animales`, {
            method: 'POST',
            body: JSON.stringify(animalData)
        });
    },

    async updateAnimal(id, animalData) {
        if (USE_MOCK_DATA) {
            const animals = mockStore.getAnimals();
            const index = animals.findIndex(a => a.id == id);
            if (index !== -1) {
                animals[index] = { ...animals[index], ...animalData };
                mockStore.saveAnimals(animals);
                return animals[index];
            }
            throw new Error("Animal no encontrado (Mock)");
        }
        return this._fetchWithAuth(`${API_BASE_URL}/animales/${id}`, {
            method: 'PUT',
            body: JSON.stringify(animalData)
        });
    },

    async deleteAnimal(id) {
        if (USE_MOCK_DATA) {
            const animals = mockStore.getAnimals().filter(a => a.id != id);
            mockStore.saveAnimals(animals);

            // Cleanup related evaluations
            const evals = mockStore.getEvaluations().filter(e => e.animal.id != id);
            mockStore.saveEvaluations(evals);

            return { message: "Eliminado (Mock)" };
        }
        return this._fetchWithAuth(`${API_BASE_URL}/animales/${id}`, {
            method: 'DELETE'
        });
    },

    // --- Evaluations ---
    async getEvaluationsByAnimal(animalId) {
        if (USE_MOCK_DATA) {
            const all = mockStore.getEvaluations();
            // If animalId is null/empty, we might want to return all (Dashboard or general view)
            // But strict implementation implies filtering.
            if (!animalId) return all;
            return all.filter(e => e.animal.id == animalId);
        }
        return this._fetchWithAuth(`${API_BASE_URL}/evaluaciones/animal/${animalId}`);
    },

    // New: Method to get ALL evaluations (useful if filtering "All Animals")
    async getAllEvaluations() {
        if (USE_MOCK_DATA) return mockStore.getEvaluations();
        return this._fetchWithAuth(`${API_BASE_URL}/evaluaciones`);
    },

    async createEvaluation(data) {
        if (USE_MOCK_DATA) {
            const evals = mockStore.getEvaluations();
            // Need to fetch animal name for consistency in UI display
            const animals = mockStore.getAnimals();
            const animal = animals.find(a => a.id == data.animal.id);

            const newEval = {
                id: Date.now(),
                ...data,
                animal: { id: animal.id, nombre: animal ? animal.nombre : 'Desconocido' }
            };
            evals.push(newEval);
            mockStore.saveEvaluations(evals);
            return newEval;
        }
        return this._fetchWithAuth(`${API_BASE_URL}/evaluaciones`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async deleteEvaluation(id) {
        if (USE_MOCK_DATA) {
            const evals = mockStore.getEvaluations().filter(e => e.id != id);
            mockStore.saveEvaluations(evals);
            return { message: "Eliminado (Mock)" };
        }
        return this._fetchWithAuth(`${API_BASE_URL}/evaluaciones/${id}`, {
            method: 'DELETE'
        });
    },

    // --- File Upload ---
    async uploadFile(file) {
        if (USE_MOCK_DATA) return { url: "https://via.placeholder.com/300?text=Mock+Upload" };

        const formData = new FormData();
        formData.append('file', file);

        const token = sessionStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        return this._handleResponse(response);
    },

    // --- Helpers ---
    async _fetchWithAuth(url, options = {}) {
        const token = sessionStorage.getItem('jwt_token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };

        const config = {
            ...options,
            headers: { ...headers, ...options.headers }
        };

        const response = await fetch(url, config);
        return this._handleResponse(response);
    },

    async _handleResponse(response) {
        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                sessionStorage.removeItem('jwt_token');
                window.location.href = 'index.html';
                throw new Error('Unauthorized');
            }
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || `Error ${response.status}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }
};

window.Api = Api;
