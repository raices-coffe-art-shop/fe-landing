# Raíces V25 — corrección final previa al merge

- Se corrigió la colisión de tipos globales de Lenis usando `window.__raicesLenis` en lugar de `window.lenis`.
- Se retiraron informes temporales de versiones intermedias y `tsconfig.tsbuildinfo`.
- El ZIP no contiene `.env.local`, `.next`, `node_modules`, Flutter ni una copia anidada del proyecto en `scripts/`.
- `scripts/` conserva únicamente utilidades legítimas de migración y mantenimiento de Sanity.
