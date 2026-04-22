import { useAuthStore } from "../store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeader(): HeadersInit {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const imagenService = {
  async uploadFotoPerfil(usuarioId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(`${BASE_URL}/api/imagen/perfil/${usuarioId}`, {
      method: "PUT",
      headers: authHeader(),
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Error ${res.status} al subir foto de perfil`);
    }

    const data = await res.json();
    return data.url as string;
  },

  async uploadFotoPublicacion(publicacionId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(`${BASE_URL}/api/imagen/publicacion/${publicacionId}`, {
      method: "PUT",
      headers: authHeader(),
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Error ${res.status} al subir imagen`);
    }

    const data = await res.json();
    return data.url as string;
  },
};
