import {query} from '../config/db.js';
const PUBLICOS='id,nombre,correo,rol,turno,dni';
export async function porCorreo(correo){const r=await query(`SELECT ${PUBLICOS},contrasena FROM usuarios WHERE lower(correo)=lower($1) LIMIT 1`,[correo]);return r.rows[0]||null;}
export async function porId(id){const r=await query(`SELECT ${PUBLICOS} FROM usuarios WHERE id=$1`,[id]);return r.rows[0]||null;}
export async function crearCliente({nombre,correo,hash,dni}){const r=await query(`INSERT INTO usuarios(nombre,correo,contrasena,rol,dni) VALUES($1,$2,$3,'cliente',$4) RETURNING ${PUBLICOS}`,[nombre,correo,hash,dni||null]);return r.rows[0];}
export async function modernizarClave(id,original,hash){await query('UPDATE usuarios SET contrasena=$1 WHERE id=$2 AND contrasena=$3',[hash,id,original]);}

// Datos administrativos mínimos: jamás devolver hashes de contraseñas.
export async function listarClientes(){
 const r=await query(`SELECT id,nombre,correo,rol,dni,fecha_registro
 FROM usuarios WHERE rol='cliente' ORDER BY id DESC LIMIT 100`);
 return r.rows;
}
