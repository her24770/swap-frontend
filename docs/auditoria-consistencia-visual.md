# Auditoría de consistencia visual

**Fecha:** 12 de octubre de 2026  
**Alcance:** colores, tipografía, espaciados y componentes de los módulos de usuario y moderación.  
**Base de comparación:** `src/styles/variables.css`, `src/styles/fonts.ts`, estilos globales y componentes compartidos existentes.

## Resultado ejecutivo

La aplicación tiene una identidad base reconocible —verde Swap, fondos claros/oscuros y las familias Jockey One, Palanquin y Lato—, pero esa identidad no está expresada como un sistema completo. La revisión estática encontró:

- 103 archivos CSS.
- 259 usos de colores literales fuera de `variables.css`, distribuidos en 67 archivos.
- 35 expresiones diferentes de `font-size`.
- 33 expresiones diferentes de `border-radius`.
- 234 elementos `<button>` en 71 archivos, mientras `Button.tsx` está vacío y la apariencia compartida depende de clases CSS aplicadas manualmente.
- Variables semánticas usadas pero no definidas: `--swap-error-color`, `--swap-error-background`, `--swap-error-border`, `--swap-primary-color-light` y `--swap-text-secondary`.

El riesgo visual más alto está en modo oscuro: varios componentes mantienen superficies y textos de la paleta clara. Después siguen la divergencia de colores semánticos y la ausencia de componentes base funcionales para botones y modales.

## Identidad visual tomada como referencia

| Rol | Referencia actual |
| --- | --- |
| Color primario | `--swap-primary-color`: `#007329` en claro y `#118a3f` en oscuro |
| Fondos | `--swap-primary-background`, `--swap-secondary-background`, `--swap-tertiary-background` |
| Texto | `--swap-primary-text-color`, `--swap-secondary-text-color`, `--swap-tertiary-text-color` |
| Estados | `--swap-danger-*`, `--swap-success-*`, `--swap-warning-*` |
| Títulos | Jockey One (`--swap-font-titulos`) |
| Subtítulos | Palanquin (`--swap-font-subtitulos`) |
| Texto y controles | Lato (`--swap-font-textos`) |

> No se encontró una guía visual separada en el repositorio. Por ello, los tokens y fuentes anteriores se consideran la fuente de verdad disponible.

## Desviaciones priorizadas

### VIS-01 — Componentes incompatibles con modo oscuro

**Prioridad:** alta  
**Categoría:** color

Hay componentes con fondo y texto claros codificados directamente, por lo que no reaccionan al atributo `data-theme="dark"`:

- `Toast.css` fuerza fondo `#ffffff` y textos `#111827`, `#6b7280`, `#9ca3af` y `#374151`.
- `EstadoTag.css` fuerza el menú desplegable blanco y estados con colores fijos.
- `MensajesBurbuja.css` fija los mensajes propios en `#bbf7d0` / `#166534`.
- `AcuerdoBanner.css` fija propuestas amarillas y enviadas azules de paleta clara.
- `TablaReportes.css` fija las opciones del selector en blanco y gris oscuro.
- El badge suspendido de `UsuariosModeracion.css` usa naranja fijo, sin variante oscura.

**Resultado esperado:** superficies, texto, bordes y estados deben usar tokens con variantes clara y oscura, manteniendo contraste legible.

**Vistas a verificar:**

- `/es/Chat`: conversación con mensajes propios y ajenos; acuerdo pendiente, enviado y vacío.
- `/es/` o cualquier módulo: provocar un toast de éxito, error, información y advertencia.
- `/es/materiales` o `/es/negocios`: abrir el selector de estado de una publicación propia.
- `/es/moderacion/reportes`: abrir filtros y selector de estado.
- `/es/moderacion/usuarios`: revisar badges de activo, bloqueado y suspendido.

Verificar todas en tema claro y oscuro.

### VIS-02 — Variables semánticas inexistentes y fallbacks divergentes

**Prioridad:** alta  
**Categoría:** color / mantenibilidad

Se utilizan variables que no existen en `variables.css`. El navegador termina aplicando fallbacks distintos por componente:

