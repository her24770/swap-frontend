# Auditoría de legibilidad y comprensión de iconos

Fecha de revisión técnica: 2026-10-08. Alcance: temas claro y oscuro,
navegación, autenticación, publicaciones, chat, acuerdos y moderación.

## Hallazgos de legibilidad

| Prioridad | Hallazgo y evidencia | Corrección sugerida |
|---|---|---|
| Alta | En tema oscuro, `--swap-secondary-text-color` (`#ebebeb`) sobre `--swap-primary-color` (`#118a3f`) tiene contraste **3.72:1**. Se usa en botones, badges y estados activos con texto normal. | Oscurecer el verde del tema oscuro hasta obtener 4.5:1 o usar un color de texto/fondo que alcance 4.5:1 en todos los estados. Mantener una variable específica para texto sobre color primario. |
| Alta | `.button--success` usa blanco sobre `#10B981`: **2.54:1**. | Usar texto oscuro compatible o un verde más oscuro. Verificar normal, hover y disabled. |
| Alta | `.button--warning` usa blanco sobre `#f59e0b`: **2.15:1**. | Usar texto casi negro sobre ámbar o un fondo considerablemente más oscuro. |
| Alta | `.filter-tag__label` combina texto terciario con fondo terciario: **3.94:1** en claro y **4.04:1** en oscuro. | Usar `--swap-primary-text-color` o crear una pareja de tokens que alcance 4.5:1. |
| Media | `--swap-primary-border-color` tiene **2.34:1** contra blanco y **1.72:1** contra el fondo principal oscuro. Muchos inputs y controles dependen de ese borde para reconocer sus límites. | Crear un token de borde de controles con al menos 3:1 respecto de fondos adyacentes; no reutilizar el mismo token para divisores decorativos. |
| Media | Hay **86 declaraciones** de texto entre 10 y 12 px (`0.625rem`, `0.6875rem`, `0.75rem`) y **60 iconos** de 10–14 px. WCAG AA no establece un mínimo general de fuente, pero estos tamaños elevan el riesgo de baja legibilidad, especialmente en badges, chat y tablas. | Usar 14 px para texto funcional y 12 px solo para metadatos secundarios; comprobar zoom al 200%, reflow y preferencias de tamaño del navegador. No confundir tamaño del glifo con tamaño del objetivo interactivo. |
| Media | El overlay de cámara de `PostCard` es un `div role="button"` con clic, pero sin `tabIndex` ni manejo de Enter/Espacio. | Reemplazarlo por `button`/`label` nativo o añadir foco y teclado equivalentes. |

Los ratios se calcularon con la luminancia relativa definida por WCAG. Para
texto normal se aplicó 4.5:1, para texto grande 3:1 y para límites/iconos
esenciales de interfaz 3:1. Los tamaños pequeños se reportan como riesgo de
legibilidad, no como fallo automático por tamaño de fuente.

## Aspectos que ya están bien encaminados

- Navbar, chat, publicaciones y acciones de moderación incluyen `aria-label`
  o texto visible en sus botones principales.
- Los botones de navbar y enlaces de sidebar superan 24×24 px por su icono más
  padding, aunque debe confirmarse su caja calculada en navegador.
- El texto terciario sobre fondo blanco/secundario claro alcanza 4.76:1/4.55:1.
- Blanco sobre el verde principal claro alcanza 6.03:1.

## Prueba corta de comprensión

Participantes recomendados: 5 personas representativas de estudiantes que no
hayan trabajado en el desarrollo. Probar escritorio y móvil si ambos forman
parte del alcance del sprint.

Iconos principales a evaluar, sin tooltip ni etiqueta visible durante la
pregunta:

1. Menú (`Menu`).
2. Configuración (`Settings`).
3. Notificaciones (`Bell`).
4. Guardar publicación (`Bookmark`).
5. Me gusta (`Heart`).
6. Destacar/quitar destacado (`Pin`/`PinOff`).
7. Más opciones (`MoreVertical`).
8. Crear o revisar acuerdo (`Handshake`).
9. Filtros (`SlidersHorizontal`).
10. Moderación: advertir, bloquear, suspender y reactivar
    (`AlertTriangle`, `Ban`, `Clock`, `RotateCcw`).

Guion por icono:

1. “¿Qué crees que ocurrirá si presionas este icono?”
2. “¿Qué tan seguro estás, de 1 a 5?”
3. Después de responder, permitir la interacción y preguntar si el resultado
   coincidió con lo esperado.

No explicar el icono, no mostrar el atributo `title` y no ofrecer opciones de
respuesta. Registrar literalmente la primera interpretación.

## Criterio de decisión

- Comprensible: al menos 80% (4 de 5) identifica la acción esperada.
- Dudoso: 60% (3 de 5) o confianza mediana menor de 4.
- Poco comprensible: 40% o menos.

Para un icono dudoso o poco comprensible, aplicar en este orden: etiqueta de
texto visible, combinación icono+texto, icono más convencional y, como apoyo,
tooltip. El tooltip por sí solo no resuelve móvil ni descubribilidad.

La tabla de resultados está en `docs/prueba-comprension-iconos.csv`. Esta parte
del criterio queda pendiente hasta realizar sesiones con usuarios reales.
