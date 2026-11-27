// La conexión PostgreSQL vive EXCLUSIVAMENTE en backend/.env.
// Se conserva este nombre como referencia de migración; no se usa desde el navegador.
// Los módulos activos consultan /api/* mediante js/config/api.js.
throw new Error('No se permite acceder a Neon directamente desde el navegador. Usa /api/*.');
