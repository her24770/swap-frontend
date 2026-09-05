import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../../src/store/authStore";
import { useModeradorAuthStore } from "../../src/store/moderadorAuthStore";

describe("persistencia segura de autenticación", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ usuario: null, rol: null });
    useModeradorAuthStore.setState({ moderador: null });
  });

  it("migra y reescribe un estado de usuario antiguo sin datos sensibles", async () => {
    window.localStorage.setItem("swap-auth", JSON.stringify({
      state: {
        usuario: {
          id_usuario: 7,
          nombre: "Ana",
          carnet: 20260001,
          email_institucional: "ana@uvg.edu.gt",
          password: "no-debe-persistir",
          url_foto_perfil: "https://pub-test.r2.dev/perfil/7.jpg",
          descripcion: "Perfil",
          calificacion: 4.5,
        },
        rol: "usuario",
      },
      version: 0,
    }));

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().usuario).toEqual({
      id_usuario: 7,
      nombre: "Ana",
      url_foto_perfil: "https://pub-test.r2.dev/perfil/7.jpg",
      descripcion: "Perfil",
      calificacion: 4.5,
    });

    const reescrito = window.localStorage.getItem("swap-auth") ?? "";
    expect(reescrito).not.toContain("carnet");
    expect(reescrito).not.toContain("email_institucional");
    expect(reescrito).not.toContain("password");
    expect(JSON.parse(reescrito).version).toBe(1);
  });

  it("migra el store de moderador usando una allowlist", async () => {
    window.localStorage.setItem("swap-moderador-auth", JSON.stringify({
      state: {
        moderador: {
          id_moderador: 3,
          usuario: "moderador3",
          nivel: "moderador",
          password: "no-debe-persistir",
          token: "no-debe-persistir",
        },
      },
      version: 0,
    }));

    await useModeradorAuthStore.persist.rehydrate();

    expect(useModeradorAuthStore.getState().moderador).toEqual({
      id_moderador: 3,
      usuario: "moderador3",
      nivel: "moderador",
    });

    const reescrito = window.localStorage.getItem("swap-moderador-auth") ?? "";
    expect(reescrito).not.toContain("password");
    expect(reescrito).not.toContain("token");
    expect(JSON.parse(reescrito).version).toBe(1);
  });
});
