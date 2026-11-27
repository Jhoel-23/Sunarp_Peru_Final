import {Router} from 'express';
import {iniciarSesion,registrarUsuario,perfilActual} from '../controllers/auth.js';
import {autenticar} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
const r=Router();
r.post('/login',asincrono(iniciarSesion));
r.post('/registro',asincrono(registrarUsuario));
r.get('/me',autenticar,asincrono(perfilActual));
export default r;
