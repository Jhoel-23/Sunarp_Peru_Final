import assert from 'node:assert/strict';
import { calcularMontoServicio, paginasValidas } from '../public/sistema/js/registro/tarifario.js';
import * as v from '../public/sistema/js/pago/validaciones.js';

for (const [paginas, monto] of [[1, 24], [2, 24], [3, 30], [5, 42], [10, 72]]) {
  assert.equal(calcularMontoServicio({ paginas: String(paginas) }), monto);
}
for (const invalido of ['', '0', '-1', '2.5', 'abc', 'Infinity']) assert.equal(paginasValidas(invalido), false);
assert.equal(paginasValidas('5'), true);
for (const numero of ['4111111111111111', '4000000000000002', '5555555555554444', '5105105105105100', '378282246310005']) {
  assert.equal(v.validarLuhn(numero), true);
}
for (const numero of ['', '0000000000000000', '4111111111111112']) assert.equal(v.validarLuhn(numero), false);
assert.equal(v.detectarMarca('378282246310005'), 'American Express');
assert.equal(v.validarCVV('1234', 'American Express'), true);
assert.equal(v.validarCVV('123', 'American Express'), false);
assert.equal(v.validarVencimiento('01/25', new Date('2026-10-15T14:00:00Z')), null);
assert.deepEqual(v.validarVencimiento('10/26', new Date('2026-11-01T04:59:59Z')), { mes: 10, anio: 2026 });
assert.equal(v.validarVencimiento('10/26', new Date('2026-11-01T05:00:00Z')), null);
assert.equal(v.validarCelular('987654321'), true);
assert.equal(v.validarCelular('887654321'), false);
assert.equal(v.validarCodigoAprobacion('123456'), true);
assert.equal(v.validarCodigoAprobacion('12345'), false);
assert.equal(v.enmascararTarjeta('4111111111111111'), '**** 1111');
assert.equal(v.enmascararCelular('987654321'), '*** *** 321');
assert.equal(v.generarCodigoOperacion().length <= 20, true);
console.log('OK: tarifa caso 24, páginas inválidas, Luhn, marcas, CVV, vencimiento Lima, celular y referencias.');
