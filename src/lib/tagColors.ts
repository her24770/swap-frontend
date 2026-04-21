/**
 * tagColors.ts
 *
 * Sistema de colores jerárquico para etiquetas.
 *
 * Cada "familia" de colores tiene 6 tonos (claro → oscuro).
 * Los padres toman el tono más oscuro (índice 5), los hijos
 * van descendiendo: hijo directo = 4, nieto = 3, etc.
 *
 * Si una etiqueta no tiene padre conocido, se le asigna la
 * familia por su id_etiqueta (módulo sobre el total de familias).
 */

export interface TagColorConfig {
  bg: string;
  text: string;
  border: string;
}

/** 8 familias de color, cada una con 6 niveles (0 = más claro, 5 = más oscuro) */
const COLOR_FAMILIES: TagColorConfig[][] = [
  // Verde (familia por defecto para "Ingeniería")
  [
    { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    { bg: "#bbf7d0", text: "#166534", border: "#86efac" },
    { bg: "#86efac", text: "#14532d", border: "#4ade80" },
    { bg: "#4ade80", text: "#14532d", border: "#22c55e" },
    { bg: "#16a34a", text: "#f0fdf4", border: "#15803d" },
    { bg: "#166534", text: "#dcfce7", border: "#14532d" },
  ],
  // Azul
  [
    { bg: "#dbeafe", text: "#1e3a8a", border: "#bfdbfe" },
    { bg: "#bfdbfe", text: "#1e3a8a", border: "#93c5fd" },
    { bg: "#93c5fd", text: "#1e40af", border: "#60a5fa" },
    { bg: "#60a5fa", text: "#1e3a8a", border: "#3b82f6" },
    { bg: "#2563eb", text: "#eff6ff", border: "#1d4ed8" },
    { bg: "#1e3a8a", text: "#dbeafe", border: "#1e40af" },
  ],
  // Violeta
  [
    { bg: "#ede9fe", text: "#4c1d95", border: "#ddd6fe" },
    { bg: "#ddd6fe", text: "#4c1d95", border: "#c4b5fd" },
    { bg: "#c4b5fd", text: "#4c1d95", border: "#a78bfa" },
    { bg: "#a78bfa", text: "#2e1065", border: "#8b5cf6" },
    { bg: "#7c3aed", text: "#f5f3ff", border: "#6d28d9" },
    { bg: "#4c1d95", text: "#ede9fe", border: "#3b0764" },
  ],
  // Rosa / Fucsia
  [
    { bg: "#fce7f3", text: "#831843", border: "#fbcfe8" },
    { bg: "#fbcfe8", text: "#831843", border: "#f9a8d4" },
    { bg: "#f9a8d4", text: "#831843", border: "#f472b6" },
    { bg: "#f472b6", text: "#500724", border: "#ec4899" },
    { bg: "#db2777", text: "#fdf2f8", border: "#be185d" },
    { bg: "#831843", text: "#fce7f3", border: "#500724" },
  ],
  // Naranja
  [
    { bg: "#ffedd5", text: "#7c2d12", border: "#fed7aa" },
    { bg: "#fed7aa", text: "#7c2d12", border: "#fdba74" },
    { bg: "#fdba74", text: "#7c2d12", border: "#fb923c" },
    { bg: "#fb923c", text: "#431407", border: "#f97316" },
    { bg: "#ea580c", text: "#fff7ed", border: "#c2410c" },
    { bg: "#7c2d12", text: "#ffedd5", border: "#431407" },
  ],
  // Cian / Teal
  [
    { bg: "#ccfbf1", text: "#134e4a", border: "#99f6e4" },
    { bg: "#99f6e4", text: "#134e4a", border: "#5eead4" },
    { bg: "#5eead4", text: "#0f4039", border: "#2dd4bf" },
    { bg: "#2dd4bf", text: "#134e4a", border: "#14b8a6" },
    { bg: "#0d9488", text: "#f0fdfa", border: "#0f766e" },
    { bg: "#134e4a", text: "#ccfbf1", border: "#0f4039" },
  ],
  // Amarillo / Ámbar
  [
    { bg: "#fef9c3", text: "#713f12", border: "#fef08a" },
    { bg: "#fef08a", text: "#713f12", border: "#fde047" },
    { bg: "#fde047", text: "#713f12", border: "#facc15" },
    { bg: "#facc15", text: "#422006", border: "#eab308" },
    { bg: "#ca8a04", text: "#fefce8", border: "#a16207" },
    { bg: "#713f12", text: "#fef9c3", border: "#422006" },
  ],
  // Rojo
  [
    { bg: "#fee2e2", text: "#7f1d1d", border: "#fecaca" },
    { bg: "#fecaca", text: "#7f1d1d", border: "#fca5a5" },
    { bg: "#fca5a5", text: "#7f1d1d", border: "#f87171" },
    { bg: "#f87171", text: "#450a0a", border: "#ef4444" },
    { bg: "#dc2626", text: "#fef2f2", border: "#b91c1c" },
    { bg: "#7f1d1d", text: "#fee2e2", border: "#450a0a" },
  ],
];

/**
 * Determina el índice de familia de color a partir del id de una etiqueta padre.
 * Los padres (sin padre propio) determinan la familia de toda su línea.
 */
export function getFamilyIndex(parentId: number | null | undefined, selfId: number): number {
  const baseId = parentId ?? selfId;
  return baseId % COLOR_FAMILIES.length;
}

/**
 * Devuelve la configuración de color para una etiqueta.
 *
 * @param selfId      - id_etiqueta de esta etiqueta
 * @param parentId    - id_etiqueta del padre (null/undefined si es raíz)
 * @param depth       - profundidad en el árbol (0 = padre/raíz, 1 = hijo, 2 = nieto…)
 */
export function getTagColor(
  selfId: number,
  parentId: number | null | undefined,
  depth: number = 0
): TagColorConfig {
  const familyIndex = getFamilyIndex(parentId, selfId);
  const family = COLOR_FAMILIES[familyIndex];

  // Padres usan el nivel 5 (más oscuro/intenso),
  // los hijos bajan: 4, 3, 2… con un mínimo en 1.
  const levelIndex = Math.max(1, 5 - depth);

  return family[levelIndex];
}

/**
 * Mapa estático de colorKey (string) → familia de color.
 * Permite compatibilidad con el sistema antiguo basado en strings.
 */
const COLOR_KEY_MAP: Record<string, number> = {
  assembler:    2,   // violeta
  comunicacion: 1,   // azul
  electronica:  5,   // cian
  fisica:       7,   // rojo
  diseno:       4,   // naranja
  biologia:     0,   // verde
  matematicas:  6,   // ámbar
  historia:     3,   // rosa
  idiomas:      1,   // azul
  economia:     6,   // ámbar
  arte:         3,   // rosa
  quimica:      5,   // cian
  programacion: 2,   // violeta
};

/**
 * Obtiene color por colorKey legacy (compatibilidad con perfiles existentes).
 */
export function getTagColorByKey(colorKey: string, depth: number = 0): TagColorConfig {
  const familyIndex = COLOR_KEY_MAP[colorKey.toLowerCase()] ?? 0;
  const family = COLOR_FAMILIES[familyIndex];
  const levelIndex = Math.max(1, 5 - depth);
  return family[levelIndex];
}