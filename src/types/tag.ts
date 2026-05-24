export interface Tag {
  id: number;
  name: string;
  /** id_etiqueta del padre en BD; null/undefined = etiqueta padre */
  parentId?: number | null;
}