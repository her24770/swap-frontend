import type { Tag, UserTag } from "../types/tag";

// Tags por tipo de publicación (para Materiales, Negocios, Tutorías, Home)
export const TAG_MATERIAL: Tag = { id: 1, name: "Material", parentId: null };
export const TAG_TUTORIA: Tag = { id: 2, name: "Tutoría", parentId: null };
export const TAG_NEGOCIO: Tag = { id: 3, name: "Negocio", parentId: null };

export const TIPO_TAG_MAP: Record<number, Tag> = {
  1: TAG_MATERIAL,
  2: TAG_TUTORIA,
  3: TAG_NEGOCIO,
};


export interface EtiquetaApi {
  id_etiqueta: number;
  nombre: string;
  id_etiqueta_padre?: number | null;
}

export interface UsuarioEtiquetaRel {
  id_usuario?: number;
  id_etiqueta?: number;
  peso?: number;
  etiqueta: EtiquetaApi;
}

export interface EtiquetaRelInput {
  etiqueta: EtiquetaApi;
}

export function isParentTag(tag: Tag): boolean {
  return tag.parentId == null;
}

export function mapEtiquetaToTag(etiqueta: EtiquetaApi): Tag {
  return {
    id: etiqueta.id_etiqueta,
    name: etiqueta.nombre,
    parentId: etiqueta.id_etiqueta_padre ?? null,
  };
}

export function mapUsuarioEtiquetasToTags(relations: UsuarioEtiquetaRel[] = []): UserTag[] {
  return relations.map((rel) => ({
    ...mapEtiquetaToTag(rel.etiqueta),
    ...(rel.peso !== undefined ? { peso: rel.peso } : {}),
  }));
}

export function mapPublicacionEtiquetasToTags(
  etiquetas: EtiquetaRelInput[] | undefined,
  fallback?: { name: string }
): Tag[] {
  if (etiquetas?.length) {
    return etiquetas.map((rel) => mapEtiquetaToTag(rel.etiqueta));
  }

  if (fallback) {
    return [{ id: 0, name: fallback.name, parentId: null }];
  }

  return [];
}
