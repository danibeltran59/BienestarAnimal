import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [installable, setInstallable] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check standalone mode
        const standalone = ('standalone' in window.navigator) && (window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // Check if already installable
        if (window.deferredPrompt) setInstallable(true);

        const handler = () => setInstallable(true);
        window.addEventListener('pwa-installable', handler);

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isDeviceIOS = /iphone|ipad|ipod/.test(userAgent);

        if (isDeviceIOS && !standalone) {
            setIsIOS(true);
        }

        return () => window.removeEventListener('pwa-installable', handler);
    }, []);

    const install = async () => {
        if (isIOS) {
            alert("Para instalar en iPhone:\n1. Pulsa el botón 'Compartir' (cuadrado con flecha)\n2. Selecciona 'Añadir a pantalla de inicio'.");
            return;
        }

        if (!window.deferredPrompt) return;

        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallable(false);
            window.deferredPrompt = null;
        }
    };

    return { installable, isIOS, isStandalone, install };
};
