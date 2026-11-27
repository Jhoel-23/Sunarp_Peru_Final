import React,{useEffect,useMemo,useState} from 'react';
import Buscador from '../components/Buscador.jsx';
import FiltroCategorias from '../components/FiltroCategorias.jsx';
import useDebounce from '../hooks/useDebounce.js';
import {listarServicios} from '../services/api.js';
export default function Servicios(){
 const [datos,setDatos]=useState([]),[cargando,setCargando]=useState(true),[origen,setOrigen]=useState('local');
 const [busqueda,setBusqueda]=useState(''),[categoria,setCategoria]=useState('Todas');
 const texto=useDebounce(busqueda,200);
 useEffect(()=>{let activo=true;listarServicios().then(r=>{if(activo){setDatos(r.servicios);setOrigen(r.origen)}}).finally(()=>{if(activo)setCargando(false)});return()=>{activo=false}},[]);
 const categorias=useMemo(()=>['Todas',...new Set(datos.map(s=>s.categoria))],[datos]);
 const visibles=useMemo(()=>datos.filter(s=>(categoria==='Todas'||s.categoria===categoria)&&`${s.nombre} ${s.descripcion} ${s.categoria}`.toLocaleLowerCase('es').includes(texto.trim().toLocaleLowerCase('es'))).sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')),[datos,categoria,texto]);
 return <main id="contenido" className="pagina-react pagina-servicios"><div className="pagina-banda"><div className="home-wrap"><span className="section-kicker section-kicker--claro">DIRECTORIO DE SERVICIOS</span><h1>Servicios registrales</h1><p>Encuentra el trámite que necesitas, consulta información y accede directamente a su módulo.</p></div></div>
 <div className="home-wrap servicios-cuerpo"><section className="filtros" aria-label="Filtrar servicios"><div className="filtros__top"><div><h2>Explorar servicios</h2><p>Filtra por categoría o busca un trámite</p></div><span className="contador-servicios">{cargando?'Cargando…':`${visibles.length} resultados`}</span></div><Buscador valor={busqueda} cambiar={setBusqueda}/><FiltroCategorias categorias={categorias} categoria={categoria} cambiar={setCategoria}/></section>
 <p className="servicios-nota" aria-live="polite">{origen==='neon'?'Información del catálogo desde Neon':'Directorio informativo del portal académico'}</p>
 <section className="directorio row g-3" aria-label="Listado de servicios">{visibles.map((s,i)=><div className="col-12 col-md-6 col-xl-4" key={s.id}><article className="directorio-fila h-100"><div className="directorio-fila__top"><span className="directorio-icono" aria-hidden="true">{s.icono}</span><span className="directorio-fila__indice">{String(i+1).padStart(2,'0')}</span></div><div className="directorio-info"><p className="sobrelinea">{s.categoria}</p><h2>{s.nombre}</h2><p>{s.descripcion}</p></div><a className="acceso-modulo" href={s.ruta}>Abrir módulo <span aria-hidden="true">↗</span></a></article></div>)}{!cargando&&!visibles.length&&<div className="col-12"><div className="sin-resultados"><h2>No se encontraron servicios</h2><p>Prueba con otra palabra o cambia la categoría seleccionada.</p><button type="button" className="accion-primaria" onClick={()=>{setBusqueda('');setCategoria('Todas')}}>Limpiar filtros</button></div></div>}</section>
 </div></main>;
}
