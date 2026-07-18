# Testing

Esta carpeta concentra toda la infraestructura de pruebas del frontend.

- `config/`: setup global de Vitest y React Testing Library.
- `mocks/`: mocks compartidos para Next, browser APIs y dependencias externas.
- `utils/`: helpers reutilizables para tests, como el `render` custom.
- `globales/`: pruebas transversales de configuracion o comportamiento comun.
- `app/`, `components/`, `context/`, `hooks/`, `lib/`: tests con enfoque espejo respecto a `src/`.

Convencion espejo: un archivo de produccion como:

```text
src/components/ui/SearchBar/SearchBar.tsx
```

debe probarse en:

```text
tests/components/ui/SearchBar/SearchBar.test.tsx
```

Para paginas de Next App Router, un archivo como:

```text
src/app/[locale]/login/page.tsx
```

debe probarse en:

```text
tests/app/[locale]/login/page.test.tsx
```

Para ejecutar la suite:

```bash
npm run test:run
```
