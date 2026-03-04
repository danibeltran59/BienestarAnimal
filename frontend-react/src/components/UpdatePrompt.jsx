import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { RefreshCw, X } from 'lucide-react';

const UpdatePrompt = () => {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [updateSW, setUpdateSW] = useState(null);

    useEffect(() => {
        const update = registerSW({
            onNeedRefresh() {
                setNeedRefresh(true);
            },
            onOfflineReady() {
                console.log('App ready to work offline');
            },
        });
        setUpdateSW(() => update);
    }, []);

    if (!needRefresh) return null;

    return (
        <div className="update-toast glass-panel">
            <div className="update-toast-content">
                <RefreshCw size={20} className="spin-on-hover" />
                <div className="update-text">
                    <strong>Nueva versión disponible</strong>
                    <p>Actualiza para ver los últimos cambios.</p>
                </div>
            </div>
            <div className="update-toast-actions">
                <button
                    onClick={() => updateSW && updateSW(true)}
                    className="btn btn-primary btn-sm"
                >
                    ACTUALIZAR
                </button>
                <button
                    onClick={() => setNeedRefresh(false)}
                    className="btn-icon-close"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default UpdatePrompt;
