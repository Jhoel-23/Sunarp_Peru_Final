// Prueba del módulo real de pasarela contra un doble local de Neon.
// No se conecta a Internet ni sustituye las pruebas SQL contra PostgreSQL.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const cliente = { id: 1, nombre: 'Cliente prueba', rol: 'cliente' };
let datos;
let simularFallo = false;
let consultaCuenta = 0;

function inicializar() {
  datos = {
    registros: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, {
      id: i + 1, id_usuario: 1, codigo_seguimiento: `SUN-TEST-${i + 1}`,
      paginas: 5, monto_calculado: '42.00', estado_pago: 'pendiente', estado: 'registrado'
    }])),
    cuentas: { 1: 1500, 2: 10, 3: 3000, 4: 2000, 5: 800 },
    tarjetas: {
      '4111111111111111': { id_cuenta: 1, tipo: 'debito', mes_venc: 12, anio_venc: 2029, cvv: '123', estado: 'activa' },
      '4000000000000002': { id_cuenta: 2, tipo: 'debito', mes_venc: 8, anio_venc: 2028, cvv: '456', estado: 'activa' },
      '5555555555554444': { id_cuenta: 3, tipo: 'credito', mes_venc: 5, anio_venc: 2030, cvv: '789', estado: 'activa' },
      '5105105105105100': { id_cuenta: 4, tipo: 'credito', mes_venc: 3, anio_venc: 2027, cvv: '321', estado: 'bloqueada' },
      '378282246310005': { id_cuenta: 3, tipo: 'credito', mes_venc: 11, anio_venc: 2028, cvv: '1234', estado: 'activa' }
    },
    billeteras: [
      { id: 1, proveedor: 'andipay', celular: '987654321', saldo_disponible: 500, codigo_aprobacion: '123456' },
      { id: 2, proveedor: 'pagomovil', celular: '912345678', saldo_disponible: 15, codigo_aprobacion: '654321' },
      { id: 3, proveedor: 'andipay', celular: '999888777', saldo_disponible: 1000, codigo_aprobacion: '111222' }
    ],
    pagos: []
  };
}

function fallo(texto, code) {
  return Object.assign(new Error(texto), { code });
}

function ejecutar(s, a) {
  s = s.replace(/\s+/g, ' ').trim();
  if (s.includes('FROM citas_sunarp')) {
    const r = datos.registros[a[0]];
    return r && r.id_usuario === a[1] ? [structuredClone(r)] : [];
  }
  if (s.includes('FROM banco_tarjetas')) {
    consultaCuenta++;
    const t = datos.tarjetas[a[0]];
    return t ? [{ ...t, saldo_disponible: String(datos.cuentas[t.id_cuenta]) }] : [];
  }
  if (s.includes('FROM billeteras')) {
    return datos.billeteras.filter((b) => b.proveedor === a[0] && b.celular === a[1]).map((b) => ({ ...b }));
  }
  if (s.startsWith('UPDATE banco_cuentas')) {
    const nuevo = datos.cuentas[a[1]] - Number(a[0]);
    if (nuevo < 0) throw fallo('Saldo insuficiente', '23514');
    datos.cuentas[a[1]] = nuevo;
    return [];
  }
  if (s.startsWith('UPDATE billeteras')) {
    const b = datos.billeteras.find((fila) => fila.id === a[1]);
    const nuevo = b.saldo_disponible - Number(a[0]);
    if (nuevo < 0) throw fallo('Saldo insuficiente', '23514');
    b.saldo_disponible = nuevo;
    return [];
  }
  if (s.startsWith('INSERT INTO pagos')) {
    const aprobado = !s.includes("'rechazado'");
    if (aprobado && simularFallo) {
      simularFallo = false;
      throw fallo('Otro cobro ganó la carrera', '23505');
    }
    const r = datos.registros[a[1]];
    if (aprobado && r.estado_pago !== 'pendiente') throw fallo('Ya pagado', '23505');
    datos.pagos.push({ codigo: a[0], id_registro: a[1], id_usuario: a[2], metodo: a[3],
      referencia: a[6], monto: a[7], estado: aprobado ? 'aprobado' : 'rechazado', motivo: a[8] });
    if (aprobado) r.estado_pago = 'pagado';
    return [];
  }
  if (s.startsWith('UPDATE citas_sunarp')) return [];
  throw new Error('Consulta no contemplada por el doble de pruebas: ' + s);
}

