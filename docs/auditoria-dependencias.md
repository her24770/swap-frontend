# Auditoría automática de dependencias

El workflow `CI` ejecuta `npm ci` y `npm run audit:security` en cada pull
request hacia `develop` o `main`. Las vulnerabilidades altas o críticas hacen
fallar el job. El reporte aparece en el resumen de GitHub Actions y se adjunta
como artefacto durante 14 días. Los hallazgos moderados y bajos son visibles,
pero no bloquean el PR.

## Excepciones

Primero debe intentarse actualizar la dependencia y validar lint, build y
pruebas. No se debe aceptar automáticamente una actualización mayor propuesta
por `npm audit fix --force`.

Si no existe parche compatible, `.audit-ci.jsonc` permite una excepción
temporal. Cada entrada debe usar el identificador exacto `GHSA`, explicar el
alcance y ticket en `notes`, tener `expiry` máximo de 30 días y aprobarse en
PR por el responsable técnico o de seguridad. Al expirar, el hallazgo vuelve a
bloquear el pipeline. No se permiten excepciones por nombre de módulo ni omitir
todas las dependencias de desarrollo.

La excepción actual para `GHSA-vfj7-8cjw-p6xm` está limitada al advisory de
`braces`, alcanzable solo desde las herramientas de lint de Next.js. Debe
retirarse en cuanto exista una versión compatible corregida.

## Ejecución local

```bash
npm ci
npm run audit:security
```
