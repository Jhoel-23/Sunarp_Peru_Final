// Directorio informativo para el frontend. Los pagos y tarifas se consultan
// exclusivamente a través de los módulos originales y el backend.
export const servicios = [
  {id:'vigencia',nombre:'Expedición de vigencia de poder',categoria:'Certificados',descripcion:'Consulta los requisitos para solicitar una vigencia de poder.',requisitos:['Contar con una cuenta en el sistema','Completar los datos de la solicitud','Indicar las páginas requeridas'],ruta:'/sistema/registro.html',icono:'📄'},
  {id:'poder',nombre:'Inscripción de poder',categoria:'Personas naturales',descripcion:'Información sobre inscripción de poderes y representación.',requisitos:['Escritura pública de poder','Documentación de identidad','Formulario de solicitud'],ruta:'/sistema/tramites.html',icono:'🖋️'},
  {id:'empresa',nombre:'Constitución de empresa',categoria:'Personas jurídicas',descripcion:'Consulta los requisitos para inscribir una persona jurídica.',requisitos:['Minuta o escritura pública','Documentación de los socios','Formulario de inscripción'],ruta:'/sistema/tramites.html',icono:'🏢'},
  {id:'vehicular',nombre:'Inscripción vehicular',categoria:'Bienes muebles',descripcion:'Información sobre inmatriculación o transferencia de un vehículo.',requisitos:['Documentación del vehículo','Contrato o título correspondiente','Formulario de inscripción'],ruta:'/sistema/tramites.html',icono:'🚗'},
  {id:'propiedad',nombre:'Inscripción de propiedad',categoria:'Predios',descripcion:'Consulta requisitos para inscribir la transferencia de un predio.',requisitos:['Escritura pública','Documentos de identidad','Formulario de solicitud'],ruta:'/sistema/tramites.html',icono:'🏠'},
  {id:'partida',nombre:'Consulta de partida registral',categoria:'Consultas',descripcion:'Consulta de una partida registral en el módulo existente de SUNARP.',requisitos:['Identificadores de la partida registral'],ruta:'/sistema/consulta-partida.html',icono:'🔎'},
  {id:'seguimiento',nombre:'Consulta de solicitudes',categoria:'Consultas',descripcion:'Revisa las solicitudes registradas en tu cuenta.',requisitos:['Iniciar sesión','Contar con una solicitud registrada'],ruta:'/sistema/consulta.html',icono:'📋'}
];
export const categorias = ['Todas',...new Set(servicios.map(s=>s.categoria))];
export const porId = id => servicios.find(s=>s.id===id);
