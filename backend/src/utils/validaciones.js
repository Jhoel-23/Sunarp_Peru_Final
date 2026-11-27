export class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
export function exigir(ok,msg,status=400){if(!ok)throw new HttpError(status,msg);}
export function paginacion(valor){const v=Number(valor);exigir(Number.isSafeInteger(v)&&v>=1&&v<=200,'Las páginas deben estar entre 1 y 200.');return v;}
export function tarifa(paginas){return 24+6*Math.max(0,paginas-2);}
export function soloDni(value){return typeof value==='string' && /^\d{8}$/.test(value);}
export function esFechaISO(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T12:00:00'));}
export function fechaLima(){const part=new Intl.DateTimeFormat('en-US',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const x=Object.fromEntries(part.map(p=>[p.type,p.value]));return `${x.year}-${x.month}-${x.day}`;}
