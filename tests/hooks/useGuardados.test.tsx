import { describe, expect, it } from "vitest";
import { useGuardados } from "../../src/hooks/useGuardados";
import { renderHook } from "../utils/render";

describe("useGuardados", () => {
  it("throws when used outside GuardadosProvider", () => {
    expect(() => renderHook(() => useGuardados())).toThrow(
      "useGuardados debe usarse dentro de GuardadosProvider"
    );
  });
});
