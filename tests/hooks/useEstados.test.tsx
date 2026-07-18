import { describe, expect, it, vi } from "vitest";
import { useEstados } from "../../src/hooks/useEstados";
import { apiClient } from "../../src/lib/apiClient";
import { renderHook, waitFor } from "../utils/render";

describe("useEstados", () => {
  it("does not fetch when type is empty", () => {
    const get = vi.spyOn(apiClient, "get");

    renderHook(() => useEstados(""));

    expect(get).not.toHaveBeenCalled();
  });

  it("loads state options by type", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: [{ id_estado: 1, estado: "disponible" }],
    });

    const { result } = renderHook(() => useEstados("publicacion"));

    await waitFor(() => {
      expect(result.current).toEqual([{ id_estado: 1, estado: "disponible" }]);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/estado?tipo=publicacion");
  });
});
