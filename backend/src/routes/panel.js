import {Router} from 'express';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// La portada del backend es pública y no tiene acceso a datos privados.
const r = Router();
const rutaHtml = fileURLToPath(new URL('../public/panel.html', import.meta.url));
const plantilla = readFileSync(rutaHtml, 'utf8');
const portalPorDefecto = 'https://frontend-two-silk-tt65fgko3r.vercel.app';

function obtenerPortal() {
  const valor = (process.env.FRONTEND_URL || '').trim() || portalPorDefecto;
  try {
    const url = new URL(valor);
    if (url.protocol !== 'https:' || url.username || url.password) return portalPorDefecto;
    return url.origin;
  } catch {
    return portalPorDefecto;
  }
}

r.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  res.type('html').send(plantilla.replaceAll('__PORTAL_URL__', obtenerPortal()));
});

export default r;
