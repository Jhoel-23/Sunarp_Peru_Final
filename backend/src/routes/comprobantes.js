import {Router} from 'express';import {query} from '../config/db.js';import {autenticar} from '../middlewares/auth.js';import {asincrono} from '../middlewares/error.js';import {HttpError} from '../utils/validaciones.js';
const r=Router();r.use(autenticar);
r.get('/:codigo',asincrono(async(req,res)=>{const codigo=String(req.params.codigo||'');if(codigo.length>30)throw new HttpError(400,'Código inválido.');
 const q=await query(`SELECT p.*,r.codigo_seguimiento,r.nombre_usuario,r.paginas,r.estado AS estado_operativo,r.estado_pago,r.firma_habilitada,r.firma_digital_fecha,r.codigo_firma,c.nombre AS cajero,v.nombre AS verificador,f.nombre AS firmante FROM pagos p JOIN citas_sunarp r ON r.id=p.id_registro LEFT JOIN usuarios c ON c.id=p.id_cajero LEFT JOIN usuarios v ON v.id=p.verificado_por LEFT JOIN usuarios f ON f.id=r.firmado_por WHERE p.codigo_operacion=$1 AND p.estado='aprobado' AND ($2::text <> 'cliente' OR r.id_usuario=$3)`,[codigo,req.usuario.rol,req.usuario.id]);
 if(!q.rowCount)throw new HttpError(404,'Comprobante no encontrado.');res.json({comprobante:q.rows[0]});
}));export default r;
