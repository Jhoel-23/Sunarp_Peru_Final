import test from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../src/app.js';

test('Las rutas S15 responden códigos esperados sin acceder a Neon', async()=>{
 const anterior=process.env.JWT_SECRET;
 process.env.JWT_SECRET='test-solamente-nunca-usar-en-produccion-123456789012345';
 const server=app.listen(0,'127.0.0.1');
 try{
  await new Promise(resolve=>server.once('listening',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;
  const casos=[
   ['GET','/api/salud',undefined,200],
   ['GET','/api/ninguna-ruta',undefined,404],
   ['POST','/api/auth/login',{},400],
   ['GET','/api/clientes',undefined,401],
   ['POST','/api/clientes',{},401],
   ['GET','/api/gestion/solicitudes',undefined,401],
   ['PUT','/api/gestion/solicitudes/1',{},401],
   ['DELETE','/api/gestion/solicitudes/1',undefined,401],
  ];
  for(const [method,path,body,status] of casos){
   const res=await fetch(url+path,{method,headers:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
   assert.equal(res.status,status,`${method} ${path}`);
   assert.equal(res.headers.get('content-type')?.includes('application/json'),true);
  }
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  if(anterior===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=anterior;
 }
});
