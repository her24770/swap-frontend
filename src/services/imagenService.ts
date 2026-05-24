const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(
    (body as { message?: string; error?: string }).message ??
      (body as { message?: string; error?: string }).error ??
      fallback,
  );
}

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
    formData.append("estado", payload.estado ?? "activo");
    if (payload.imagen) formData.append("imagen", payload.imagen);

    const res = await fetch(`${BASE_URL}/api/publicacion/`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      await throwApiError(res, `Error ${res.status} al crear publicación`);
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
      await throwApiError(res, `Error ${res.status} al subir foto de perfil`);
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
      await throwApiError(res, `Error ${res.status} al subir imagen de publicación`);
    }

    const data = await res.json();
    const url = data?.data?.url_imagen ?? data?.url_imagen;
    if (!url || typeof url !== "string") {
      throw new Error("El servidor no devolvió la URL de la imagen");
    }
    return url;
  },

  async uploadFotosPublicacion(publicacionId: number, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await this.uploadFotoPublicacion(publicacionId, file));
    }
    return urls;
  },
};
