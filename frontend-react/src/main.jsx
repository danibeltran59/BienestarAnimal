import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
// Global diagnostic catcher for unexpected mobile crashes
window.onerror = function (message, source, lineno, colno, error) {
    alert("CRITICAL ERROR: " + message + "\nAt: " + source + ":" + lineno);
    return false;
};

// Global PWA Install Prompt Handler
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    window.dispatchEvent(new Event('pwa-installable'));
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
