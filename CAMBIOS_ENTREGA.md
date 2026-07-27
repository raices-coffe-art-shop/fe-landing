# Correcciones de esta entrega

- Se reemplazó la raíz global anterior por un recorrido continuo más limpio y contenido en los márgenes.
- La semilla aparece una sola vez, es sólida y ya no se muestra transparentada.
- La raíz de Historia enlaza con la animación expresiva de Huamanga/Ayacucho y reaparece después como trazo secundario hasta el cierre del sitio.
- Se restauró el apilado sticky de Personas: las tarjetas vuelven a empujarse, alternan correctamente imagen/texto y el fondo cambia de tono de manera gradual.
- Las raíces permanecen detrás de las tarjetas y se redujo la cantidad de ramificaciones para evitar el aspecto de telaraña.
- Territorio usa la fotografía local de Sacsamarca, con mayor luminosidad, saturación controlada y parallax suave.
- Se redujeron los overlays oscuros de Territorio y se suavizó el paso desde la sección anterior.
- Archivo de Campo vuelve a abrir directamente el lienzo infinito al pulsar cualquier tarjeta o el enlace de entrada.
- Toda la tarjeta del Archivo es clicable; el lienzo conserva arrastre multidireccional, rueda/trackpad, repetición infinita y vista ampliada.
- La raíz continúa discretamente por Archivo, Arte, Catálogo, Propósito y Visita, y termina de crecer en el footer.
- Se mantuvo la corrección del `package-lock.json` para evitar el error de integridad que aparecía con la entrega anterior.

## Verificaciones realizadas

- Parseo de 46 archivos TypeScript/TSX: sin errores de sintaxis.
- Comprobación semántica de los componentes modificados mediante TypeScript: sin errores.
- Imports locales: sin rutas faltantes.
- CSS: llaves y comentarios balanceados.

No fue posible ejecutar `npm run build` dentro del entorno de entrega porque no dispone de acceso DNS al registro de npm. El proyecto incluye el lock corregido para ejecutar localmente:

```bash
npm ci
npm run dev
```
