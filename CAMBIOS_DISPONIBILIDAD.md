# Corrección del selector de disponibilidad

- El selector `Sí / No` ahora se marca claramente en rojo cuando no tiene ningún valor.
- También muestra el mensaje `Debes seleccionar Sí o No antes de publicar.`
- La validación `Rule.required()` se mantiene, por lo que no se puede publicar un producto con este dato vacío.
- Los productos nuevos siguen empezando con `Sí` mediante `initialValue: true`.
- Se añadió una migración puntual para colocar `Sí` en todos los productos existentes, incluyendo sus versiones publicadas y drafts.

## Aplicar a los productos que ya existen en Sanity

Primero se puede revisar sin escribir nada:

```bash
npm run sanity:availability-all-yes:dry
```

Después aplicar el cambio real:

```bash
npm run sanity:availability-all-yes
```

El segundo comando requiere `SANITY_API_WRITE_TOKEN` en `.env.local`.
