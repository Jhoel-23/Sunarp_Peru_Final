// Simulador educativo: el cliente nunca recibe DATABASE_URL ni consulta PostgreSQL directamente.
import {api} from '../config/api.js';
export async function obtenerRegistro(idRegistro){return (await api('/pasarela/solicitudes/'+Number(idRegistro))).solicitud;}
export async function listarPendientesCliente(){return (await api('/pasarela/pendientes')).solicitudes;}
export async function pagarConTarjeta({registro,numero,mes,anio,cvv,marca}){
 return api('/pasarela/tarjeta',{method:'POST',body:{solicitudId:registro.id,numero,mes,anio,cvv,marca}});
}
export async function pagarConBilletera({registro,proveedor,celular,codigoAprobacion}){
 return api('/pasarela/billetera',{method:'POST',body:{solicitudId:registro.id,proveedor,celular,codigoAprobacion}});
}

export async function consultarEstadoPasarela(){return api('/pasarela/configuracion');}
