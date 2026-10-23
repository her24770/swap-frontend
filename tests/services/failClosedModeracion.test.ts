import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { imagenService } from "../../src/services/imagenService";
import { schemaEditarPublicacion } from "../../src/schemas/zodSchemas";

describe("Moderación Fail-Closed (SWAP-603 / ST-TT-S9-01-3)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("imagenService.crearPublicacion preserva estado_nombre y message devueltos por el backend", async () => {
    // Simula respuesta 201 Created del backend bajo política fail-closed
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Tu contenido está en revisión manual antes de publicarse debido a una verificación de seguridad.",
        data: {
          id_publicacion: 42,
          imagenes: ["https://example.com/img1.jpg"],
          estado_nombre: "pendiente",
        },
      }),
    } as unknown as Response);

    const resultado = await imagenService.crearPublicacion({
      titulo: "Libro de Cálculo",
      descripcion: "Excelente estado para primer año",
      tipo_publicacion: "material",
    });

    expect(resultado.id_publicacion).toBe(42);
    expect(resultado.estado_nombre).toBe("pendiente");
    expect(resultado.message).toContain("revisión manual");
  });

  it("imagenService.actualizarPublicacion preserva estado_nombre y message del backend", async () => {
    // Simula respuesta cuando una edición pasa a revisión manual por fallo de moderación
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Tu contenido está en revisión manual antes de publicarse debido a una verificación de seguridad.",
        data: {
          urlsNuevas: ["https://example.com/img2.jpg"],
          estado_nombre: "pendiente",
        },
      }),
    } as unknown as Response);

    const resultado = await imagenService.actualizarPublicacion(42, {
      titulo: "Libro de Cálculo Actualizado",
    });

    expect(resultado.urlsNuevas).toHaveLength(1);
    expect(resultado.estado_nombre).toBe("pendiente");
    expect(resultado.message).toContain("revisión manual");
  });

  it("schemaEditarPublicacion acepta 'pendiente' como estado válido de edición", () => {
    const parseResult = schemaEditarPublicacion.safeParse({
      titulo: "Edición con estado pendiente",
      estado: "pendiente",
    });

    expect(parseResult.success).toBe(true);
  });
});
