# Bienestar Animal - Frontend

Este directorio contiene la interfaz de usuario para la aplicación de Bienestar Animal.

## Estructura
- **index.html**: Página de inicio de sesión.
- **dashboard.html**: Panel principal.
- **animal.html**: Gestión de animales (CRUD).
- **evaluation.html**: Evaluaciones de bienestar.
- **graphs.html**: Visualización de datos.

## Tecnologías
- HTML5, CSS3, JavaScript (Vanilla ES6).
- [Chart.js](https://www.chartjs.org/) para gráficas (vía CDN).
- Fetch API para comunicación con Backend.

## Cómo Ejecutar
1. Asegúrate de tener el Backend (Spring Boot) corriendo en `http://localhost:8080`.
2. Abre el archivo `index.html` en tu navegador.
   - Puedes usar una extensión como "Live Server" en VS Code para una mejor experiencia.
   - O simplemente doble click en el archivo.

3. **Login**:
   - Si no tienes usuario, el backend debe permitir registro o usa credenciales existentes.
   - Si el backend no está disponible, puedes activar el "Modo Mock" en `js/api.js` cambiando `USE_MOCK_DATA = true`.

## Configuración
Para cambiar la URL del backend, edita `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```
