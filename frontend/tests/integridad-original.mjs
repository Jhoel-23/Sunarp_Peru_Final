import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const archivos=JSON.parse(await readFile(new URL('./integridad-original.json',import.meta.url),'utf8'));
for(const [ruta,hash] of Object.entries(archivos)){
 const bytes=await readFile(new URL('../'+ruta,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,'Archivo operativo original modificado: '+ruta);
}
console.log(`OK: ${Object.keys(archivos).length} archivos JavaScript y CSS originales preservados sin cambios.`);
