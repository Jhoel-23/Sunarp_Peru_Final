import {Router} from 'express';
import crypto from 'node:crypto';
import {db,query} from '../config/db.js';
import {autenticar,roles} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
import {exigir,HttpError,soloDni,paginacion,esFechaISO,tarifa} from '../utils/validaciones.js';
import {contar} from '../repositories/solicitudes.js';
const r=Router();r.use(autenticar,roles('empleado','administrador'));
const validoId=v=>{const n=Number(v);exigir(Number.isSafeInteger(n)&&n>0,'ID inválido.');return n;};
const estados=['registrado','rechazado','cancelado'];
function validarDatos(d){
 exigir(typeof d.nombre==='string'&&d.nombre.trim().length>=3&&d.nombre.length<=120,'Nombre inválido.');
 exigir(soloDni(d.dni),'DNI de 8 dígitos obligatorio.');
 exigir(typeof d.oficina==='string'&&d.oficina.trim().length>=3&&d.oficina.length<=120,'Oficina inválida.');
 exigir(esFechaISO(d.fechaCita),'Fecha inválida.');
 exigir(typeof d.horario==='string'&&d.horario.trim().length>=3&&d.horario.length<=50,'Horario inválido.');
 exigir(!d.celular||(/^\d{9,15}$/.test(d.celular)),'Celular inválido.');
 return paginacion(d.paginas);
}
r.get('/permiso',asincrono(async(req,res)=>{const q=await query('SELECT c24_puede_gestionar($1) AS permitido',[req.usuario.id]);res.json({permitido:Boolean(q.rows[0]?.permitido)});}));
r.get('/historial',asincrono(async(req,res)=>{const q=await query(`SELECT h.*,u.nombre FROM historial_estados h LEFT JOIN usuarios u ON u.id=h.usuario_id ORDER BY h.id DESC LIMIT 40`);res.json({historial:q.rows});}));
r.get('/solicitudes',asincrono(async(req,res)=>{const q=await query(`SELECT r.*,(SELECT p.codigo_operacion FROM pagos p WHERE p.id_registro=r.id AND p.estado='aprobado' ORDER BY p.id DESC LIMIT 1) AS codigo_operacion,EXISTS(SELECT 1 FROM pagos h WHERE h.id_registro=r.id) AS tiene_historial FROM citas_sunarp r ORDER BY r.fecha_registro DESC,r.id DESC LIMIT 200`);res.json({solicitudes:q.rows});}));
r.get('/indicadores',asincrono(async(req,res)=>res.json({indicadores:await contar()})));
r.get('/solicitudes/:id',asincrono(async(req,res)=>{const id=validoId(req.params.id);const q=await query('SELECT * FROM citas_sunarp WHERE id=$1',[id]);if(!q.rowCount)throw new HttpError(404,'No existe esta solicitud.');res.json({solicitud:q.rows[0]});}));
r.post('/solicitudes',asincrono(async(req,res)=>{const d=req.body||{};const n=validarDatos(d);const codigo='SUN24-'+crypto.randomUUID().slice(0,13).toUpperCase();const q=await query(`INSERT INTO citas_sunarp(codigo_seguimiento,nombre_usuario,dni,tipo_tramite,oficina,fecha_cita,horario,celular,id_usuario,estado,paginas,monto_calculado,estado_pago) VALUES($1,$2,$3,'Expedición de vigencia de poder',$4,$5,$6,$7,NULL,'registrado',$8,$9,'pendiente') RETURNING *`,[codigo,d.nombre.trim(),d.dni,d.oficina.trim(),d.fechaCita,d.horario.trim(),d.celular||null,n,tarifa(n)]);res.status(201).json({solicitud:q.rows[0]});}));
const actualizarSolicitud=asincrono(async(req,res)=>{
 const id=validoId(req.params.id),d=req.body||{};exigir(estados.includes(d.estado),'Estado no permitido.');
 const c=await db().connect();try{
  await c.query('BEGIN');const q=await c.query('SELECT * FROM citas_sunarp WHERE id=$1 FOR UPDATE',[id]);const anterior=q.rows[0];if(!anterior)throw new HttpError(404,'Solicitud inexistente.');
  exigir(!anterior.firma_digital_fecha,'Una solicitud firmada no se puede editar.',409);
  if(anterior.estado_pago==='pendiente'){
   const n=validarDatos(d);await c.query('SELECT c24_exigir_pendiente($1)',[id]);
   await c.query(`UPDATE citas_sunarp SET nombre_usuario=$1,dni=$2,celular=$3,oficina=$4,fecha_cita=$5,horario=$6,paginas=$7,monto_calculado=$8 WHERE id=$9 AND estado_pago='pendiente'`,[d.nombre.trim(),d.dni,d.celular||null,d.oficina.trim(),d.fechaCita,d.horario.trim(),n,tarifa(n),id]);
  }
  if(d.estado!==anterior.estado)await c.query('SELECT c24_cambiar_estado($1,$2,$3)',[id,req.usuario.id,d.estado]);
  await c.query('COMMIT');res.json({ok:true});
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
});
r.patch('/solicitudes/:id',actualizarSolicitud);
r.put('/solicitudes/:id',actualizarSolicitud);
r.patch('/solicitudes/:id/estado',asincrono(async(req,res)=>{const id=validoId(req.params.id);exigir(estados.includes(req.body?.estado),'Estado no permitido.');const q=await query('SELECT c24_cambiar_estado($1,$2,$3) AS cambiado',[id,req.usuario.id,req.body.estado]);res.json({ok:true,cambiado:q.rows[0]?.cambiado});}));
r.post('/solicitudes/:id/firmar',asincrono(async(req,res)=>{const id=validoId(req.params.id);const q=await query('SELECT c24_firmar($1,$2) AS codigo_firma',[id,req.usuario.id]);res.json({ok:true,codigo_firma:q.rows[0]?.codigo_firma,simulado:true});}));
r.delete('/solicitudes/:id',asincrono(async(req,res)=>{const id=validoId(req.params.id);const q=await query(`DELETE FROM citas_sunarp WHERE id=$1 AND firma_digital_fecha IS NULL AND NOT EXISTS(SELECT 1 FROM pagos WHERE id_registro=$1) RETURNING id`,[id]);if(!q.rowCount)throw new HttpError(409,'No se puede eliminar: tiene pagos, está firmada o no existe.');res.json({ok:true});}));
export default r;
