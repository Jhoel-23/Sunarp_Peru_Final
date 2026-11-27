export function modoPagoPruebasActivo(env=process.env){
 return env.SIMULADOR_PAGOS==='true' && env.DB_RAMA==='desarrollo' && env.NODE_ENV!=='production';
}
