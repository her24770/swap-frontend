import type { Tag } from "../types/tag";

// Tags por tipo de publicación (para Materiales, Negocios, Tutorías, Home)
export const TAG_MATERIAL: Tag = { id: 1, name: "Material", colorKey: "biologia" };
export const TAG_TUTORIA: Tag  = { id: 2, name: "Tutoría",  colorKey: "comunicacion" };
export const TAG_NEGOCIO: Tag  = { id: 3, name: "Negocio",  colorKey: "diseno" };

export const TIPO_TAG_MAP: Record<number, Tag> = {
  1: TAG_MATERIAL,
  2: TAG_TUTORIA,
  3: TAG_NEGOCIO,
};

// Tags de categorías/materias (para perfiles de usuario)
export const TAGS_MATERIAS: Tag[] = [
  { id: 10, name: "Assembler",    colorKey: "assembler" },
  { id: 11, name: "Comunicación", colorKey: "comunicacion" },
  { id: 12, name: "Electrónica",  colorKey: "electronica" },
  { id: 13, name: "Física",       colorKey: "fisica" },
  { id: 14, name: "Diseño",       colorKey: "diseno" },
  { id: 15, name: "Biología",     colorKey: "biologia" },
];