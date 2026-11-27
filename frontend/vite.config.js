import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

function apiPublica(url,modo){
  const limpia=String(url||'').trim().replace(/\/+$/,'');
  if(!limpia)return '/api';
  if(!/^https:\/\/[^/\s]+(?:\/api)?$/.test(limpia) && !(modo!=='production' && /^http:\/\/localhost:\d+(?:\/api)?$/.test(limpia))){
    throw new Error('VITE_API_URL debe ser una URL HTTPS de Render, por ejemplo https://mi-api.onrender.com/api');
  }
  return limpia.endsWith('/api')?limpia:limpia+'/api';
}

export default defineConfig(({mode,command})=>{
 const env=loadEnv(mode,process.cwd(),'VITE_');
 const url=apiPublica(process.env.VITE_API_URL||env.VITE_API_URL,mode);
 if(command==='build' && process.env.VERCEL && url==='/api'){
   throw new Error('Antes de desplegar en Vercel, configura VITE_API_URL=https://TU-SERVICIO.onrender.com/api');
 }
 return {
  plugins:[react(), {
   name:'sunarp-configuracion-para-html-original',
   // Los HTML de /public/sistema no pasan por la transformación import.meta.env de Vite.
   // Escribimos en dist la URL pública (nunca claves) después de copiar los assets.
   apply:'build',
   closeBundle(){
    const destino=resolve(process.cwd(),'dist/sistema/js/config');
    mkdirSync(destino,{recursive:true});
    writeFileSync(resolve(destino,'api-entorno.js'),
      `// Configuración pública del despliegue. No contiene credenciales.\nexport const API_BASE_URL = ${JSON.stringify(url)};\n`,'utf8');
   }
  }],
  base:'/',
  server:{host:'127.0.0.1',port:5173,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:3000',changeOrigin:true}}},
  build:{outDir:'dist',emptyOutDir:true},
 };
});
