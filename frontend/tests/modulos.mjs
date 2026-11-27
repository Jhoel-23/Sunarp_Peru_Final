// Verifica importaciones/exportaciones sin ejecutar páginas ni conectarse a Neon.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
async function recorrer(dir) {
  const files = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...await recorrer(p));
    else if (p.endsWith('.js')) files.push(p);
  }
  return files;
}
const files = await recorrer(path.join(root, 'public', 'sistema', 'js'));
for (const file of files) {
  // Dejar que el enlazador resuelva el grafo completo; una dependencia común
  // (api-entorno.js) se reutiliza sin intentar enlazarla dos veces en paralelo.
  const context = vm.createContext({});
  const cache = new Map();
  async function obtener(p) {
    p = path.resolve(p);
    if (cache.has(p)) return cache.get(p);
    if (p.endsWith(path.join('config', 'neon-config.js'))) {
      const modulo = new vm.SyntheticModule(['sql'], function () { this.setExport('sql', () => {}); }, { context, identifier:p });
      cache.set(p, modulo);
      return modulo;
    }
    const modulo = new vm.SourceTextModule(await fs.readFile(p, 'utf8'), { context, identifier:p });
    cache.set(p, modulo);
    return modulo;
  }
  const principal = await obtener(file);
  await principal.link((spec, ref) => obtener(path.resolve(path.dirname(ref.identifier), spec)));
}

console.log(`OK: ${files.length} archivos JavaScript con importaciones/exportaciones enlazables.`);
