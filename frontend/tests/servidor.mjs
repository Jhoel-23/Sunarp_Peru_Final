import {existsSync} from 'node:fs';
if(!existsSync(new URL('../dist/index.html',import.meta.url))){console.log('PENDIENTE: prueba HTTP requiere dist/. Ejecuta npm run build antes.');process.exit(0)}
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const puerto = 18551;
const child = spawn(process.execPath, [new URL('../herramientas/servidor.cjs', import.meta.url).pathname], {
  env: { ...process.env, PORT: String(puerto) }, stdio: ['ignore', 'pipe', 'pipe']
});
try {
  await Promise.race([
    once(child.stdout, 'data'),
    once(child, 'exit').then(() => { throw new Error('No inició el servidor de prueba'); })
  ]);
  const portada = await fetch(`http://127.0.0.1:${puerto}/`);
  assert.equal(portada.status, 200);
  assert.match(await portada.text(), /React|root/i);
  for (const pagina of ['login','registro','consulta','actualizar','pago','comprobante','caja','panel']) {
    const respuesta = await fetch(`http://127.0.0.1:${puerto}/sistema/${pagina}.html`);
    assert.equal(respuesta.status, 200, pagina);
    assert.match(respuesta.headers.get('content-type'), /text\/html/);
    assert.match(await respuesta.text(), /<!DOCTYPE html>/i);
  }
  const js = await fetch(`http://127.0.0.1:${puerto}/sistema/js/pago/pago.js`);
  assert.match(js.headers.get('content-type'), /text\/javascript/);
  assert.equal((await fetch(`http://127.0.0.1:${puerto}/no-existe.html`)).status, 404);
  console.log('OK: servidor local Node, ocho páginas, MIME de módulos y respuesta 404.');
} finally {
  child.kill();
}
