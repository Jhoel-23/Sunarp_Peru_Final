import test from 'node:test';
import assert from 'node:assert/strict';
import {modoPagoPruebasActivo} from '../src/utils/modoPago.js';
test('modo de pagos bloqueado por defecto y en producción',()=>{
 assert.equal(modoPagoPruebasActivo({}),false);
 assert.equal(modoPagoPruebasActivo({SIMULADOR_PAGOS:'true',DB_RAMA:'produccion'}),false);
 assert.equal(modoPagoPruebasActivo({SIMULADOR_PAGOS:'true',DB_RAMA:'desarrollo',NODE_ENV:'production'}),false);
});
test('solo pruebas locales en rama marcada como desarrollo',()=>{
 assert.equal(modoPagoPruebasActivo({SIMULADOR_PAGOS:'true',DB_RAMA:'desarrollo',NODE_ENV:'development'}),true);
});
