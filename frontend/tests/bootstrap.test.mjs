import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const leer=r=>readFile(new URL(r,import.meta.url),'utf8');
const bootstrap=await leer('../public/assets/bootstrap/bootstrap.min.css');
assert.match(bootstrap,/Bootstrap  v5\.3\.6/);
const index=await leer('../index.html');
assert.match(index,/assets\/bootstrap\/bootstrap\.min\.css/);
const inicio=await leer('../src/pages/Inicio.jsx');
assert.match(inicio,/row g-3/);
assert.match(inicio,/col-12 col-md-6 col-xl-3/);
const nav=await leer('../src/components/Encabezado.jsx');
assert.match(nav,/aria-expanded=\{menuAbierto\}/);
assert.match(nav,/sunarp-nav-bootstrap/);
const busca=await leer('../src/components/Buscador.jsx');
assert.match(busca,/form-control/);
for (const page of ['login','registro','consulta','pago','panel','caja','contacto','tramites']){
 const html=await leer('../public/sistema/'+page+'.html');
 assert.match(html,/assets\/bootstrap\/bootstrap\.min\.css/,page+' carga Bootstrap');
}
const pago=await leer('../public/sistema/pago.html');
assert.match(pago,/estado-pasarela/);
console.log('OK: Bootstrap local, grid responsive, menú móvil, formularios y pasarela original.');
