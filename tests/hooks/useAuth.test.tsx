import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/store/authStore";
import { routerMock } from "../mocks/nextNavigation";
import { act, renderHook, waitFor } from "../utils/render";

describe("useAuth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("IT-03: limpia Zustand, persistencia y redirige después del logout exitoso", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.getState().login(
      {
        id_usuario: 1,
        nombre: "Ana",
        carnet: 26001001,
        email_institucional: "ana@uvg.edu.gt",
        url_foto_perfil: "",
        descripcion: null,
        calificacion: null,
      },
      "usuario",
    );

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(useAuthStore.getState()).toMatchObject({ usuario: null, rol: null });
    expect(JSON.parse(window.localStorage.getItem("swap-auth") ?? "{}").state).toMatchObject({
      usuario: null,
      rol: null,
    });
    expect(routerMock.push).toHaveBeenCalledWith("/login");
  });

  it("IT-03: limpia el estado local y redirige aunque falle la API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    useAuthStore.setState({
      usuario: { id_usuario: 1, nombre: "Ana" } as any,
      rol: "usuario",
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
