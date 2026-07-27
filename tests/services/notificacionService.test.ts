import { afterEach, describe, expect, it, vi } from "vitest";
import { notificacionService, mapNotificacion } from "../../src/services/notificacionService";
import { apiClient } from "../../src/lib/apiClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mapNotificacion", () => {
  it("marca leida en true solo cuando el estado es 'leido'", () => {
    const base = {
      id_notificacion: 1,
      mensaje: "Tienes un nuevo mensaje",
      id_usuario: 1,
      id_estado: 7,
      fecha: "2026-07-27T10:00:00.000Z",
    };

    expect(mapNotificacion({ ...base, estado: { estado: "leido" } }).leida).toBe(true);
    expect(mapNotificacion({ ...base, estado: { estado: "enviado" } }).leida).toBe(false);
  });
});

describe("notificacionService.marcarLeida", () => {
  it("llama al PATCH con estado 'leido'", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: {} });

    await notificacionService.marcarLeida(5);

    expect(patch).toHaveBeenCalledWith("/api/notificacion/5/estado", { estado: "leido" });
  });
});

describe("notificacionService.marcarVariasLeidas", () => {
  it("llama al PATCH individual por cada id", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: {} });

    await notificacionService.marcarVariasLeidas([1, 2, 3]);

    expect(patch).toHaveBeenCalledTimes(3);
    expect(patch).toHaveBeenCalledWith("/api/notificacion/1/estado", { estado: "leido" });
    expect(patch).toHaveBeenCalledWith("/api/notificacion/2/estado", { estado: "leido" });
    expect(patch).toHaveBeenCalledWith("/api/notificacion/3/estado", { estado: "leido" });
  });
});