- `--swap-error-color` cae en `#e53e3e` o `#dc2626` según el archivo.
- `--swap-error-background` y `--swap-error-border` solo aparecen como usos.
- `--swap-primary-color-light` cae en un verde RGBA diferente al token principal.
- `--swap-text-secondary` cae en `#6b7280`, aunque el token existente se llama `--swap-tertiary-text-color`.

**Resultado esperado:** una única nomenclatura semántica y valores definidos para ambos temas; ningún componente debe decidir su propio fallback de marca.

**Vistas a verificar:**

- `/es/`: errores de carga, publicación guardada y badge de acuerdo pendiente.
- `/es/perfil`: contactos, comentarios y estados de error.
- `/es/moderacion/publicaciones` y `/es/moderacion/palabras`: error de carga/guardado y acción destructiva.

### VIS-03 — Colores de estado no coinciden entre componentes

**Prioridad:** alta  
**Categoría:** color / componentes

Los tokens declaran peligro `#c90f0f`, éxito `#06ab43` y advertencia `#854F0B` en tema claro, pero los componentes usan además:

- Peligro: `#DC2626`, `#B91C1C`, `#ef4444`, `#e53e3e` y `#dc2626`.
- Éxito: `#10B981`, `#059669`, `#22c55e` y `#16a34a`.
- Advertencia: `#f59e0b`, `#d97706` y `#bb7600`.
- Información: varios azules sin token común.

Esto hace que una misma intención —por ejemplo eliminar, error o éxito— cambie de color entre botones, toasts, badges y tarjetas.

**Resultado esperado:** cada intención semántica debe tener un solo par de tokens de superficie/texto/borde, con estados hover definidos.

**Vistas a verificar:**

- `/es/perfil`: botones, comentarios, certificaciones y valoración.
- `/es/materiales`: like, favorito, edición y eliminación de tarjetas.
- `/es/moderacion/publicaciones`: badges de estado y botón de desactivación.
- `/es/moderacion/usuarios`: acciones de bloqueo/suspensión.
- Cualquier ruta: comparar los cuatro tipos de toast.

### VIS-04 — Jerarquía tipográfica aplicada de forma distinta por módulo

**Prioridad:** media  
**Categoría:** tipografía

La intención de fuentes está definida, pero el mismo nivel jerárquico no usa siempre la misma familia:

- El título principal de listados usa Jockey One en `PublicacionesList.css`.
- Los títulos principales de usuarios y publicaciones de moderación usan Palanquin.
- El título de la tabla de reportes vuelve a Jockey One.
- Login usa Palanquin para el título; registro usa Jockey One.
- Algunos títulos de modal usan Jockey One y otros Palanquin.

**Resultado esperado:** definir y aplicar roles constantes, por ejemplo `display/page title`, `section title`, `body`, `label` y `caption`, independientemente del módulo.

**Vistas a verificar:**

- Comparar `/es/`, `/es/tutorias`, `/es/materiales` y `/es/negocios`.
- Comparar `/es/login`, `/es/registro` y `/es/moderacion/login`.
- Comparar `/es/moderacion/usuarios`, `/es/moderacion/publicaciones` y `/es/moderacion/reportes`.
- Abrir en paralelo los modales de filtros, configuración, detalle de publicación y reporte.

### VIS-05 — Escala tipográfica fragmentada

**Prioridad:** media  
**Categoría:** tipografía / espaciado vertical

Se encontraron 35 valores de tamaño de fuente. Además de la escala binaria habitual (`0.75rem`, `0.875rem`, `1rem`, etc.), aparecen valores aislados como `0.8rem`, `0.82rem`, `0.85rem`, `0.9rem`, `0.95rem`, `1.05rem`, `1.1rem`, `1.15rem`, `1.3rem`, `12px` y `14px`.

Las diferencias son pequeñas pero perceptibles al comparar tablas, filtros, tarjetas y modales. También cambian la altura visual de controles que deberían verse equivalentes.

**Resultado esperado:** limitar tamaños y alturas de línea a una escala tipográfica documentada.

**Vistas a verificar:**

