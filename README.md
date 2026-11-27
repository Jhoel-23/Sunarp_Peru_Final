# SUNARP Perú — Sistema de Gestión Registral

**Proyecto académico de Desarrollo Web Full Stack**

Sistema web de gestión de servicios registrales desarrollado con **React, Bootstrap, Node.js, Express y PostgreSQL (Neon)**. Permite gestionar solicitudes, consultar información registral y administrar operaciones mediante una plataforma web.

> **Aviso:** Proyecto desarrollado con fines académicos. No es un sistema oficial de la Superintendencia Nacional de los Registros Públicos (SUNARP).

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React | Desarrollo de la interfaz |
| Vite | Entorno de desarrollo y compilación |
| Bootstrap 5 | Diseño responsive |
| JavaScript | Lógica del frontend y backend |
| Node.js | Ejecución del servidor |
| Express.js | Desarrollo de la API REST |
| PostgreSQL | Base de datos relacional |
| Neon | Alojamiento PostgreSQL en la nube |
| JWT | Autenticación y autorización |
| Render | Despliegue del backend |
| Vercel | Despliegue del frontend |
| Postman | Pruebas de endpoints |

## Arquitectura del sistema

El proyecto utiliza una arquitectura Full Stack que separa el frontend, backend y base de datos.

```text
SUNARP Perú
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── server.js
│   ├── database/
│   └── package.json
│
├── .gitignore
├── package.json
└── render.yaml
```

El frontend consume los servicios proporcionados por la API REST desarrollada con Express, mientras que el backend administra las consultas y operaciones con PostgreSQL en Neon.

## Funcionalidades del sistema

- Inicio de sesión con autenticación JWT.
- Gestión de usuarios y permisos por roles.
- Registro y seguimiento de solicitudes registrales.
- Consulta de partidas e información registral.
- Administración de trámites y estados.
- Gestión de operaciones de caja.
- Módulo académico de pagos simulados, sujeto a configuración.
- Interfaz responsive utilizando Bootstrap.
- Validaciones de formularios.
- API REST para la comunicación entre frontend y backend.

El sistema contempla los roles de cliente, empleado, administrador y cajero.

## Base de datos

Se utiliza **PostgreSQL alojado en Neon**, con tablas como:

- `usuarios`
- `citas_sunarp`
- `historial_estados`
- `pagos`
- `banco_cuentas`
- `banco_tarjetas`
- `billeteras`

La conexión a la base de datos se administra desde el backend utilizando variables de entorno.

## Instalación local

### Requisitos

- Node.js y npm
- Visual Studio Code
- Acceso a una base PostgreSQL compatible
- Git (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jhoel-23/Sunarp_Peru_Final.git
cd Sunarp_Peru_Final
```

### 2. Instalar y ejecutar el backend

```bash
cd backend
npm install
npm run dev
```

Crear previamente el archivo `backend/.env` a partir de `.env.example` y configurar las variables correspondientes.

Ejemplo sin credenciales reales:

```env
PORT=3000
DATABASE_URL=TU_CONEXION_POSTGRESQL
DB_SSL=true
JWT_SECRET=TU_CLAVE_SECRETA_ALEATORIA
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SIMULADOR_PAGOS=false
```

### 3. Instalar y ejecutar el frontend

Desde otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir:

`http://127.0.0.1:5173`

## API REST

Algunas rutas del backend:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/salud` | Verificar el servidor |
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/servicios` | Consultar catálogo de servicios |
| GET | `/api/gestion/solicitudes` | Consultar solicitudes autorizadas |
| GET | `/api/clientes` | Consultar clientes con permisos |

Las operaciones protegidas requieren autenticación y autorización según el rol correspondiente.

## Despliegue en la nube

### Frontend — Vercel

Aplicación React publicada en:

https://sunarp-peru-final.vercel.app

### Backend — Render

API REST publicada en:

https://sunarp-peru-final.onrender.com

Verificación de disponibilidad:

https://sunarp-peru-final.onrender.com/api/salud

### Base de datos — Neon

PostgreSQL administrado mediante Neon, utilizando una conexión segura desde el backend.

## Seguridad

- Autenticación mediante JWT.
- Control de acceso basado en roles.
- Validaciones de entrada en las operaciones.
- Variables privadas mediante archivos `.env`.
- Consultas SQL parametrizadas en los módulos correspondientes.
- Separación entre frontend y backend.
- Los pagos simulados deben ejecutarse únicamente en entornos de prueba aislados.

**Nunca se deben publicar contraseñas, tokens JWT, cadenas privadas de Neon ni archivos `.env` en GitHub.**

## Pruebas

Se utiliza Postman para comprobar el comportamiento de la API REST, incluyendo:

- Respuestas correctas HTTP 200 y 201.
- Validaciones HTTP 400.
- Errores de autenticación HTTP 401.
- Restricciones de permisos HTTP 403.
- Recursos inexistentes HTTP 404.

Las operaciones de escritura deben probarse sobre una base de datos de desarrollo.

## Objetivo académico

El proyecto integra los conocimientos desarrollados durante el curso de Diseño Web, incluyendo desarrollo de componentes con React, arquitectura backend con Node.js, integración de bases de datos PostgreSQL, servicios REST y despliegue de aplicaciones en la nube.

## Autor

**Jhoel-23**

Proyecto académico — Ingeniería de Sistemas e Informática.

---

**SUNARP Perú © 2026 — Proyecto académico no oficial.**
