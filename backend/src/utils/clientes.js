import {exigir,soloDni} from './validaciones.js';
export function validarNuevoCliente(datos){
 const d=datos||{};
 exigir(typeof d.nombre==='string'&&d.nombre.trim().length>=3&&d.nombre.trim().length<=120,'Nombre inválido.');
 exigir(typeof d.correo==='string'&&d.correo.trim().length<=150&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim()),'Correo inválido.');
 exigir(typeof d.password==='string'&&d.password.length>=10&&d.password.length<=72,'La contraseña debe tener entre 10 y 72 caracteres.');
 exigir(!d.dni||soloDni(d.dni),'DNI inválido.');
 return {nombre:d.nombre.trim(),correo:d.correo.trim().toLowerCase(),password:d.password,dni:d.dni||null};
}
