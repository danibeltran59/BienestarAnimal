import axios from 'axios';

const USE_MOCK_DATA = false;

// Mock Data Store Class with Safe Storage (Memory Fallback)
class MockStore {
    constructor() {
        this.memoryStore = {};
        this.isStorageAvailable = this._testStorage();
        this.CURRENT_VERSION = '3.0';
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
        const savedVersion = this._getItem('mock_data_version');
        if (savedVersion !== this.CURRENT_VERSION) {
            if (this.isStorageAvailable) {
                localStorage.clear();
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
                    const trend = Math.random() > 0.5 ? 2 : -1;
                    let baseScore = animal.id === 4 ? 45 : 65;

                    for (let i = 0; i < 5; i++) {
                        const date = new Date();
                        date.setDate(now.getDate() - ((5 - i) * 15));

                        const score = Math.min(100, Math.max(0, baseScore + (i * trend) + Math.floor(Math.random() * 5)));

                        evaluations.push({
                            id: Date.now() + Math.random(),
                            animal: { id: animal.id, nombre: animal.nombre },
                            fecha: date.toISOString(),
                            puntuacionGlobal: score,
                            nivelConfianza: 5,
                            respuestas: Array(18).fill(0).map(() => Math.floor(Math.random() * 3) + 3),
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

    getEvaluationById(id) {
        const evals = this.getEvaluations();
        return evals.find(e => e.id == id);
    }
}

const mockStore = new MockStore();

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor for JWT token
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for unauthorized errors
api.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            sessionStorage.removeItem('jwt_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const Api = {
    // --- Authentication ---
    async login(email, password) {
        if (USE_MOCK_DATA) {
            return new Promise(resolve => setTimeout(() => resolve({ token: 'mock-jwt-token-12345' }), 300));
        }
        return api.post('/usuarios/login', { email, password });
    },

    async register(userData) {
        if (USE_MOCK_DATA) {
            return { message: "Usuario registrado (Mock)" };
        }
        return api.post('/usuarios/register', userData);
    },

    async getCurrentUser() {
        if (USE_MOCK_DATA) {
            return { email: 'mock@test.com', role: 'ADMIN' };
        }
        return api.get('/usuarios/me');
    },

    // --- Animals ---
    async getAnimals() {
        if (USE_MOCK_DATA) return mockStore.getAnimals();
        return api.get('/animales');
    },

    async createAnimal(animalData) {
        if (USE_MOCK_DATA) {
            const animals = mockStore.getAnimals();
            const newAnimal = { id: Date.now(), ...animalData };
            animals.push(newAnimal);
            mockStore.saveAnimals(animals);
            return newAnimal;
        }
        return api.post('/animales', animalData);
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
        return api.put(`/animales/${id}`, animalData);
    },

    async deleteAnimal(id) {
        if (USE_MOCK_DATA) {
            const animals = mockStore.getAnimals().filter(a => a.id != id);
            mockStore.saveAnimals(animals);
            const evals = mockStore.getEvaluations().filter(e => e.animal.id != id);
            mockStore.saveEvaluations(evals);
            return { message: "Eliminado (Mock)" };
        }
        return api.delete(`/animales/${id}`);
    },

    // --- Evaluations ---
    async getEvaluationsByAnimal(animalId) {
        if (USE_MOCK_DATA) {
            const all = mockStore.getEvaluations();
            if (!animalId) return all;
            return all.filter(e => e.animal.id == animalId);
        }
        return api.get(`/evaluaciones/animal/${animalId}`);
    },

    async getAllEvaluations() {
        if (USE_MOCK_DATA) return mockStore.getEvaluations();
        return api.get('/evaluaciones');
    },

    async createEvaluation(data) {
        if (USE_MOCK_DATA) {
            const evals = mockStore.getEvaluations();
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
        return api.post('/evaluaciones', data);
    },

    async deleteEvaluation(id) {
        if (USE_MOCK_DATA) {
            const evals = mockStore.getEvaluations().filter(e => e.id != id);
            mockStore.saveEvaluations(evals);
            return { message: "Eliminado (Mock)" };
        }
        return api.delete(`/evaluaciones/${id}`);
    },

    async getEvaluationById(id) {
        if (USE_MOCK_DATA) return mockStore.getEvaluationById(id);
        return api.get(`/evaluaciones/${id}`);
    },

    async getQuestions() {
        if (USE_MOCK_DATA) {
            // Mock questions matching the backend structure
            return [
                { id: 1, texto: "¿El animal presenta buena condición corporal?", categoria: "NUTRICIÓN", opcionA: "Excelente", puntosA: 5, opcionB: "Bueno", puntosB: 4, opcionC: "Regular", puntosC: 3, opcionD: "Pobre", puntosD: 2, opcionE: "Muy Pobre", puntosE: 1 },
                // ... minimal mock set for dev if needed, but we rely on backend mostly
            ];
        }
        return api.get('/preguntas');
    },

    // --- File Upload ---
    async uploadFile(file) {
        if (USE_MOCK_DATA) return { url: "https://via.placeholder.com/300?text=Mock+Upload" };

        const formData = new FormData();
        formData.append('file', file);

        return api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
