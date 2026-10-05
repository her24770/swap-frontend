import { describe, expect, it } from "vitest";
import { useToast } from "../../src/hooks/useToast";
import { useUIStore } from "../../src/store/uiStore";
import { act, renderHook } from "../utils/render";

describe("useToast", () => {
  it("adds typed notifications to the UI store", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success("Operacion completada", "Listo");
      result.current.error("No se pudo guardar");
      result.current.info("Nueva informacion");
      result.current.warning("Revisa los datos");
    });

    expect(useUIStore.getState().notificaciones).toMatchObject([
      { tipo: "success", mensaje: "Operacion completada", titulo: "Listo" },
      { tipo: "error", mensaje: "No se pudo guardar" },
      { tipo: "info", mensaje: "Nueva informacion" },
      { tipo: "warning", mensaje: "Revisa los datos" },
    ]);
  });
});
