import {servicios} from '../data/servicios.js';

// El backend mantiene su API de servicios para S14/S15. El frontend muestra solo
// datos informativos, sin precios ni funcionalidades de compra.
const originales=new Map(servicios.map(s=>[s.id,s]));
export function normalizarCatalogo(filas){
 if(!Array.isArray(filas)) return servicios.map(s=>({...s}));
 return filas.filter(s=>s && typeof s.id==='string' && !/\bcitas?\b/i.test(String(s.nombre||''))).map(s=>{
  const original=originales.get(s.id)||{};
  return {
   id:String(s.id),
   nombre:String(s.nombre||original.nombre||s.id),
   descripcion:String(s.descripcion||original.descripcion||''),
   categoria:String(s.categoria||original.categoria||'Servicios registrales'),
   requisitos:original.requisitos||['Consultar requisitos en el sistema'],
   ruta:original.ruta||'/sistema/tramites.html',
   icono:original.icono||'📄'
  };
 });
}
export async function listarServicios(){
 const publico=String(import.meta.env?.VITE_API_URL||'').replace(/\/+$/,'');
 const base=publico?(publico.endsWith('/api')?publico:publico+'/api'):'/api';
 try{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),5000);
  let respuesta;
  try{respuesta=await fetch(base+'/servicios',{signal:controller.signal})}finally{clearTimeout(timer)}
  if(!respuesta.ok)throw new Error('No se pudo consultar el servidor');
  const json=await respuesta.json();
  if(json.origen==='neon')return {servicios:normalizarCatalogo(json.servicios),origen:'neon'};
 }catch { /* El directorio informativo sigue accesible cuando la API está apagada. */ }
 return {servicios:normalizarCatalogo(null),origen:'local'};
}
