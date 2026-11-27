import { API_BASE_URL } from './api-entorno.js';
export async function api(ruta,{method='GET',body}={}){
 let sesion;try{sesion=JSON.parse(sessionStorage.getItem('sunarp_sesion')||'null')}catch{}
 if(!sesion?.token)throw new Error('Debes iniciar sesión.');
 const r=await fetch(API_BASE_URL+ruta,{method,headers:{'Authorization':'Bearer '+sesion.token,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Error HTTP '+r.status);return d;
}
