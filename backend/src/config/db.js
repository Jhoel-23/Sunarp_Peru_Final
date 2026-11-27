import 'dotenv/config';
import pg from 'pg';
let pool;
export function db() {
  const url=process.env.DATABASE_URL;
  if(!url || url.includes('USUARIO:CONTRASENA')) throw Object.assign(new Error('Configura DATABASE_URL en backend/.env'),{status:503});
  if(!pool) pool=new pg.Pool({connectionString:url,ssl:process.env.DB_SSL==='false'?false:{rejectUnauthorized:true},max:5,connectionTimeoutMillis:8000,idleTimeoutMillis:30000});
  return pool;
}
export const query=(sql,args=[])=>db().query(sql,args);
