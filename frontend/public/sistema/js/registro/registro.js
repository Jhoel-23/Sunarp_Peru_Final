import {api} from '../config/api.js';import {exigirRol} from '../auth/auth.js';
import {$,iniciarInterfaz,mensaje,errorAmigable} from '../comun/ui.js';
import {leerFormulario,validarDatos,conectarCotizador} from './formulario.js';
const usuario=exigirRol('cliente');if(!usuario)throw Error('Acceso denegado');iniciarInterfaz(usuario);
const form=$('form-registro');conectarCotizador(form,$('registro-monto'));form.elements.nombre.value=usuario.nombre;form.elements.dni.value=usuario.dni||'';
let ocupado=false;form.addEventListener('submit',async e=>{e.preventDefault();if(ocupado)return;const d=leerFormulario(form);if(!validarDatos(form,d))return mensaje('mensaje-registro','Verifica los datos y el número de páginas.','error');
 ocupado=true;const boton=form.querySelector('[type=submit]');boton.disabled=true;
 try{const {solicitud}=await api('/solicitudes',{method:'POST',body:{dni:d.dni,paginas:Number(d.paginas),oficina:d.oficina,fechaCita:d.fecha,horario:d.hora,celular:d.celular}});
 await window.SunarpUI?.notificar?.('Solicitud registrada',`Código ${solicitud.codigo_seguimiento}.`);
 location.href='consulta.html';}catch(err){mensaje('mensaje-registro',errorAmigable(err),'error')}finally{ocupado=false;boton.disabled=false}
});
