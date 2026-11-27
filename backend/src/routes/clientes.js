import {Router} from 'express';
import {autenticar,roles} from '../middlewares/auth.js';
import {asincrono} from '../middlewares/error.js';
import {listarClientes,altaCliente} from '../controllers/clientes.js';
const r=Router();
// Solo administradores: evita exponer datos de ciudadanos a visitantes o empleados.
r.use(autenticar,roles('administrador'));
r.get('/',asincrono(listarClientes));
r.post('/',asincrono(altaCliente));
export default r;
