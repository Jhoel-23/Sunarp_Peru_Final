import {Router} from 'express';
import crypto from 'node:crypto';
import {query,db} from '../config/db.js';
import {autenticar,roles} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
import {exigir,HttpError,esFechaISO,fechaLima} from '../utils/validaciones.js';
import {modoPagoPruebasActivo} from '../utils/modoPago.js';
const r=Router();r.use(autenticar,roles('cajero','administrador'));
r.get('/pendientes',asincrono(async(req,res)=>{
 const busca=String(req.query.buscar||'').trim();exigir(busca.length<=80,'Búsqueda demasiado larga.');
 const q=await query(`SELECT r.*,COALESCE(u.nombre,r.nombre_usuario) AS cliente,COALESCE(r.dni,u.dni) AS cliente_dni FROM citas_sunarp r LEFT JOIN usuarios u ON u.id=r.id_usuario WHERE r.estado_pago='pendiente' AND r.estado NOT IN ('rechazado','cancelado') AND ($1='' OR r.codigo_seguimiento ILIKE $2 OR r.dni ILIKE $2 OR r.nombre_usuario ILIKE $2 OR u.dni ILIKE $2 OR u.nombre ILIKE $2) ORDER BY r.fecha_registro,r.id LIMIT 100`,[busca,`%${busca}%`]);res.json({solicitudes:q.rows});
}));
r.get('/movimientos',asincrono(async(req,res)=>{
 const fecha=String(req.query.fecha||fechaLima()),solo=req.query.soloPorVerificar==='true';exigir(esFechaISO(fecha),'Fecha inválida.');
 const q=await query(`SELECT p.*,r.codigo_seguimiento,COALESCE(u.nombre,r.nombre_usuario) AS cliente,v.nombre AS verificador FROM pagos p JOIN citas_sunarp r ON r.id=p.id_registro LEFT JOIN usuarios u ON u.id=p.id_usuario LEFT JOIN usuarios v ON v.id=p.verificado_por WHERE p.canal='pasarela' AND (p.fecha_pago AT TIME ZONE 'America/Lima')::date=$1::date AND ($2::boolean=false OR (p.estado='aprobado' AND NOT p.verificado)) ORDER BY p.fecha_pago DESC,p.id DESC LIMIT 200`,[fecha,solo]);res.json({movimientos:q.rows});
}));
r.get('/resumen',asincrono(async(req,res)=>{const fecha=String(req.query.fecha||fechaLima());exigir(esFechaISO(fecha),'Fecha inválida.');const q=await query(`SELECT canal,metodo,COUNT(*)::int AS operaciones,SUM(monto) AS total FROM pagos WHERE estado='aprobado' AND (fecha_pago AT TIME ZONE 'America/Lima')::date=$1::date GROUP BY canal,metodo ORDER BY canal,metodo`,[fecha]);res.json({resumen:q.rows});}));
r.post('/cobrar',asincrono(async(req,res)=>{
 exigir(modoPagoPruebasActivo(),'Los cobros de prueba están desactivados. Usa una rama de desarrollo de Neon.',403);
 const id=Number(req.body?.solicitudId),metodo=req.body?.metodo,referencia=String(req.body?.referencia||'').trim();
 exigir(Number.isSafeInteger(id)&&id>0,'Solicitud inválida.');
 exigir(['efectivo','pos','andipay','pagomovil'].includes(metodo),'Método inválido.');
 const efectivo=metodo==='efectivo',billetera=['andipay','pagomovil'].includes(metodo);
 const recibido=Number(req.body?.montoRecibido);
 if(efectivo)exigir(Number.isFinite(recibido)&&recibido>0,'Monto recibido inválido.');
 else exigir(/^(Voucher |Op\. )\d{6,12}$/.test(referencia),'Referencia de 6 a 12 dígitos inválida.');
 const c=await db().connect();try{
  await c.query('BEGIN');const q=await c.query('SELECT * FROM citas_sunarp WHERE id=$1 FOR UPDATE',[id]);const s=q.rows[0];if(!s)throw new HttpError(404,'Solicitud inexistente.');
  exigir(s.estado_pago==='pendiente'&&!['cancelado','rechazado'].includes(s.estado),'La solicitud ya no está pendiente.',409);
  const monto=Number(s.monto_calculado);exigir(!efectivo||recibido>=monto,'Monto insuficiente.');
  const codigo='CJ-'+crypto.randomBytes(6).toString('hex').toUpperCase();
  const pago=await c.query(`INSERT INTO pagos(codigo_operacion,id_registro,id_usuario,canal,metodo,proveedor_billetera,referencia,monto,monto_recibido,estado,id_cajero) VALUES($1,$2,$3,'caja',$4,$5,$6,$7,$8,'aprobado',$9) RETURNING id,codigo_operacion,monto,vuelto,estado`,[codigo,s.id,s.id_usuario,billetera?'billetera':metodo,billetera?metodo:null,efectivo?'Efectivo':referencia,monto,efectivo?recibido:null,req.usuario.id]);
  await c.query(`UPDATE citas_sunarp SET estado_pago='pagado',canal_pago='caja',fecha_pago=NOW() WHERE id=$1 AND estado_pago='pendiente'`,[id]);
  await c.query('COMMIT');res.status(201).json({pago:pago.rows[0],simulado:true});
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
r.patch('/pagos/:id/verificar',asincrono(async(req,res)=>{const id=Number(req.params.id);exigir(Number.isSafeInteger(id)&&id>0,'ID inválido.');const q=await query(`UPDATE pagos SET verificado=true,verificado_por=$1,fecha_verificacion=NOW() WHERE id=$2 AND canal='pasarela' AND estado='aprobado' AND NOT verificado RETURNING id`,[req.usuario.id,id]);if(!q.rowCount)throw new HttpError(409,'Pago inexistente o ya verificado.');res.json({ok:true});}));
export default r;
