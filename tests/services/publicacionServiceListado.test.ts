import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../src/lib/apiClient";
import { publicacionService } from "../../src/services/publicacionService";

afterEach(() => vi.restoreAllMocks());

describe("publicacionService.getAll", () => {
  it("muestra un listado vacío cuando el backend excluye las publicaciones propias", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue({ status: 404, message: "No se encontraron publicaciones" });

    await expect(publicacionService.getAll({ tipo: "material" })).resolves.toEqual({ data: [], total: 0 });
  });

  it("conserva los errores de conexión para que la página pueda avisarlos", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue({ status: 503, message: "Servicio no disponible" });

    await expect(publicacionService.getAll({ tipo: "material" })).rejects.toMatchObject({ status: 503 });
  });
});
