# Frontend SUNARP — sin catálogo de compra

Esta versión conserva el estilo (azul marino, fondo crema y tipografía del portal)
y los módulos originales sin alterar su HTML/CSS. La portada React ahora enlaza
al sistema existente. Se eliminó de la aplicación React el proceso de selección
de servicios con precio, carrito, checkout, pedidos y seguimiento ficticios.

## Páginas de React

- `#inicio`: accesos directos al sistema original.
- `#servicios`: directorio informativo sin precios ni botones de compra;
  puede tomar nombres y descripciones de Neon a través de `/api/servicios`.
- `#guia`: requisitos orientativos, sin cálculos de importes.

Los enlaces a trámites, usuarios, consultas, citas y pagos del sistema original
continúan en `public/sistema/`. Las operaciones reales requieren el backend.
Las rutas antiguas `#catalogo`, `#carrito` y `#checkout` ya no muestran compras.

## Ejecución

```powershell
cd frontend
npm install
npm run dev
```

Para producción configura la variable **pública** `VITE_API_URL` con la URL de
Render terminada en `/api`. No añadas secretos al frontend.

La API conserva sus rutas de Postman para la Semana 15; eliminar el carrito
React no significa borrar pagos o trámites existentes en PostgreSQL.
