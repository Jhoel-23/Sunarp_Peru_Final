import { API_BASE_URL } from '../config/api-entorno.js';
// Autenticación centralizada. Se conserva el diseño original de login.html y login.js.
const CLAVE = 'sunarp_sesion';
const ROLES = ['cliente','empleado','administrador','cajero'];
export function rutaInicioSegunRol(rol){ return {cliente:'registro.html',empleado:'panel.html',administrador:'panel.html',cajero:'caja.html'}[rol] || '/'; }
export function obtenerSesion(){ try { const s=JSON.parse(sessionStorage.getItem(CLAVE)||'null'); return s?.token && ROLES.includes(s.usuario?.rol) ? s.usuario : null; } catch {return null;} }
export function exigirSesion(roles=[]){ const u=obtenerSesion(); if(!u){location.replace('/sistema/login.html');return null;} if(roles.length&&!roles.includes(u.rol)){ alert('No tienes permiso para acceder a esta página.'); location.replace('/');return null;} return u; }
export const exigirRol=(...roles)=>exigirSesion(roles);
export function cerrarSesion(){sessionStorage.removeItem(CLAVE);location.href='/sistema/login.html';}
// Inicio de sesión y registro consumen API; nunca verifican contraseñas en el navegador.
export async function iniciarSesion(correo,contrasena){const r=await fetch(API_BASE_URL+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo,password:contrasena})});const d=await r.json();if(r.status===401)return null;if(!r.ok)throw new Error(d.error||'Acceso denegado');sessionStorage.setItem(CLAVE,JSON.stringify(d));return d.usuario;}
export async function registrarUsuario(nombre,correo,contrasena){const r=await fetch(API_BASE_URL+'/auth/registro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre,correo,password:contrasena})});const d=await r.json();if(!r.ok)throw new Error(d.error||'No se pudo registrar');return d.usuario;}
