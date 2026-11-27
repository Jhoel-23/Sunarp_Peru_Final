import React,{useEffect,useRef} from 'react';
export default function Buscador({valor,cambiar}){
 const input=useRef(null);
 useEffect(()=>{const tecla=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.current?.focus()}if(e.key==='Escape'&&document.activeElement===input.current)input.current.blur()};window.addEventListener('keydown',tecla);return()=>window.removeEventListener('keydown',tecla)},[]);
 return <label className="buscar d-flex align-items-center gap-2"><span aria-hidden="true">⌕</span><input type="search" className="form-control" ref={input} placeholder="Buscar trámites o servicios" value={valor} onChange={e=>cambiar(e.target.value)} aria-label="Buscar servicios"/><kbd>Ctrl K</kbd></label>
}
