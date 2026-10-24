# Checks obligatorios del frontend

El workflow [CI](../.github/workflows/ci.yml) se ejecuta en cada pull request hacia `develop` y `main`. Los cuatro jobs nuevos publican estos nombres de status check:

| Job | Status check | Comando |
| --- | --- | --- |
| `lint` | `Lint` | `npm run lint` |
| `typecheck` | `Typecheck` | `npm run typecheck` |
| `pruebas` | `Pruebas` | `npm run test:run` |
| `build` | `Build` | `npm run build` |

Para exigirlos antes de fusionar, configurar una regla de protección para `develop` y otra para `main` en **Settings → Rules → Rulesets** (o en **Branches → Branch protection rules**). Activar **Require status checks to pass** y seleccionar los cuatro checks anteriores con origen **GitHub Actions**. Los checks deben haber corrido al menos una vez en GitHub para aparecer en el selector.

La activación requiere que lint y pruebas estén en verde (ST-TT-S10-06-3); de lo contrario, los pull requests quedarán bloqueados.
