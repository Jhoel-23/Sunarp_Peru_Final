import React,{useEffect,useState} from 'react';
export default function useDebounce(valor,ms=260){
 const [resultado,setResultado]=useState(valor);
 useEffect(()=>{const t=setTimeout(()=>setResultado(valor),ms);return()=>clearTimeout(t)},[valor,ms]);
 return resultado;
}
