// Integra el controlador real con un DOM mínimo y un receptor de submit simulado.
// Comprueba que confirmar/cancelar controla el envío; no conecta a Neon.
import vm from 'node:vm';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const eventos = new Map();
const todos = [];
class Elemento {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.dataset = {};
    this.value = ''; this.type = 'text'; this.name = ''; this.id = '';
    this.minLength = -1; this.maxLength = -1; this.labels = []; this.isConnected = true;
    this.validity = { valid: true }; this.checked = false; this.inert = false;
    todos.push(this);
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...els) { this.children.push(...els); }
  replaceChildren(...els) { this.children = els; }
  insertAdjacentElement() {}
  matches(s) {
    if (s === ':disabled') return !!this.disabled;
    return ['INPUT', 'SELECT', 'TEXTAREA'].includes(this.tagName);
  }
  closest() { return null; }
  setCustomValidity(texto) { this.validity.valid = !texto; }
  focus() { document.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
let envios = 0;
class Formulario extends Elemento {
  constructor() { super('form'); this.elements = []; }
  requestSubmit(submitter) {
    const e = { target: this, submitter, preventDefault() {}, stopImmediatePropagation() { this.detenido = true; } };
    eventos.get('submit')(e);
    if (!e.detenido) envios++;
  }
}
const document = {
  body: new Elemento('body'), activeElement: null,
  createElement: tag => new Elemento(tag),
  getElementById: id => todos.find(el => el.id === id),
  querySelectorAll: () => [],
  addEventListener: (tipo, fn) => eventos.set(tipo, fn)
};
const context = vm.createContext({ document, HTMLFormElement: Formulario,
  location: { pathname: '/registro.html' }, window: {}, Intl, Date, console, setTimeout });
const cache = new Map();
async function cargar(path) {
  if (cache.has(path)) return cache.get(path);
  const m = new vm.SourceTextModule(await fs.readFile(path, 'utf8'), { context, identifier: path });
  cache.set(path, m);
  await m.link((specifier, parent) => cargar(new URL(specifier, 'file://' + parent.identifier).pathname));
  return m;
}
const modulo = await cargar(new URL('../public/sistema/js/comun/formularios.js', import.meta.url).pathname);
await modulo.evaluate();
const form = new Formulario(); form.id = 'form-registro';
const campo = new Elemento('input'); campo.name = 'nombre'; campo.value = 'Joel Carlos'; campo.required = true;
form.elements.push(campo); document.body.append(form);
const boton = new Elemento('button');
const modal = todos.find(el => el.tagName === 'DIALOG');
const botones = modal.children.at(-1).children;
const tick = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const enviar = () => eventos.get('submit')({ target: form, submitter: boton, preventDefault() {}, stopImmediatePropagation() {} });
let proceso = enviar(); await tick();
assert.equal(modal.open, true); assert.equal(form.inert, true); assert.equal(envios, 0);
await enviar(); assert.equal(envios, 0); // doble clic mientras se confirma
botones[0].onclick(); await proceso;
assert.equal(envios, 0); assert.equal(form.inert, false);
proceso = enviar(); await tick(); botones[1].onclick(); await proceso;
assert.equal(envios, 1); // exactamente un envío autorizado
campo.value = '123'; await enviar(); assert.equal(envios, 1);
assert.equal(campo.getAttribute('aria-invalid'), 'true');
campo.value = 'Joel Carlos';
proceso = enviar(); await tick(); modal.oncancel({ preventDefault() {} }); await proceso;
assert.equal(envios, 1); // Escape cancela
proceso = enviar(); await tick(); campo.value = 'Dato modificado'; botones[1].onclick(); await tick();
assert.equal(envios, 1); assert.equal(modal.open, true); // datos cambiados requieren nueva confirmación
botones[1].onclick(); await proceso;
let finalizo = false;
const aviso = context.window.SunarpUI.notificar('Pago aprobado', 'Operación ficticia').then(() => { finalizo = true; });
await tick(); assert.equal(finalizo, false); botones[1].onclick(); await aviso;
assert.equal(finalizo, true);
console.log('OK: confirmar envía una vez; cancelar/Escape/errores/cambio de datos no envían; aviso espera aceptación y restaura interacción.');