function sql(strings, ...args) {
  const q = { texto: strings.join('?'), args };
  q.then = (ok, fail) => Promise.resolve().then(() => ejecutar(q.texto, args)).then(ok, fail);
  return q;
}
sql.transaction = async (consultas) => {
  const anterior = structuredClone(datos);
  try {
    return consultas.map((q) => ejecutar(q.texto, q.args));
  } catch (error) {
    datos = anterior;
    throw error;
  }
};

const contexto = vm.createContext({ console: { error() {} }, crypto: webcrypto, Date, Intl, URLSearchParams });
const cache = new Map();
async function cargar(ruta) {
  ruta = path.resolve(ruta);
  if (cache.has(ruta)) return cache.get(ruta);
  if (ruta.endsWith(path.join('config', 'neon-config.js'))) {
    const m = new vm.SyntheticModule(['sql'], function () { this.setExport('sql', sql); }, { context: contexto });
    cache.set(ruta, m);
    return m;
  }
  const modulo = new vm.SourceTextModule(await fs.readFile(ruta, 'utf8'), { context: contexto, identifier: ruta });
  cache.set(ruta, modulo);
  await modulo.link((spec, ref) => cargar(path.resolve(path.dirname(ref.identifier), spec)));
  return modulo;
}

inicializar();
const modulo = await cargar(path.join(raiz, 'public/sistema/js/pago/pasarela.js'));
await modulo.evaluate();
const { pagarConTarjeta, pagarConBilletera, obtenerRegistro } = modulo.namespace;
const tarjeta = (id, numero, mes, anio, cvv, marca) => pagarConTarjeta({
  registro: { id }, usuario: cliente, numero, mes, anio, cvv, marca
});
const billetera = (id, proveedor, celular, codigoAprobacion) => pagarConBilletera({
  registro: { id }, usuario: cliente, proveedor, celular, codigoAprobacion
});

let r = await tarjeta(1, '4111111111111111', 12, 2029, '123', 'Visa');
assert.equal(r.aprobado, true);
assert.equal(datos.cuentas[1], 1458);
assert.equal(datos.registros[1].estado_pago, 'pagado');
assert.equal(datos.pagos[0].referencia, '**** 1111');
await assert.rejects(tarjeta(1, '4111111111111111', 12, 2029, '123', 'Visa'), /ya fue pagada/);
assert.equal(datos.cuentas[1], 1458);

r = await tarjeta(2, '4000000000000002', 8, 2028, '456', 'Visa');
assert.equal(r.aprobado, false);
assert.match(r.motivo, /Saldo insuficiente/);
assert.equal(datos.cuentas[2], 10);
r = await tarjeta(3, '5555555555554444', 5, 2030, '789', 'Mastercard');
assert.equal(r.aprobado, true);
assert.equal(datos.cuentas[3], 2958);
r = await tarjeta(4, '5105105105105100', 3, 2027, '321', 'Mastercard');
assert.match(r.motivo, /bloqueada/);
r = await tarjeta(5, '378282246310005', 11, 2028, '1234', 'American Express');
assert.equal(r.aprobado, true);
assert.equal(datos.cuentas[3], 2916);
r = await tarjeta(8, '4111111111111111', 12, 2029, '999', 'Visa');
assert.match(r.motivo, /seguridad incorrecto/);

r = await billetera(9, 'andipay', '987654321', '123456');
assert.equal(r.aprobado, true);
assert.equal(datos.billeteras[0].saldo_disponible, 458);
r = await billetera(10, 'pagomovil', '912345678', '654321');
assert.match(r.motivo, /Saldo insuficiente/);
r = await billetera(11, 'andipay', '999888777', '000000');
assert.match(r.motivo, /incorrecto/);

const saldo = datos.cuentas[1];
simularFallo = true;
r = await tarjeta(12, '4111111111111111', 12, 2029, '123', 'Visa');
assert.equal(r.aprobado, false);
assert.equal(datos.cuentas[1], saldo, 'El fallo después del débito debe revertirlo');
assert.equal(datos.registros[12].estado_pago, 'pendiente');
assert.equal(await obtenerRegistro(1, 999), null, 'No se entrega una solicitud ajena');
assert.equal(datos.pagos.some((p) => Object.hasOwn(p, 'cvv') || Object.hasOwn(p, 'numero')), false);
assert(consultaCuenta > 0);
console.log('OK: pasarela real del proyecto con Neon simulado: débito/crédito, billeteras, rechazo, auditoría, reintento y rollback.');
console.log('Pendiente independiente: ejecutar SQL, carreras reales y prueba visual en el navegador.');
