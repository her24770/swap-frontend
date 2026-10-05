import { describe, expect, it, vi } from "vitest";
import { useDetallePublicacion } from "../../src/hooks/useDetallePublicacion";
import { publicacionService } from "../../src/services/publicacionService";
import {
  publicacionDetalleFixture,
  publicacionFixture,
} from "../fixtures/publicaciones";
import { act, renderHook } from "../utils/render";

describe("useDetallePublicacion", () => {
  it("loads publication details and allows closing the detail", async () => {
    vi.spyOn(publicacionService, "getById").mockResolvedValue(publicacionDetalleFixture);

    const { result } = renderHook(() => useDetallePublicacion());

    await act(async () => {
      await result.current.handleDetallesClick(publicacionFixture);
    });

    expect(publicacionService.getById).toHaveBeenCalledWith(publicacionFixture.id_publicacion);
    expect(result.current.selectedPublicacion).toEqual(publicacionDetalleFixture);
    expect(result.current.loadingDetalle).toBe(false);

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.selectedPublicacion).toBeNull();
  });
});
