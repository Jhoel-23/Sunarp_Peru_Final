import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validarNuevoCliente} from '../src/utils/clientes.js';

test('Validaciones de alta cliente: evita datos incompletos',()=>{
 assert.throws(()=>validarNuevoCliente({nombre:'X',correo:'invalido',password:'123'}),{status:400});
 const ok=validarNuevoCliente({nombre:'Ciudadano Demo',correo:' C@Example.Test ',password:'DemoPruebas123',dni:'12345678'});
 assert.equal(ok.correo,'c@example.test');
 assert.equal(ok.dni,'12345678');
});
test('Acceso a clientes protegido por JWT y rol administrador',async()=>{
 const route=await readFile(new URL('../src/routes/clientes.js',import.meta.url),'utf8');
 assert.match(route,/r\.use\(autenticar,roles\('administrador'\)\)/);
});
test('Existe GET detalle, PUT administración y ruta clientes',async()=>{
 const ruta=await readFile(new URL('../src/routes/servicios.js',import.meta.url),'utf8');
 const ges=await readFile(new URL('../src/routes/gestion.js',import.meta.url),'utf8');
 const cli=await readFile(new URL('../src/routes/clientes.js',import.meta.url),'utf8');
 assert.match(ruta,/r\.get\('\/:id'/);
 assert.match(ges,/r\.put\('\/solicitudes\/:id'/);
 assert.match(cli,/roles\('administrador'\)/);
});
test('Colección S15 contiene operaciones CRUD y pruebas automáticas',async()=>{
 const d=JSON.parse(await readFile(new URL('../../postman/SUNARP_S15.postman_collection.json',import.meta.url),'utf8'));
 const paths=d.item.flatMap(x=>x.item);
 for(const method of ['GET','POST','PUT','DELETE'])assert.ok(paths.some(x=>x.request.method===method));
 for(const x of paths)assert.ok(x.event.some(e=>e.listen==='test'&&e.script.exec.some(t=>t.includes('pm.test'))));
 assert.ok(!JSON.stringify(d).includes('eyJhbGciOi'));
});
