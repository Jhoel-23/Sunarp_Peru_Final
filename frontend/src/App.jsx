import React,{useCallback,useEffect,useState} from 'react';
import Encabezado from './components/Encabezado.jsx';
import Inicio from './pages/Inicio.jsx';
import Servicios from './pages/Servicios.jsx';
import Carta from './pages/Carta.jsx';
const rutas=['inicio','servicios','guia'];
const antiguas={'catalogo':'servicios','carta':'guia','carrito':'inicio','checkout':'inicio','registro':'inicio','seguimiento':'inicio'};
const rutaInicial=()=>{const actual=window.location.hash.slice(1);return rutas.includes(actual)?actual:(antiguas[actual]||'inicio')};
export default function App(){
 const [pagina,setPagina]=useState(rutaInicial);
 const navegar=useCallback(p=>{const final=rutas.includes(p)?p:'inicio';window.location.hash=final;setPagina(final);window.scrollTo({top:0,behavior:'smooth'})},[]);
 useEffect(()=>{const hash=()=>{const actual=window.location.hash.slice(1);const final=rutaInicial();if(actual!==final)history.replaceState(null,'','#'+final);setPagina(final)};window.addEventListener('hashchange',hash);hash();return()=>window.removeEventListener('hashchange',hash)},[]);
 const pantallas={inicio:<Inicio/>,servicios:<Servicios/>,guia:<Carta navegar={navegar}/>};
 return <div className="app-react"><a className="skip-link" href="#contenido">Saltar al contenido</a><Encabezado pagina={pagina} navegar={navegar}/><div id="contenido-react" key={pagina} className="contenido-actual">{pantallas[pagina]}</div><footer className="pie"><div className="pie__contenido"><div className="pie__bloque pie__marca"><span className="footer-monograma" aria-hidden="true">RP</span><div><strong>SUNARP</strong><p>Registros Públicos del Perú</p><small>Portal de demostración académica · No oficial</small></div></div><div className="pie__bloque"><h4>Accesos rápidos</h4><ul><li><a href="/sistema/consulta-partida.html">Consultar partida</a></li><li><a href="/sistema/registro.html">Iniciar solicitud</a></li><li><a href="/sistema/consulta.html">Mis solicitudes</a></li></ul></div><div className="pie__bloque"><h4>Información</h4><ul><li><a href="/#servicios" onClick={e=>{e.preventDefault();navegar('servicios')}}>Servicios</a></li><li><a href="/#guia" onClick={e=>{e.preventDefault();navegar('guia')}}>Guía de requisitos</a></li><li><a href="/sistema/contacto.html">Sedes y contacto</a></li></ul></div></div><div className="pie__inferior"><span>© {new Date().getFullYear()} SUNARP · Proyecto académico.</span><span>React · Bootstrap · Node.js · PostgreSQL</span></div></footer></div>;
}
