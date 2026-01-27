// Auth Logic
// Relies on window.Api exposed by api.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Toggles
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.login-card:not(#registerCard)').classList.add('hidden');
            document.getElementById('registerCard').classList.remove('hidden');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerCard').classList.add('hidden');
            document.querySelector('.login-card:not(#registerCard)').classList.remove('hidden');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const errorMsg = document.getElementById('regErrorMessage');

    try {
        if (errorMsg) errorMsg.classList.add('hidden');

        await window.Api.register({ nombre, email, password });

        // Auto login or ask to login? Let's ask to login for simplicity or auto-login
        alert("¡Cuenta creada exitosamente! Por favor inicia sesión.");
        document.getElementById('showLogin').click();

    } catch (error) {
        console.error(error);
        if (errorMsg) {
            errorMsg.textContent = "Error al registrarse: " + error.message;
            errorMsg.classList.remove('hidden');
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    try {
        if (errorMsg) errorMsg.classList.add('hidden');

        const data = await window.Api.login(email, password);

        // Handle token - backend might return object or string
        const token = data.token ? data.token : (typeof data === 'string' ? data : null);

        if (token) {
            localStorage.setItem('jwt_token', token);
            window.location.href = 'dashboard.html';
        } else {
            throw new Error("Token no recibido");
        }
    } catch (error) {
        console.error(error);
        if (errorMsg) {
            errorMsg.textContent = "Credenciales inválidas o error de conexión.";
            errorMsg.classList.remove('hidden');
        }
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('jwt_token');
    window.location.href = 'index.html';
}
