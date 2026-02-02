import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';
import { Plus, Search, Camera, Trash2, Edit2, X } from 'lucide-react';

const Animals = () => {
    const [animals, setAnimals] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAnimal, setCurrentAnimal] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', especie: '', fechaNacimiento: '', fotoUrl: '', notas: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnimals();
    }, []);

    const loadAnimals = async () => {
        try {
            const data = await Api.getAnimals();
            setAnimals(data);
        } catch (err) {
            console.error("Error loading animals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (animal = null) => {
        if (animal) {
            setCurrentAnimal(animal);
            setFormData({
                nombre: animal.nombre,
                especie: animal.especie,
                fechaNacimiento: animal.fechaNacimiento ? animal.fechaNacimiento.split('T')[0] : '',
                fotoUrl: animal.fotoUrl || '',
                notas: animal.notas || ''
            });
        } else {
            setCurrentAnimal(null);
            setFormData({ nombre: '', especie: '', fechaNacimiento: '', fotoUrl: '', notas: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAnimal(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentAnimal) {
                await Api.updateAnimal(currentAnimal.id, formData);
            } else {
                await Api.createAnimal(formData);
            }
            handleCloseModal();
            loadAnimals();
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
            try {
                await Api.deleteAnimal(id);
                loadAnimals();
            } catch (err) {
                alert("Error al eliminar: " + err.message);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const res = await Api.uploadFile(file);
            setFormData({ ...formData, fotoUrl: res.url });
        } catch (err) {
            alert("Error al subir archivo: " + err.message);
        }
    };

    const filteredAnimals = animals.filter(a =>
        a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        a.especie?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Censo Operativo</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administración de sujetos bajo custodia</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <Plus size={20} /> Registrar Nuevo
                    </button>
                    <UserDropdown />
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '1rem', margin: 'bottom 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} style={{ color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    className="form-control"
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem' }}
                    placeholder="Localizar por nombre o especie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                {filteredAnimals.map(animal => (
                    <div key={animal.id} className="glass-panel animal-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src={animal.fotoUrl || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                                alt={animal.nombre}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>{animal.nombre}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{animal.especie}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleOpenModal(animal)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(animal.id)} className="btn" style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--base-card)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{animal.notas || 'Sin notas adicionales.'}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nac: {animal.fechaNacimiento ? new Date(animal.fechaNacimiento).toLocaleDateString() : '--'}</span>
                                <span className="status-badge" style={{ padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.7rem', background: 'rgba(190, 242, 100, 0.1)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>REGISTRADO</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2.5rem', background: 'var(--base-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ color: 'var(--primary)', margin: 0 }}>Ficha Bio-Digital</h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Identificador / Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Taxonomía / Especie</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.especie}
                                        onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.fechaNacimiento}
                                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Registro Fotográfico</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', border: '1px dashed var(--primary)', flex: 1, cursor: 'pointer' }}>
                                        <Camera size={16} /> Subir
                                        <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                                    </label>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ó</div>
                                    <input
                                        type="url"
                                        className="form-control"
                                        style={{ flex: 1.5 }}
                                        placeholder="URL de Imagen"
                                        value={formData.fotoUrl}
                                        onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                                    />
                                </div>
                                {formData.fotoUrl && <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--accent)' }}>Recurso listo.</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notas de Campo</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button type="button" onClick={handleCloseModal} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Sincronizar Datos</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Animals;
