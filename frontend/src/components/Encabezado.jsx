import React,{useEffect,useState} from 'react';
export default function Encabezado({pagina,navegar}){
 const [menuAbierto,setMenuAbierto]=useState(false);
 useEffect(()=>setMenuAbierto(false),[pagina]);
 const nav=(dest,text)=> <a href={'/#'+dest} aria-current={pagina===dest?'page':undefined} onClick={e=>{if(!e.ctrlKey&&!e.metaKey){e.preventDefault();navegar(dest)}}}>{text}</a>;
 return <header className="cabecera" aria-label="Encabezado SUNARP">
  <div className="topline"><div className="topline__inner"><span>Portal de servicios registrales</span><span className="topline__aclaracion">Proyecto académico · No oficial</span></div></div>
  <div className="cabecera__contenido">
   <a className="cabecera__marca" href="/" onClick={e=>{if(!e.ctrlKey&&!e.metaKey){e.preventDefault();navegar('inicio')}}}>
    <span className="cabecera__sello" aria-hidden="true">RP</span><span className="cabecera__texto"><strong>SUNARP</strong><small>Registros Públicos del Perú</small></span>
   </a>
   <button type="button" className="sunarp-nav-toggle" aria-controls="sunarp-menu" aria-expanded={menuAbierto} onClick={()=>setMenuAbierto(v=>!v)}>{menuAbierto?'Cerrar ✕':'Menú ☰'}</button>
   <nav id="sunarp-menu" className={'nav-principal sunarp-nav-bootstrap '+(menuAbierto?'sunarp-nav-bootstrap--abierto':'')} aria-label="Navegación principal"><ul>
     <li>{nav('inicio','Inicio')}</li><li>{nav('servicios','Servicios')}</li><li>{nav('guia','Guía de trámites')}</li>
     <li><a href="/sistema/consulta-partida.html">Consultar partida</a></li><li><a href="/sistema/consulta.html">Mis solicitudes</a></li>
     <li><a className="nav-acceso" href="/sistema/login.html"><span aria-hidden="true">♙</span> Iniciar sesión</a></li>
   </ul></nav>
  </div>
 </header>;
}
