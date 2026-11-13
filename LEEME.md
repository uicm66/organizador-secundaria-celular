# Organizador Secundaria — sitio público para celulares

Sitio estático. **No guarda datos de ninguna escuela**: la lista de maestros viaja dentro del enlace que genera
el programa de cada escuela, y todo lo que se captura se queda en el celular de quien lo usa.

## `fcp/` — puerta con el escudo de una escuela (2026-11-12)

`fcp/index.html` es solo una **puerta**: tiene el escudo de la escuela del dueño como ícono para «Añadir a pantalla de inicio» del iPhone y
abre la misma app de `app/` (misma dirección de datos, mismo respaldo). No contiene datos de la escuela. `app/` se regenera con
`generar-sitio-celular.cjs` y NO toca `fcp/`. Las demás escuelas siguen usando `app/` con su ícono neutro.
