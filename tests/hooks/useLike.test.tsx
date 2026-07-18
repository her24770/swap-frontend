import { describe, expect, it, vi } from "vitest";
import { useLike } from "../../src/hooks/useLike";
import { publicacionService } from "../../src/services/publicacionService";
import { useUIStore } from "../../src/store/uiStore";
import { act, renderHook, waitFor } from "../utils/render";

describe("useLike", () => {
  it("optimistically likes a publication and calls the service", async () => {
    const darLike = vi.spyOn(publicacionService, "darLike").mockResolvedValue(undefined);

    const { result } = renderHook(() => useLike(1, false, 3));

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(darLike).toHaveBeenCalledWith(1);
    expect(result.current.likeado).toBe(true);
    expect(result.current.count).toBe(4);
  });

  it("reverts the optimistic update and notifies when the service fails", async () => {
    vi.spyOn(publicacionService, "darLike").mockRejectedValue({
      status: 500,
      message: "No se pudo actualizar",
    });

    const { result } = renderHook(() => useLike(1, false, 3));

    await act(async () => {
      await result.current.toggleLike();
    });

    await waitFor(() => {
      expect(result.current.likeado).toBe(false);
      expect(result.current.count).toBe(3);
      expect(useUIStore.getState().notificaciones).toMatchObject([
        { tipo: "error", mensaje: "No se pudo actualizar" },
      ]);
    });
  });
});
