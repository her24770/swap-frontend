import { describe, expect, it } from "vitest";
import {
  isParentTag,
  mapEtiquetaToTag,
  mapPublicacionEtiquetasToTags,
  mapUsuarioEtiquetasToTags,
} from "../../src/lib/tags";

describe("tags helpers", () => {
  it("detects parent tags when parentId is null or undefined", () => {
    expect(isParentTag({ id: 1, name: "Material", parentId: null })).toBe(true);
    expect(isParentTag({ id: 2, name: "Tutoria" })).toBe(true);
    expect(isParentTag({ id: 4, name: "Calculo", parentId: 2 })).toBe(false);
  });

  it("maps backend etiqueta shape to frontend tag shape", () => {
    expect(
      mapEtiquetaToTag({
        id_etiqueta: 7,
        nombre: "Programacion",
        id_etiqueta_padre: 2,
      })
    ).toEqual({ id: 7, name: "Programacion", parentId: 2 });
  });

  it("maps usuario etiqueta relations", () => {
    expect(
      mapUsuarioEtiquetasToTags([
        { etiqueta: { id_etiqueta: 3, nombre: "Negocio", id_etiqueta_padre: null } },
      ])
    ).toEqual([{ id: 3, name: "Negocio", parentId: null }]);
  });

  it("uses a fallback tag when a publicacion has no etiquetas", () => {
    expect(mapPublicacionEtiquetasToTags([], { name: "Material" })).toEqual([
      { id: 0, name: "Material", parentId: null },
    ]);
  });
});