- `/es/moderacion/usuarios` y `/es/moderacion/publicaciones`: filtros, cabeceras, badges y paginación.
- `/es/Chat`: sidebar, panel, mensajes y barra de entrada.
- Modal de configuración desde la barra superior.
- `/es/perfil/historial`: título, filtros y tarjetas.

### VIS-06 — Escala de espaciado y radios no normalizada

**Prioridad:** media  
**Categoría:** espaciado

No existen tokens globales de espaciado, radios o sombras. Los módulos combinan `px`, `rem` y decimales locales. Se encontraron 33 expresiones de `border-radius`; para formas equivalentes aparecen, entre otros, `6px`, `0.375rem`, `8px`, `0.5rem`, `12px`, `0.75rem`, `16px`, `1rem`, `999px`, `9999px`, `9999rem` y `50%`.

Ejemplos:

- `PostCard.css` combina espaciados en píxeles y rem dentro de la misma tarjeta.
- `SettingsModal.css` usa mayoritariamente píxeles, mientras otros modales usan rem.
- Controles equivalentes alternan radios de `0.375rem`, `0.5rem` y `0.75rem`.

**Resultado esperado:** adoptar una escala común para separación, densidad, radio y sombra; conservar excepciones solo para círculos y pills.

**Vistas a verificar:**

- `/es/`, `/es/tutorias`, `/es/materiales` y `/es/negocios`: comparar tarjetas, filtros y separación de secciones.
- `/es/perfil`: comparar cabecera, secciones, tarjetas y modales.
- `/es/moderacion/usuarios`, `/es/moderacion/publicaciones` y `/es/moderacion/reportes`: comparar densidad de tabla/tarjeta y controles.
- Revisar en anchos de 390 px, 768 px y 1440 px.

### VIS-07 — Sistema de botones incompleto

**Prioridad:** alta  
**Categoría:** componentes

`src/components/ui/Button/Button.tsx` está vacío. Existe `Button.css`, pero cada módulo debe construir manualmente el botón y elegir clases, o definir estilos propios. El inventario contiene 234 `<button>` nativos en 71 archivos. Esto no implica que todos deban verse iguales —los botones de icono son una excepción válida—, pero no hay una API que garantice tamaños, variantes, foco, disabled e iconografía consistentes.

Además, las variantes compartidas usan colores fijos distintos de los tokens semánticos.

**Resultado esperado:** un componente funcional con variantes primaria, secundaria, outline, peligro, éxito, advertencia e icon-only, usando tokens y estados consistentes.

**Vistas a verificar:**

- `/es/login`, `/es/registro` y `/es/forgot-password`: acciones principales y secundarias.
- `/es/`: crear publicación, filtros y acciones de tarjetas.
- `/es/perfil`: editar, contactar, guardar y eliminar.
- `/es/moderacion/publicaciones`, `/es/moderacion/usuarios`, `/es/moderacion/palabras` y `/es/moderacion/reportes`.

Comparar altura, padding, radio, peso tipográfico, foco, hover y disabled.

### VIS-08 — Infraestructura de modal incompleta y estilos duplicados

**Prioridad:** media  
**Categoría:** componentes / espaciado

`Modal.css` contiene un `TODO` y solo define el overlay; no existe `Modal.tsx`. Cada flujo crea su propia tarjeta, encabezado, cierre, ancho, padding, radio y z-index. Esto explica diferencias visibles entre configuración, filtros, publicación, perfil, reporte, mensajes y términos.

**Resultado esperado:** compartir overlay, contenedor, encabezado, botón de cierre, tamaños y separación; permitir variantes solo cuando el contenido lo requiera.

**Vistas a verificar:**

- `/es/`: modal de filtros, crear publicación y detalle de publicación.
- `/es/perfil`: actualizar perfil, contactos, certificaciones y tags.
- Barra superior: notificaciones y configuración.
- `/es/moderacion/reportes`: detalle y justificación.
- `/es/registro`: términos y condiciones.

### VIS-09 — Autenticación no comparte una composición visual única

**Prioridad:** media  
**Categoría:** color / tipografía / espaciado

