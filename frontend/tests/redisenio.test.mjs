import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const leer=p=>readFile(new URL(p,import.meta.url),'utf8');
const app=await leer('../src/App.jsx');
const inicio=await leer('../src/pages/Inicio.jsx');
const header=await leer('../src/components/Encabezado.jsx');
const servicios=await leer('../src/pages/Servicios.jsx');
const estilos=await leer('../src/App.css');
assert.match(app,/const rutas=\['inicio','servicios','guia'\]/);
assert.match(inicio,/hero-principal/);
assert.match(inicio,/col-12 col-md-6 col-xl-3/);
assert.match(header,/aria-expanded=\{menuAbierto\}/);
assert.match(header,/sunarp-nav-bootstrap/);
assert.match(estilos,/max-width:767\.98px/);
assert.match(servicios,/listarServicios/);
for(const nombre of ['login','registro','pago','panel','caja','consulta','tramites','consulta-partida','contacto','actualizar','comprobante']){
 const html=await leer('../public/sistema/'+nombre+'.html');
 assert.match(html,/redisenio\.css/,nombre+' carga la identidad compartida');
 assert.match(html,/<body class="sunarp-redisenado/,nombre+' marcada como página legada');
 assert.match(html,/<script[^>]+src="js\//,nombre+' conserva su módulo JavaScript');
}
assert.match(await leer('../public/sistema/index.html'),/url=\//);
assert.match(await leer('../public/sistema/css/redisenio.css'),/sunarp-clasico/);
console.log('OK: 11 páginas originales comparten estilos, inicio único, rutas y lógica preservados.');
