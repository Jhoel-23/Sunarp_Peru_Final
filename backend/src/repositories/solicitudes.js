import {query} from '../config/db.js';
const SELECT=`r.id,r.codigo_seguimiento,r.nombre_usuario,r.dni,r.tipo_tramite,r.oficina,r.fecha_cita,r.horario,r.celular,r.paginas,r.monto_calculado,r.estado,r.estado_pago,r.firma_habilitada,r.firma_digital_fecha,r.codigo_firma,r.fecha_registro,r.id_usuario`;
export async function mis(id){const q=await query(`SELECT r.*, (SELECT p.codigo_operacion FROM pagos p WHERE p.id_registro=r.id AND p.estado='aprobado' ORDER BY p.id DESC LIMIT 1) AS codigo_operacion FROM citas_sunarp r WHERE r.id_usuario=$1 ORDER BY r.id DESC LIMIT 100`,[id]);return q.rows;}
export async function todas(){const q=await query(`SELECT ${SELECT} FROM citas_sunarp r ORDER BY r.id DESC LIMIT 200`);return q.rows;}
export async function porCodigo(codigo){const q=await query(`SELECT ${SELECT} FROM citas_sunarp r WHERE r.codigo_seguimiento=$1 LIMIT 1`,[codigo]);return q.rows[0]||null;}
export async function historial(id){const q=await query('SELECT h.id,h.cita_id,h.usuario_id,h.rol,h.turno,h.estado_anterior,h.estado_nuevo,h.fecha_cambio,u.nombre AS responsable FROM historial_estados h LEFT JOIN usuarios u ON u.id=h.usuario_id WHERE h.cita_id=$1 ORDER BY h.id ASC',[id]);return q.rows;}
export async function contar(){const q=await query('SELECT estado,count(*)::int AS cantidad FROM citas_sunarp GROUP BY estado ORDER BY estado');return q.rows;}
