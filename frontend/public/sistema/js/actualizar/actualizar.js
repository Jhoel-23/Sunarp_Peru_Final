import { api } from '../config/api.js';
import { exigirRol } from '../auth/auth.js';
import { $, iniciarInterfaz, mensaje, errorAmigable } from '../comun/ui.js';
import { calcularMontoServicio } from '../registro/tarifario.js';
import { leerFormulario, validarDatos, conectarCotizador, cargarCampos } from '../registro/formulario.js';

const usuario = exigirRol('cliente');
if (!usuario) throw new Error('Acceso denegado');
iniciarInterfaz(usuario);
const form = $('form-actualizar');
const id = Number(new URLSearchParams(location.search).get('id'));
const cotizar = conectarCotizador(form, $('editar-monto'));
let ocupado = false;
let editable = false;

function bloquear() {
  editable = false;
  [...form.elements].forEach((el) => { el.disabled = true; });
}

async function cargar() {
  bloquear();
  if (!Number.isSafeInteger(id) || id <= 0) {
    mensaje('mensaje-actualizar', 'Solicitud inválida.', 'error');
    return;
  }
  try {
    const {solicitud:r} = await api('/solicitudes/id/'+id);
    if (!r) return mensaje('mensaje-actualizar', 'La solicitud no existe o no pertenece a tu cuenta.', 'error');
    cargarCampos(form, r);
    if ($('codigo')) $('codigo').value = r.codigo_seguimiento;
    if ($('estado')) $('estado').value = r.estado;
    cotizar();
    $('codigo-solicitud').textContent = r.codigo_seguimiento;
    if (r.estado !== 'registrado' || r.estado_pago !== 'pendiente') {
      return mensaje('mensaje-actualizar', 'Esta solicitud ya no puede editarse: está pagada o cambió su estado operativo.');
    }
    [...form.elements].forEach((el) => { el.disabled = false; });
    editable = true;
  } catch (error) {
    mensaje('mensaje-actualizar', errorAmigable(error), 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editable || ocupado) return;
  const d = leerFormulario(form);
  if (!validarDatos(form, d)) return mensaje('mensaje-actualizar', 'Revisa los datos y las páginas.', 'error');
  ocupado = true;
  $('guardar').disabled = true;
  try {
    const {ok} = await api('/solicitudes/id/'+id,{method:'PATCH',body:{nombre:d.nombre,dni:d.dni,celular:d.celular,oficina:d.oficina,fecha:d.fecha,hora:d.hora,paginas:Number(d.paginas)}});
    const filas=ok?[{id}]:[];
    mensaje('mensaje-actualizar', filas.length ? 'Cambios guardados y monto recalculado.' : 'La solicitud ya no está disponible para editar.', filas.length ? 'exito' : 'error');
    if (filas.length) await window.SunarpUI.notificar('Cambios guardados', 'La solicitud fue actualizada y su monto se recalculó correctamente.');
    if (!filas.length) await cargar();
  } catch (error) {
    mensaje('mensaje-actualizar', errorAmigable(error), 'error');
  } finally {
    ocupado = false;
    $('guardar').disabled = !editable;
  }
});
cargar();
