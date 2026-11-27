import jwt from 'jsonwebtoken';
import {verificar} from '../config/jwt.js';
import {porId} from '../repositories/usuarios.js';
import {HttpError} from '../utils/validaciones.js';
export async function autenticar(req,res,next){
 try{const h=req.get('authorization')||'';if(!h.startsWith('Bearer '))throw new HttpError(401,'Inicia sesión.');
 const p=verificar(h.slice(7));const id=Number(p.sub);if(!Number.isSafeInteger(id)||id<1)throw new HttpError(401,'Token inválido.');
 const u=await porId(id);if(!u)throw new HttpError(401,'Sesión no disponible.');req.usuario=u;next();
 }catch(e){next(e instanceof jwt.JsonWebTokenError?new HttpError(401,'Sesión vencida o no válida.'):e);}
}
export const roles=(...permitidos)=>(req,res,next)=>permitidos.includes(req.usuario?.rol)?next():next(new HttpError(403,'No tienes permiso para esta operación.'));
