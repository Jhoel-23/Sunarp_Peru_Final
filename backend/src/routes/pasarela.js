// SOLO SIMULADOR ACADÉMICO. No usar con tarjetas reales ni con la rama de producción.
import {Router} from 'express';
import crypto from 'node:crypto';
import {db,query} from '../config/db.js';
import {autenticar,roles} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
import {exigir,HttpError} from '../utils/validaciones.js';
import {modoPagoPruebasActivo} from '../utils/modoPago.js';
const r=Router();r.use(autenticar,roles('cliente'));
const activo=()=>exigir(modoPagoPruebasActivo(),'Los pagos de prueba están desactivados. Se requiere una rama de desarrollo de Neon y activar el simulador.',403);
r.get('/configuracion',(_req,res)=>res.json({simuladorActivo:modoPagoPruebasActivo(),modo:'pruebas',registraEnNeon:modoPagoPruebasActivo()}));
const idValido=v=>{const id=Number(v);exigir(Number.isSafeInteger(id)&&id>0,'Solicitud inválida.');return id;};
const codigo=p=>p+'-'+crypto.randomBytes(8).toString('hex').toUpperCase();
const soloDigitos=s=>String(s??'').replace(/\D/g,'');
const fechaActual=()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit'}).formatToParts(new Date());return Object.fromEntries(d.map(x=>[x.type,x.value]));};
async function registrar(conn,s,u,base,aprobado,motivo){
 const cod=codigo(aprobado?'OP':'RCH');
 await conn.query(`INSERT INTO pagos(codigo_operacion,id_registro,id_usuario,canal,metodo,proveedor_billetera,marca_tarjeta,referencia,monto,estado,motivo_rechazo) VALUES($1,$2,$3,'pasarela',$4,$5,$6,$7,$8,$9,$10)`,[cod,s.id,u.id,base.metodo,base.proveedor||null,base.marca||null,base.referencia,s.monto_calculado,aprobado?'aprobado':'rechazado',motivo||null]);
 if(aprobado)await conn.query(`UPDATE citas_sunarp SET estado_pago='pagado',canal_pago='pasarela',fecha_pago=NOW() WHERE id=$1 AND estado_pago='pendiente'`,[s.id]);
 return aprobado?{aprobado:true,codigo:cod,simulado:true}:{aprobado:false,codigo:cod,motivo};
}
r.get('/pendientes',asincrono(async(req,res)=>{const q=await query(`SELECT id,codigo_seguimiento,monto_calculado FROM citas_sunarp WHERE id_usuario=$1 AND estado_pago='pendiente' AND estado NOT IN ('rechazado','cancelado') ORDER BY fecha_registro DESC LIMIT 100`,[req.usuario.id]);res.json({solicitudes:q.rows});}));
r.get('/solicitudes/:id',asincrono(async(req,res)=>{const q=await query(`SELECT id,codigo_seguimiento,paginas,monto_calculado,estado_pago,estado FROM citas_sunarp WHERE id=$1 AND id_usuario=$2`,[idValido(req.params.id),req.usuario.id]);res.json({solicitud:q.rows[0]||null});}));
r.post('/tarjeta',asincrono(async(req,res)=>{
 activo();const sId=idValido(req.body?.solicitudId),pan=soloDigitos(req.body?.numero),cvv=String(req.body?.cvv??''),mes=Number(req.body?.mes),anio=Number(req.body?.anio),marca=String(req.body?.marca||'');
 exigir(/^\d{13,19}$/.test(pan)&&/^\d{3,4}$/.test(cvv),'Datos de prueba de tarjeta inválidos.');
 exigir(Number.isInteger(mes)&&mes>=1&&mes<=12&&Number.isInteger(anio)&&anio>=2020&&anio<=2100,'Fecha de vencimiento inválida.');
 const hoy=fechaActual();exigir(anio*12+mes>=Number(hoy.year)*12+Number(hoy.month),'Tarjeta vencida.');
 const c=await db().connect();try{
  await c.query('BEGIN');const q=await c.query(`SELECT * FROM citas_sunarp WHERE id=$1 AND id_usuario=$2 FOR UPDATE`,[sId,req.usuario.id]);const s=q.rows[0];if(!s)throw new HttpError(404,'Solicitud no encontrada.');
  exigir(s.estado_pago==='pendiente'&&!['cancelado','rechazado'].includes(s.estado),'Esta solicitud no acepta pagos.',409);
  const a=await c.query(`SELECT t.tipo,t.mes_venc,t.anio_venc,t.cvv,t.estado,c.id AS id_cuenta,c.saldo_disponible FROM banco_tarjetas t JOIN banco_cuentas c ON c.id=t.id_cuenta WHERE t.numero=$1 FOR UPDATE OF c`,[pan]);const t=a.rows[0];
  const b={metodo:t?.tipo==='credito'?'tarjeta_credito':'tarjeta_debito',marca,referencia:'**** '+pan.slice(-4)};
  let motivo=null;
  if(!t)motivo='Tarjeta no reconocida por la entidad emisora de prueba.';
  else if(t.estado!=='activa')motivo='Tarjeta de prueba bloqueada.';
  else if(Number(t.mes_venc)!==mes||Number(t.anio_venc)!==anio)motivo='Vencimiento incorrecto.';
  else if(String(t.cvv)!==cvv)motivo='Código de seguridad incorrecto.';
  else if(Number(t.saldo_disponible)<Number(s.monto_calculado))motivo='Saldo simulado insuficiente.';
  if(!motivo){const d=await c.query('UPDATE banco_cuentas SET saldo_disponible=saldo_disponible-$1 WHERE id=$2 AND saldo_disponible >= $1 RETURNING id',[s.monto_calculado,t.id_cuenta]);if(!d.rowCount)motivo='Saldo insuficiente.';}
  const resultado=await registrar(c,s,req.usuario,b,!motivo,motivo);
  await c.query('COMMIT');res.json(resultado);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
r.post('/billetera',asincrono(async(req,res)=>{
 activo();const sId=idValido(req.body?.solicitudId),proveedor=String(req.body?.proveedor||''),celular=soloDigitos(req.body?.celular),codigoAprobacion=String(req.body?.codigoAprobacion??'');
 exigir(['andipay','pagomovil'].includes(proveedor)&&/^9\d{8}$/.test(celular)&&/^\d{6}$/.test(codigoAprobacion),'Datos de billetera inválidos.');
 const c=await db().connect();try{
  await c.query('BEGIN');const q=await c.query('SELECT * FROM citas_sunarp WHERE id=$1 AND id_usuario=$2 FOR UPDATE',[sId,req.usuario.id]);const s=q.rows[0];if(!s)throw new HttpError(404,'Solicitud no encontrada.');
  exigir(s.estado_pago==='pendiente'&&!['cancelado','rechazado'].includes(s.estado),'Esta solicitud no acepta pagos.',409);
  const a=await c.query('SELECT id,saldo_disponible,codigo_aprobacion FROM billeteras WHERE proveedor=$1 AND celular=$2 FOR UPDATE',[proveedor,celular]);const b=a.rows[0];
  const datos={metodo:'billetera',proveedor,referencia:'*** *** '+celular.slice(-3)};
  let motivo=!b?'Billetera de prueba no registrada.':String(b.codigo_aprobacion)!==codigoAprobacion?'Código de aprobación incorrecto.':Number(b.saldo_disponible)<Number(s.monto_calculado)?'Saldo de prueba insuficiente.':null;
  if(!motivo){const d=await c.query('UPDATE billeteras SET saldo_disponible=saldo_disponible-$1 WHERE id=$2 AND saldo_disponible >= $1 RETURNING id',[s.monto_calculado,b.id]);if(!d.rowCount)motivo='Saldo insuficiente.';}
  const resultado=await registrar(c,s,req.usuario,datos,!motivo,motivo);
  await c.query('COMMIT');res.json(resultado);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
export default r;
