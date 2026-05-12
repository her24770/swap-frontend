const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CrearPublicacionPayload {
  titulo: string;
  descripcion: string;
  precio?: string;
  tipo_publicacion: string;
  imagen?: File;
  estado?: string;
}

export interface CrearPublicacionResult {
  id_publicacion: number;
  imagen_url: string;
}

export const imagenService = {
  async crearPublicacion(payload: CrearPublicacionPayload): Promise<CrearPublicacionResult> {
    const formData = new FormData();
    formData.append("titulo", payload.titulo);
    formData.append("descripcion", payload.descripcion);
    formData.append("precio", payload.precio ? payload.precio : "0");
    formData.append("tipo_publicacion", payload.tipo_publicacion);
    formData.append("estado", payload.estado ?? "disponible");
    if (payload.imagen) formData.append("imagen", payload.imagen);

    const res = await fetch(`${BASE_URL}/api/publicacion/`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status} al crear publicación`);
    }

    const json = await res.json();
    return json.data as CrearPublicacionResult;
  },

  async uploadFotoPerfil(usuarioId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(`${BASE_URL}/api/imagen/perfil/${usuarioId}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status} al subir foto de perfil`);
    }

    const data = await res.json();
    return data.url as string;
  },

  async uploadFotoPublicacion(publicacionId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(`${BASE_URL}/api/publicacion/${publicacionId}/imagen`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status} al subir imagen`);
    }

    const data = await res.json();
    return data.data.url_imagen as string;
  },
};
