import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
let sesion=null,redireccion=null,respuestas=[];
const alertas=[];
const ctx=vm.createContext({
 sessionStorage:{getItem:()=>sesion,setItem:(k,v)=>sesion=v,removeItem:()=>sesion=null},
 location:{replace:r=>redireccion=r,href:''},
 alert:t=>alertas.push(t),
 fetch:async(ruta,opciones)=>{respuestas.push({ruta,opciones});return {status:200,ok:true,json:async()=>({token:'token-valido',usuario:{id:3,rol:'cliente',nombre:'Ana'}})}}
});
const source=await fs.readFile(new URL('../public/sistema/js/auth/auth.js',import.meta.url),'utf8');
const moduloUrl=new vm.SyntheticModule(['API_BASE_URL'],function(){this.setExport('API_BASE_URL','/api')},{context:ctx});
const mod=new vm.SourceTextModule(source,{context:ctx});
await mod.link(spec=>{
 if(spec==='../config/api-entorno.js')return moduloUrl;
 throw Error('El login no debe importar Neon ni otros módulos ajenos a configuración pública.');
});
await mod.evaluate();
const a=mod.namespace;
assert.equal(a.rutaInicioSegunRol('cliente'),'registro.html');
assert.equal(a.rutaInicioSegunRol('empleado'),'panel.html');
assert.equal(a.rutaInicioSegunRol('administrador'),'panel.html');
assert.equal(a.rutaInicioSegunRol('cajero'),'caja.html');
for(const rol of ['cliente','empleado','administrador','cajero']){
 sesion=JSON.stringify({token:'test-token',usuario:{id:1,rol,nombre:'Usuario de prueba'}});
 assert.equal(Boolean(a.exigirRol('cajero','administrador')),['cajero','administrador'].includes(rol));
 assert.equal(Boolean(a.exigirRol('cliente')),rol==='cliente');
}
sesion=null;assert.equal(a.exigirSesion(),null);assert.equal(redireccion,'/sistema/login.html');
const u=await a.iniciarSesion('test@ejemplo.com','clave123456');assert.equal(u.rol,'cliente');assert.equal(JSON.parse(sesion).token,'token-valido');
assert.equal(respuestas[0].ruta,'/api/auth/login');
assert.equal(JSON.parse(respuestas[0].opciones.body).correo,'test@ejemplo.com');
a.cerrarSesion();assert.equal(sesion,null);
console.log('OK: login único con API, sesión autenticada y cuatro roles.');
