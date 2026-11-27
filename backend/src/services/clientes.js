import bcrypt from 'bcryptjs';
import {HttpError} from '../utils/validaciones.js';
import {validarNuevoCliente} from '../utils/clientes.js';
import {porCorreo,crearCliente,listarClientes} from '../repositories/usuarios.js';

// Altas administradas para S15, separadas del registro público ya existente.
export async function crearClienteAdministrado(datos){
 const d=validarNuevoCliente(datos);
 if(await porCorreo(d.correo))throw new HttpError(409,'Este correo ya existe.');
 return crearCliente({nombre:d.nombre,correo:d.correo,hash:await bcrypt.hash(d.password,12),dni:d.dni});
}
export const obtenerClientes=()=>listarClientes();
