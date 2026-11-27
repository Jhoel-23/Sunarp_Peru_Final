import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {exigir,HttpError,soloDni} from '../utils/validaciones.js';
import {porCorreo,crearCliente,modernizarClave} from '../repositories/usuarios.js';
import {firmar,secreto} from '../config/jwt.js';
function quitarClave(u){const {contrasena,...resto}=u;return resto;}
const esBcrypt=(s)=>/^\$2[aby]\$\d{2}\$/.test(s);
export function claveIgual(plana,guardada){
 const a=crypto.createHash('sha256').update(plana).digest();
 const b=crypto.createHash('sha256').update(guardada).digest();
 return crypto.timingSafeEqual(a,b);
}
export async function login({correo,password}={}){
 secreto();exigir(typeof correo==='string'&&typeof password==='string'&&correo.length<=150&&password.length<=128,'Correo y contraseña obligatorios.');
 const u=await porCorreo(correo.trim());
 if(!u)throw new HttpError(401,'Correo o contraseña incorrectos.');
 const ok=esBcrypt(u.contrasena)?await bcrypt.compare(password,u.contrasena):claveIgual(password,u.contrasena);
 if(!ok)throw new HttpError(401,'Correo o contraseña incorrectos.');
 if(!esBcrypt(u.contrasena))await modernizarClave(u.id,u.contrasena,await bcrypt.hash(password,12));
 return {usuario:quitarClave(u),token:firmar(u)};
}
export async function registro({nombre,correo,password,dni}={}){
 secreto();exigir(typeof nombre==='string'&&nombre.trim().length>=3&&nombre.trim().length<=120,'Nombre inválido.');
 exigir(typeof correo==='string'&&correo.length<=150&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()),'Correo no válido.');
 exigir(typeof password==='string'&&password.length>=10&&password.length<=72,'La clave debe tener entre 10 y 72 caracteres.');
 exigir(!dni||soloDni(dni),'El DNI debe tener 8 dígitos.');
 const limpio=correo.trim().toLowerCase();if(await porCorreo(limpio))throw new HttpError(409,'Este correo ya existe.');
 const usuario=await crearCliente({nombre:nombre.trim(),correo:limpio,hash:await bcrypt.hash(password,12),dni});
 return {usuario,token:firmar(usuario)};
}
