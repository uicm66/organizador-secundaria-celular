# Organizador Secundaria — sitio público para celulares

Sitio estático. **No guarda datos de ninguna escuela**: la lista de maestros viaja dentro del enlace que genera
el programa de cada escuela, y todo lo que se captura se queda en el celular de quien lo usa.

## `fcp/` — la misma app con el escudo de una escuela como ícono (2026-11-12)

`fcp/` es una **copia completa** de `app/` pero con el escudo de la escuela del dueño como ícono y el nombre «Organizador FCP» (iOS toma el
ícono y el nombre de la página donde se agrega a la pantalla de inicio, por eso un redireccionamiento no sirve). No contiene datos de la escuela.
Se genera con `Herramientas-Build/generar-sitio-fcp.sh` (después de `generar-sitio-celular.cjs`, para que las dos queden con la misma versión).
Las demás escuelas siguen usando `app/` con su ícono neutro.
