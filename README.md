# TP3 - Gestion de vehiculos, conductores y viajes

**Alumno:** Leonel Ochoa  
**Materia:** Programacion IV - UTN FR La Rioja

Aplicacion para registrar vehiculos, conductores y viajes de una empresa de transporte.

## Estructura

- `backend/` - API REST con Express.js y MySQL
- `frontend/` - Cliente con Vite + React
- `enunciado-TP3-2026.pdf` - Enunciado del trabajo practico

## Requisitos principales

- Autenticacion JWT (expiracion 4 horas) y Passport
- Contrasenas con bcrypt
- Validaciones con express-validator
- Archivos `.http` para pruebas de la API
- `schema.sql` con la definicion de tablas
- CSS puro en el frontend (sin librerias de estilos)

## Como ejecutar

### 1) Base de datos

1. Abrir MySQL Workbench
2. Ejecutar el archivo `backend/schema.sql`

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

La API queda en `http://localhost:3000`  
(usa `npm run dev` para cargar el `.env` automaticamente)

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador la URL que muestra Vite (ej. `http://127.0.0.1:5173`).

## Endpoints principales

- `POST /auth/register` y `POST /auth/login`
- CRUD `/vehiculos`, `/conductores`, `/viajes` (requieren Bearer token)
- Historial: `GET /vehiculos/:id/viajes`, `GET /conductores/:id/viajes`
- Totales km: `GET /vehiculos/:id/km`, `GET /conductores/:id/km`

Hay archivos `.http` en `backend/` para probar la API.
