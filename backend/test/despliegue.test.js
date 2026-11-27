import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const leer=(p)=>readFile(new URL(p,import.meta.url),'utf8');
test('Render escucha en 0.0.0.0 y respeta PORT',async()=>{
 const s=await leer('../src/server.js');assert.match(s,/0\.0\.0\.0/);assert.match(s,/process\.env\.PORT/);
});
test('ruta publica servicios no modifica tablas operacionales',async()=>{
 const s=await leer('../src/routes/servicios.js');assert.match(s,/catalogo_servicios/);assert.doesNotMatch(s,/DROP TABLE|TRUNCATE/i);
});
test('variables privadas no se incluyen en el backend publicado',async()=>{
 const t=await leer('../.env.example');assert.match(t,/DATABASE_URL=/);
 const g=await leer('../../.gitignore');assert.match(g,/\*\*\/\.env/);
});
