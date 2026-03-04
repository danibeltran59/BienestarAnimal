import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, ExternalLink, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import UserDropdown from '../components/UserDropdown';

const Guides = () => {
    const [guides, setGuides] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch('/api/guias', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar las guías');
            const data = await response.json();
            setGuides(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setButtonLoading = (key, isLoading) => {
        setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
    };

    // Fetch PDF as blob and open in new tab (bypasses service worker navigation interception)
    const handleView = async (url, index) => {
        const key = `view-${index}`;
        if (loadingStates[key]) return;
        setButtonLoading(key, true);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error ${response.status}: No se pudo cargar el PDF`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const newTab = window.open(blobUrl, '_blank');
            if (!newTab) {
                alert('Por favor, permite las ventanas emergentes para ver el PDF.');
            }
            // Clean up blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } catch (err) {
            alert('Error al abrir el PDF: ' + err.message);
        } finally {
            setButtonLoading(key, false);
        }
    };

    // Fetch PDF as blob and trigger download (bypasses service worker)
    const handleDownload = async (url, title, index) => {
        const key = `download-${index}`;
        if (loadingStates[key]) return;
        setButtonLoading(key, true);
        try {
            const response = await fetch(`${url}?download=true`);
            if (!response.ok) throw new Error(`Error ${response.status}: No se pudo descargar el PDF`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${title}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert('Error al descargar el PDF: ' + err.message);
        } finally {
            setButtonLoading(key, false);
        }
    };

    const filteredGuides = guides.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <Layout>
            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando guías...</div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div style={{ padding: '2rem', color: 'var(--danger)' }}>Error: {error}</div>
        </Layout>
    );

    return (
        <Layout>
            <header className="content-header">
                <div>
                    <h1>Guías de Manejo Animal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>EAZA Best Practice Guidelines and Care Manuals</p>
                </div>
                <UserDropdown />
            </header>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} style={{ color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Buscar guías..."
                    className="form-control"
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="dashboard-grid">
                {filteredGuides.map((guide, index) => {
                    const isViewing = loadingStates[`view-${index}`];
                    const isDownloading = loadingStates[`download-${index}`];

                    return (
                        <div
                            key={index}
                            className="glass-panel guide-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '1.5rem',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    flexShrink: 0
                                }}>
                                    <FileText size={28} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        marginBottom: '0.4rem',
                                        lineHeight: '1.4',
                                        fontWeight: '600',
                                        color: 'white',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {guide.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#94a3b8',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Documento PDF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
                                <button
                                    onClick={() => handleView(guide.downloadUrl, index)}
                                    disabled={isViewing}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(56, 189, 248, 0.1)',
                                        color: '#38bdf8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem',
                                        padding: '0.8rem',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(56, 189, 248, 0.2)',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: isViewing ? 'wait' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: isViewing ? 0.7 : 1
                                    }}
                                >
                                    {isViewing
                                        ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando...</>
                                        : <><ExternalLink size={18} /> Ver Guía</>
                                    }
                                </button>
                                <button
                                    onClick={() => handleDownload(guide.downloadUrl, guide.title, index)}
                                    disabled={isDownloading}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem',
                                        padding: '0.8rem',
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)',
                                        cursor: isDownloading ? 'wait' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: isDownloading ? 0.7 : 1,
                                        border: 'none'
                                    }}
                                >
                                    {isDownloading
                                        ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Descargando...</>
                                        : <><Download size={18} /> Descargar</>
                                    }
                                </button>
                            </div>

                            <style>{`
                                .guide-card:hover {
                                    transform: translateY(-4px);
                                    background: rgba(255, 255, 255, 0.08);
                                    border-color: var(--primary);
                                    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
                                }
                                @keyframes spin { to { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    );
                })}
            </div>

            {filteredGuides.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No se encontraron guías que coincidan con "{searchTerm}"
                </div>
            )}
        </Layout>
    );
};

export default Guides;
