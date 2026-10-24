# Pruebas E2E

Estos seis escenarios recorren la interfaz con Chromium y usan la API, PostgreSQL
y Redis de la copia efímera de ZAP. El registro sustituye únicamente el envío
externo de correo; la creación de la cuenta y los demás flujos usan el backend real.

Para ejecutarlos localmente, desde los dos repositorios:

```bash
# Back/swap-backend
bash security/zap/run-zap.sh up

# Front/swap-frontend
npm ci
npx playwright install chromium
npm run test:e2e

# Back/swap-backend, al terminar
bash security/zap/run-zap.sh down
```

Playwright inicia el frontend en el puerto 3000 y apunta a la API aislada en
`http://localhost:3220`. El job `E2E Playwright` del CI realiza estos pasos y
publica `test-results/` como artefacto si falla algún escenario. El repositorio
backend debe estar accesible como `her24770/swap-backend` en la rama `develop`.
