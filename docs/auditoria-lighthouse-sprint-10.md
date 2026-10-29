# Auditoría Lighthouse — Sprint 10

Fecha de línea base: 26 de octubre de 2026  
Entorno: `https://swap.jhgo.online`  
Herramienta: Lighthouse 13, Chrome, sesión autenticada de prueba

## Puntajes antes de las correcciones

| Vista | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Login | Móvil | 78 | 92 | 100 | 92 |
| Login | Escritorio | 83 | 92 | 100 | 92 |
| Descubre | Móvil | 86 | 88 | 100 | 92 |
| Descubre | Escritorio | 97 | 88 | 100 | 92 |
| Perfil | Móvil | 88 | 92 | 100 | 91 |
| Perfil | Escritorio | 100 | 92 | 100 | 91 |
| Chat | Móvil | 99 | 91 | 100 | 91 |
| Chat | Escritorio | 99 | 91 | 100 | 91 |

El detalle de publicación se evaluó como instantánea con el modal abierto, porque no tiene una ruta independiente. Obtuvo 92 en accesibilidad, 100 en buenas prácticas y 83 en SEO. Lighthouse no calcula rendimiento en modo instantánea; para esa categoría se utiliza como referencia la navegación de Descubre, que obtuvo 86 en móvil y 97 en escritorio.

## Problemas de mayor impacto y correcciones

1. El contenedor global de notificaciones tenía un `aria-label` no permitido para un `div`. Se agregó `role="region"`.
2. El botón para mostrar la contraseña y los indicadores del carrusel tenían objetivos táctiles pequeños. Se ampliaron sus áreas interactivas sin agrandar visualmente los puntos.
3. Producción servía HTML para `/robots.txt`. Se agregaron las rutas generadas `robots.ts` y `sitemap.ts`, configurables mediante `NEXT_PUBLIC_SITE_URL`.
4. Varios controles no incluían su texto visible dentro del nombre accesible. Se corrigieron el botón de likes y el acceso al perfil del vendedor.
5. Colores de botones, etiquetas, estados y acciones en tema oscuro no alcanzaban contraste WCAG AA. Se separó el color de acento del color de superficie y se ajustaron los tonos con relaciones mínimas de 5.06:1 en los casos detectados.
6. La imagen principal del login no se descubría temprano como recurso LCP. Se marcó con `preload` mediante `next/image`.
7. El layout cargaba los modales de publicación y bienvenida aun en las rutas de autenticación. Se pasaron a importación dinámica para reducir JavaScript inicial.

## Verificación posterior

Los puntajes posteriores deben medirse nuevamente en producción después de desplegar este cambio, conservando la misma matriz de vistas, dispositivos y sesión de prueba. Este paso no se puede sustituir por una medición local porque el criterio exige validar las correcciones desplegadas.

| Vista | Móvil | Escritorio |
| --- | --- | --- |
| Login | Pendiente de despliegue | Pendiente de despliegue |
| Descubre | Pendiente de despliegue | Pendiente de despliegue |
| Detalle de publicación | Pendiente de despliegue | Pendiente de despliegue |
| Perfil | Pendiente de despliegue | Pendiente de despliegue |
| Chat | Pendiente de despliegue | Pendiente de despliegue |

Al repetir la prueba, se debe comprobar específicamente que ya no fallen las auditorías `aria-prohibited-attr`, `target-size`, `label-content-name-mismatch`, `color-contrast`, `robots-txt` y `lcp-discovery-insight` en los elementos corregidos.
