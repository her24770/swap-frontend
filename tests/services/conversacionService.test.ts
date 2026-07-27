import { afterEach, describe, expect, it, vi } from "vitest";
import { conversacionService } from "../../src/services/conversacionService";
import { apiClient } from "../../src/lib/apiClient";
import { useAuthStore } from "../../src/store/authStore";

const USUARIO_ACTUAL = {
  id_usuario: 1,
  nombre: "Yo",
  carnet: 123,
  email_institucional: "yo@test.com",
  url_foto_perfil: "",
  descripcion: null,
  calificacion: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  useAuthStore.getState().logout();
});

describe("conversacionService.listar", () => {
  it("devuelve una lista vacia si no hay usuario autenticado", async () => {
    const get = vi.spyOn(apiClient, "get");

    const resultado = await conversacionService.listar();

    expect(resultado).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it("mapea la conversacion mostrando al otro usuario, no al usuario actual", async () => {
    useAuthStore.getState().login(USUARIO_ACTUAL, "usuario");

    vi.spyOn(apiClient, "get").mockResolvedValue({
      success: true,
      data: [
        {
          id_conversacion: 10,
          id_usuario_1: 1,
          id_usuario_2: 2,
          estado_conversacion: 3,
          usuario1: { id_usuario: 1, nombre: "Yo", url_foto_perfil: "" },
          usuario2: { id_usuario: 2, nombre: "Andrea", url_foto_perfil: "andrea.png" },
          mensajes: [{ mensaje: "hola", fecha_enviado: "2026-07-27T10:00:00.000Z" }],
        },
      ],
    });

    const [conversacion] = await conversacionService.listar();

    expect(conversacion.nombre).toBe("Andrea");
    expect(conversacion.avatarUrl).toBe("andrea.png");
    expect(conversacion.preview).toBe("hola");
  });

  it("marca esSolicitud solo cuando el usuario actual es el destinatario y esta pendiente", async () => {
    useAuthStore.getState().login(USUARIO_ACTUAL, "usuario");

    vi.spyOn(apiClient, "get").mockResolvedValue({
      success: true,
      data: [
        {
          id_conversacion: 10,
          id_usuario_1: 2,
          id_usuario_2: 1,
          estado_conversacion: 3,
          usuario1: { id_usuario: 2, nombre: "Andrea", url_foto_perfil: "" },
          usuario2: { id_usuario: 1, nombre: "Yo", url_foto_perfil: "" },
          mensajes: [],
        },
      ],
    });

    const [comoDestinatario] = await conversacionService.listar(3);
    expect(comoDestinatario.esSolicitud).toBe(true);

    vi.spyOn(apiClient, "get").mockResolvedValue({
      success: true,
      data: [
        {
          id_conversacion: 11,
          id_usuario_1: 1,
          id_usuario_2: 2,
          estado_conversacion: 3,
          usuario1: { id_usuario: 1, nombre: "Yo", url_foto_perfil: "" },
          usuario2: { id_usuario: 2, nombre: "Andrea", url_foto_perfil: "" },
          mensajes: [],
        },
      ],
    });

    const [comoRemitente] = await conversacionService.listar(3);
    expect(comoRemitente.esSolicitud).toBe(false);
  });
});

describe("conversacionService.obtenerMensajes", () => {
  it("pide el historial de mensajes de la conversacion indicada", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      success: true,
      data: [{ id_mensaje: 1, id_conversacion: 10, id_emisor: 1, mensaje: "hola", estado_mensaje: 1, fecha_enviado: "2026-07-27T10:00:00.000Z" }],
    });

    const mensajes = await conversacionService.obtenerMensajes(10);

    expect(get).toHaveBeenCalledWith("/api/conversacion/10/mensajes");
    expect(mensajes).toHaveLength(1);
  });
});

describe("conversacionService.iniciarConversacion", () => {
  it("envia id_usuario_2 y mensaje, y mapea la conversacion resultante", async () => {
    useAuthStore.getState().login(USUARIO_ACTUAL, "usuario");

    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      success: true,
      data: {
        conversacion: {
          id_conversacion: 20,
          id_usuario_1: 1,
          id_usuario_2: 3,
          estado_conversacion: 3,
          usuario1: { id_usuario: 1, nombre: "Yo", url_foto_perfil: "" },
          usuario2: { id_usuario: 3, nombre: "Carlos", url_foto_perfil: "" },
          mensajes: [],
        },
        mensaje: { id_mensaje: 5, id_conversacion: 20, id_emisor: 1, mensaje: "hola", estado_mensaje: 1, fecha_enviado: "2026-07-27T10:00:00.000Z" },
      },
    });

    const resultado = await conversacionService.iniciarConversacion(3, "hola");

    expect(post).toHaveBeenCalledWith("/api/conversacion", { id_usuario_2: 3, mensaje: "hola" });
    expect(resultado.conversacion.nombre).toBe("Carlos");
    expect(resultado.mensaje.id_mensaje).toBe(5);
  });
});
