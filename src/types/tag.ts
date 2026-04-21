export interface Tag {
  id: number;
  name: string;
  /** colorKey legacy para compatibilidad con perfiles (ej. "assembler", "fisica") */
  colorKey?: string;
  /** id_etiqueta del padre en BD; null/undefined = es raíz */
  parentId?: number | null;
  /** Profundidad en el árbol: 0 = raíz/padre, 1 = hijo, 2 = nieto… */
  depth?: number;
}