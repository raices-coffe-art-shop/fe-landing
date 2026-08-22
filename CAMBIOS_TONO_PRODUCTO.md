# Eliminación de “Tono visual” en productos

- Se eliminó **“Tono visual” de la interfaz de edición** de productos en Sanity.
- Los productos nuevos ya no guardan un tono visual.
- El frontend del catálogo dejó de depender de `tone`; las tarjetas usan únicamente los estilos generales de la marca.
- Las consultas GROQ y los tipos de catálogo ya no solicitan ni exigen ese campo.
- Los datos de respaldo y scripts de migración/seed dejaron de escribir `tone`.
- No se eliminaron los tonos usados por otras partes del sitio (personas, léxico, links, etc.), porque son sistemas independientes.
- Se mantiene únicamente una definición `tone` **oculta y de solo lectura** como compatibilidad con documentos antiguos. Así Sanity no muestra avisos de “Unknown field”; el cliente no ve el campo y el frontend no lo usa.
- No hace falta migrar ni borrar los valores antiguos para publicar.