Login y recuperación usan fondo fotográfico desenfocado y tarjeta centrada; registro usa una página plana a dos columnas; el login de moderación usa un degradado oscuro. La diferenciación de moderación puede ser intencional, pero el salto entre login, recuperación y registro debe validarse como decisión de identidad. Los formularios de login y moderación también duplican casi todos sus estilos, lo que facilita que se separen con cambios futuros.

**Resultado esperado:** conservar diferencias de contexto aprobadas, pero alinear logo, jerarquía, ancho de formulario, inputs, acciones, radios y espaciado.

**Vistas a verificar:**

- `/es/login`
- `/es/forgot-password`, incluyendo solicitud, código y nueva contraseña.
- `/es/registro`, incluyendo verificación, tags y términos.
- `/es/moderacion/login`

Revisar en 390 px y 1440 px, tema claro y oscuro.

### VIS-10 — Fallbacks de componentes introducen colores ajenos a la marca

**Prioridad:** baja  
**Categoría:** color / mantenibilidad

Algunos componentes declaran fallbacks morados (`#7c3aed`) o verdes alternos (`#10b981`) dentro de `var(...)`, por ejemplo carrusel y tarjetas. Hoy el token principal normalmente existe, por lo que el fallback no se ve; si cambia el contexto de montaje o falla la carga de variables, aparece una identidad diferente.

**Resultado esperado:** fallbacks equivalentes a la paleta Swap o ausencia de fallback cuando los tokens globales son obligatorios.

**Vistas a verificar:**

- `/es/`, `/es/tutorias`, `/es/materiales` y `/es/negocios`: flechas e indicadores de carrusel.
- `/es/perfil`: tarjetas y banners.

## Matriz mínima de verificación visual

Usar esta matriz después de corregir los hallazgos. Las rutas protegidas requieren una sesión con datos suficientes para mostrar estados y acciones.

| Estado | Vista | Qué comparar |
| --- | --- | --- |
| [ ] | `/es/login` | Tarjeta, título, inputs, CTA, enlace secundario, foco y tema oscuro |
| [ ] | `/es/registro` | Jerarquía, separación de columnas, inputs, tags, términos y responsive |
| [ ] | `/es/forgot-password` | Consistencia con login en sus tres pasos |
| [ ] | `/es/` | Título, buscador, filtros, carruseles, tarjetas, FAB y toast |
| [ ] | `/es/tutorias` | Tarjetas de tutor, horarios, filtros y estados vacíos |
| [ ] | `/es/materiales` | Tarjetas, estados, acciones y detalle de publicación |
| [ ] | `/es/negocios` | Tarjetas, banners, estados y detalle de publicación |
| [ ] | `/es/Chat` | Sidebar, mensajes, acuerdos e input en ambos temas |
| [ ] | `/es/perfil` | Cabecera, tabs/secciones, comentarios, contactos y modales |
| [ ] | `/es/perfil/historial` | Título, filtros, tarjetas y paginación |
| [ ] | `/es/moderacion/login` | Relación visual con autenticación de usuario |
| [ ] | `/es/moderacion` | Tarjetas de acceso, tipografía y espaciado general |
| [ ] | `/es/moderacion/publicaciones` | Filtros, cards, estados y botones semánticos |
| [ ] | `/es/moderacion/usuarios` | Tabla, badges, acciones y responsive |
| [ ] | `/es/moderacion/reportes` | Tabla, filtros, selects, paginación y modal de detalle |
| [ ] | `/es/moderacion/palabras` | Formularios, tabla/lista, acción destructiva y errores |

Para cada vista:

1. Revisar tema claro y oscuro.
2. Revisar anchos de 390 px, 768 px y 1440 px.
3. Comparar estado normal, hover, focus-visible, disabled, loading, vacío y error cuando aplique.
4. Registrar captura antes/después con la misma sesión y contenido.

## Orden recomendado de corrección

1. Completar tokens semánticos y eliminar variables inexistentes.
2. Corregir modo oscuro en toast, estados, chat y reportes.
3. Implementar el componente Button y migrar primero las acciones de texto.
4. Definir roles y escala tipográfica.
5. Definir tokens de espaciado, radios y sombras.
6. Implementar la base compartida de Modal.
7. Alinear autenticación y después revisar perfiles, publicaciones y moderación.
