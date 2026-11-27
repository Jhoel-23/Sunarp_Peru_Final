import {Router} from 'express';
import crypto from 'node:crypto';
import {query} from '../config/db.js';
import {autenticar,roles} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
import {exigir,soloDni,paginacion,esFechaISO,tarifa,HttpError} from '../utils/validaciones.js';
import {mis,porCodigo,historial} from '../repositories/solicitudes.js';
const r=Router();r.use(autenticar);
r.get('/mis',asincrono(async(req,res)=>{exigir(req.usuario.rol==='cliente','Solo el ciudadano puede consultar sus solicitudes.',403);res.json({solicitudes:await mis(req.usuario.id)});}));
r.post('/',roles('cliente'),asincrono(async(req,res)=>{
 const {dni,paginas,oficina,fechaCita,horario,celular}=req.body||{};
 exigir(soloDni(dni),'DNI de 8 dígitos obligatorio.');const n=paginacion(paginas);
 exigir(typeof oficina==='string'&&oficina.trim().length>=3&&oficina.length<=120,'Indica la oficina.');
 exigir(esFechaISO(fechaCita),'Indica una fecha válida AAAA-MM-DD.');
 exigir(typeof horario==='string'&&horario.trim().length>=3&&horario.length<=50,'Indica el horario.');
 exigir(!celular || (typeof celular==='string'&&/^\d{9,15}$/.test(celular)),'Celular inválido.');
 const codigo='SUN24-'+crypto.randomUUID().slice(0,13).toUpperCase();
 const rs=await query(`INSERT INTO citas_sunarp (codigo_seguimiento,nombre_usuario,dni,tipo_tramite,oficina,fecha_cita,horario,celular,id_usuario,estado,paginas,monto_calculado,estado_pago) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'registrado',$10,$11,'pendiente') RETURNING *`,[codigo,req.usuario.nombre,dni,'Expedición de vigencia de poder',oficina.trim(),fechaCita,horario.trim(),celular||null,req.usuario.id,n,tarifa(n)]);
 res.status(201).json({solicitud:rs.rows[0]});
}));

// Formularios clásicos conservados: mismos permisos, validación y tarifa del backend.
r.get('/id/:id',roles('cliente'),asincrono(async(req,res)=>{
 const id=Number(req.params.id);exigir(Number.isSafeInteger(id)&&id>0,'ID inválido.');
 const q=await query('SELECT * FROM citas_sunarp WHERE id=$1 AND id_usuario=$2',[id,req.usuario.id]);
 if(!q.rowCount)throw new HttpError(404,'Solicitud no encontrada.');res.json({solicitud:q.rows[0]});
}));
r.patch('/id/:id',roles('cliente'),asincrono(async(req,res)=>{
 const id=Number(req.params.id),d=req.body||{};
 exigir(Number.isSafeInteger(id)&&id>0,'Solicitud inválida.');
 exigir(typeof d.nombre==='string'&&d.nombre.trim().length>=3&&d.nombre.length<=120,'Nombre inválido.');
 exigir(soloDni(d.dni),'DNI inválido.');const n=paginacion(d.paginas);
 exigir(typeof d.oficina==='string'&&d.oficina.trim().length>=3&&d.oficina.length<=120,'Oficina inválida.');
 exigir(esFechaISO(d.fecha),'Fecha inválida.');
 exigir(typeof d.hora==='string'&&d.hora.length>=3&&d.hora.length<=50,'Horario inválido.');
 exigir(!d.celular||/^\d{9,15}$/.test(d.celular),'Celular inválido.');
 const q=await query(`UPDATE citas_sunarp SET nombre_usuario=$1,dni=$2,celular=$3,oficina=$4,fecha_cita=$5,horario=$6,paginas=$7,monto_calculado=$8 WHERE id=$9 AND id_usuario=$10 AND estado='registrado' AND estado_pago='pendiente' RETURNING id`,[d.nombre.trim(),d.dni,d.celular||null,d.oficina.trim(),d.fecha,d.hora,n,tarifa(n),id,req.usuario.id]);
 if(!q.rowCount)throw new HttpError(409,'La solicitud ya no está disponible para editar.');res.json({ok:true,solicitudId:id});
}));

r.get('/:codigo',asincrono(async(req,res)=>{
 const s=await porCodigo(req.params.codigo);if(!s)throw new HttpError(404,'No existe la solicitud.');
 if(req.usuario.rol==='cliente' && s.id_usuario!==req.usuario.id)throw new HttpError(403,'No puedes consultar esta solicitud.');
 res.json({solicitud:s,historial:await historial(s.id)});
}));
export default r;
