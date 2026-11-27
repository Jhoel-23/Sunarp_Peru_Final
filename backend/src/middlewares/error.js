export const asincrono=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export function errores(e,req,res,next){
 if(res.headersSent)return next(e);
 const status=e.status || (e.code==='23505'?409:e.code==='23503'?409:e.code==='P0001'?422:e.code==='23514'||e.code==='23502'||e.code==='22P02'?400:500);
 if(status>=500)console.error('Error del servidor:',e.code||e.message);
 let error=status>=500?'Error interno. Revisa la conexión y los registros del backend.':e.message;
 if(e.code==='23505')error='Ya existe un registro con esos datos.';
 if(e.code==='23503')error='La operación requiere un registro relacionado existente.';
 if(e.code==='P0001')error=e.message;
 return res.status(status).json({error});
}
