import {Router} from 'express';
import {query} from '../config/db.js';
import {asincrono} from '../middlewares/error.js';
import {exigir,HttpError} from '../utils/validaciones.js';
const r=Router();
// Public catalogue metadata only: does not authorize payments or change official fees.
// If the optional S14 migration hasn't been applied, the React demo catalogue remains available.
r.get('/',asincrono(async(req,res)=>{
 let servicios=[];let origen='sin_catalogo';
 try{
  const {rows}=await query(`SELECT id,nombre,descripcion,categoria,imagen_url,
      precio_referencial::float8 AS precio
      FROM catalogo_servicios WHERE activo=true ORDER BY nombre`);
  servicios=rows;origen='neon';
 }catch(e){
  if(e.code!=='42P01')throw e; // Falta la tabla opcional; otros errores reales se notifican.
 }
 res.set('Cache-Control','no-store');
 res.json({servicios,origen});
}));
// S15: consulta individual; 200 cuando existe en Neon, 404 cuando no existe o está inactivo.
r.get('/:id',asincrono(async(req,res)=>{
 const id=String(req.params.id||'');
 exigir(/^[a-z0-9_-]{1,40}$/i.test(id),'Identificador de servicio inválido.');
 let servicio;
 try{
  const q=await query(`SELECT id,nombre,descripcion,categoria,imagen_url,
   precio_referencial::float8 AS precio FROM catalogo_servicios
   WHERE id=$1 AND activo=true LIMIT 1`,[id]);
  servicio=q.rows[0];
 }catch(e){if(e.code!=='42P01')throw e;}
 if(!servicio)throw new HttpError(404,'Servicio no encontrado en el catálogo de Neon.');
 res.set('Cache-Control','no-store');
 res.json({servicio});
}));
export default r;
