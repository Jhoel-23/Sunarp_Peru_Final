import React from 'react';
export default function FiltroCategorias({categorias,categoria,cambiar}){
 return <div className="chips d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">{categorias.map(c=><button key={c} aria-pressed={c===categoria} className={c===categoria?'chip activo btn btn-sm':'chip btn btn-sm'} onClick={()=>cambiar(c)}>{c}</button>)}</div>
}
