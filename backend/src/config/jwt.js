import jwt from 'jsonwebtoken';
import {HttpError} from '../utils/validaciones.js';
export function secreto(){const s=process.env.JWT_SECRET;if(!s||s.length<32||s.startsWith('CAMBIA_'))throw new HttpError(503,'Configura JWT_SECRET en backend/.env (32 caracteres como mínimo).');return s;}
export const firmar=(u)=>jwt.sign({sub:String(u.id)},secreto(),{algorithm:'HS256',expiresIn:'4h'});
export const verificar=(t)=>jwt.verify(t,secreto(),{algorithms:['HS256']});
