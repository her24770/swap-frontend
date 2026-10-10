const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CrearPublicacionPayload {
  titulo: string;
  descripcion: string;
  precio?: string;
  tipo_publicacion: string;
  imagenes?: File[];
  estado?: string;
}

export interface CrearPublicacionResult {
  id_publicacion: number;
  imagenes: string[];
  // Estado devuelto por backend (ej: "pendiente" si aplica fail-closed)
  estado_nombre?: string;
  // Mensaje informativo del servidor
  message?: string;
}

export interface ActualizarPublicacionResult {
  urlsNuevas: string[];
  estado_nombre?: string;
  message?: string;
}

export interface ActualizarPublicacionPayload {
  titulo?: string;
  descripcion?: string;
  precio?: string;
  tipo_publicacion?: string;
  estado?: string | number;
  etiquetas?: number[];
  imagenes?: File[];
  imagenesEliminar?: string[];
}

export const imagenService = {
  async crearPublicacion(payload: CrearPublicacionPayload): Promise<CrearPublicacionResult> {
    const formData = new FormData();
    formData.append("titulo", payload.titulo);
    formData.append("descripcion", payload.descripcion);
    formData.append("precio", payload.precio ?? "0");
    formData.append("tipo_publicacion", payload.tipo_publicacion);
    formData.append("estado", payload.estado ?? "activo");

    for (const file of payload.imagenes ?? []) {
      formData.append("imagenes", file);
    }

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
    // Preservar datos, estado y mensaje retornado por el backend
    return {
      ...(json.data as CrearPublicacionResult),
      estado_nombre: json.data?.estado_nombre,
      message: json.message,
    };
  },

  async actualizarPublicacion(id: number, payload: ActualizarPublicacionPayload): Promise<ActualizarPublicacionResult> {
    const formData = new FormData();

    if (payload.titulo !== undefined)           formData.append("titulo", payload.titulo);
    if (payload.descripcion !== undefined)      formData.append("descripcion", payload.descripcion);
    if (payload.precio !== undefined)           formData.append("precio", payload.precio);
    if (payload.tipo_publicacion !== undefined) formData.append("tipo_publicacion", payload.tipo_publicacion);
    if (payload.estado !== undefined)           formData.append("estado", String(payload.estado));
    if (payload.etiquetas !== undefined)        formData.append("etiquetas", JSON.stringify(payload.etiquetas));
    if (payload.imagenesEliminar?.length)       formData.append("imagenesEliminar", JSON.stringify(payload.imagenesEliminar));

    for (const file of payload.imagenes ?? []) {
      formData.append("imagenes", file);
    }

    const res = await fetch(`${BASE_URL}/api/publicacion/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status} al actualizar publicación`);
    }

    const json = await res.json();
    return {
      urlsNuevas: json.data?.urlsNuevas ?? [],
      estado_nombre: json.data?.estado_nombre,
      message: json.message,
    };
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
    return data.data as string;
  },
};