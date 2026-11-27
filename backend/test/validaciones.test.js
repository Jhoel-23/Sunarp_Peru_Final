import test from 'node:test';import assert from 'node:assert/strict';
import {tarifa,paginacion,soloDni,esFechaISO} from '../src/utils/validaciones.js';
test('tarifa vigente según páginas, sin sumar montos enviados desde el navegador',()=>{
 assert.equal(tarifa(1),24);assert.equal(tarifa(2),24);assert.equal(tarifa(3),30);assert.equal(tarifa(5),42);
});
test('páginas y DNI válidos',()=>{assert.equal(paginacion('3'),3);assert.throws(()=>paginacion(0));assert.equal(soloDni('12345678'),true);assert.equal(soloDni('123'),false)});
test('fecha formato ISO',()=>{assert.equal(esFechaISO('2026-12-10'),true);assert.equal(esFechaISO('10/12/2026'),false)});
