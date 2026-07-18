import { describe, expect, it, vi } from "vitest";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/authStore";
import { routerMock } from "../mocks/nextNavigation";
import { act, renderHook, waitFor } from "../utils/render";

describe("useAuth", () => {
  it("logs out locally and redirects even when the API request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    useAuthStore.setState({
      usuario: { id_usuario: 1, nombre: "Ana" } as any,
      rol: "consumidor" as any,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(useAuthStore.getState().usuario).toBeNull();
      expect(routerMock.push).toHaveBeenCalledWith("/login");
    });
  });
});
