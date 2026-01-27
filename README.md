# Bienestar Animal - Sistema de Gestión Operativa

Este proyecto es una plataforma integral diseñada para la gestión, monitoreo y auditoría del bienestar animal en entornos controlados (zoológicos, santuarios o centros de conservación). Combina una arquitectura robusta en el backend con una interfaz de usuario moderna y dinámica.

## 1. Descripción General
La aplicación permite digitalizar el censo de fauna, realizar auditorías técnicas basadas en protocolos internacionales (como Welfare Quality) y visualizar métricas de salud y comportamiento en tiempo real. El sistema incluye gestión de usuarios mediante seguridad JWT y una arquitectura desacoplada que facilita el mantenimiento y la escalabilidad.

## 2. Tecnologías y Arquitectura
El proyecto sigue un patrón de **arquitectura desacoplada**, separando completamente la lógica de negocio (Backend) de la interfaz de usuario (Frontend).

### Backend (API REST)
- **Spring Boot 3.x**: Núcleo de la aplicación.
- **Spring Security + JWT**: Sistema de seguridad basado en tokens (sin sesiones de servidor), siguiendo estándares modernos de SPAs.
- **Hibernate / JPA**: Capa de persistencia para el mapeo objeto-relacional (ORM).
- **Maven**: Gestión de construcción y dependencias.

### Frontend (SPA)
- **React + Vite**: Framework de interfaz de usuario para una navegación instantánea y reactiva.
- **Axios**: Comunicación asíncrona con el backend.
- **Chart.js**: Motor de visualización para inteligencia de datos.

---

## 3. Gestión y Configuración de la Base de Datos
El sistema utiliza una estrategia **Code First**, lo que significa que el código Java es la fuente de verdad para la estructura de la base de datos MySQL.

### Inicialización Automática
1.  **Generación de Tablas**: Hibernate analiza las entidades Java y crea/actualiza las tablas en MySQL automáticamente al arrancar.
2.  **Siembra de Datos (DataLoader)**: Al iniciar la app, se ejecuta automáticamente la clase `DataLoader.java` que:
    - Inserta las preguntas del protocolo técnico de bienestar.
    - Crea usuarios de prueba (`admin` y `cuidador`).
    - Genera **datos simulados** (animales y evaluaciones históricas) para que el sistema sea funcional y visual desde el primer momento.

---

## 4. Instalación y Puesta en Marcha (Entorno Unificado)
Para tu comodidad, el proyecto ha sido **unificado**. El servidor de Spring Boot ya contiene y sirve la aplicación de React.

1.  **Requisitos**: Asegúrate de tener **MySQL** activo con la base de datos `bienestaranimal`.
2.  **Ejecución**: Ejecuta el proyecto desde tu IDE o con `./mvnw spring-boot:run` en la raíz.
3.  **Acceso**: Abre tu navegador en **`http://localhost:8080`**.

> [!TIP]
> No necesitas ejecutar el frontend de forma independiente. El backend se encarga de servir la interfaz moderna e inteligente de forma automática.

---

## 5. Estrategia de Despliegue (Producción)
Si deseas realizar cambios en el frontend y volver a integrarlos:
1.  **Build**: `cd frontend-react && npm run build`.
2.  **Integración**: Copia el contenido de `dist` a `src/main/resources/static`.
3.  **Empaquetado**: `mvn clean package` genera un `.jar` único con todo incluido.

---

## 6. Endpoints Principales de la API
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Autenticación y entrega de Token JWT. |
| GET | `/api/animales` | Listado del censo de fauna. |
| GET | `/api/evaluaciones` | Historial de auditorías técnicas. |

---

## 7. Propósito Académico
Este proyecto ha sido desarrollado como trabajo final para la asignatura de **Desarrollo de Aplicaciones Web**. Su propósito es demostrar la integración profesional de un stack Full Stack moderno y la digitalización de protocolos técnicos de bienestar animal.

**Autor:** [Daniel Beltrán Ruiz]
**Fecha:** Enero 2026
