import { apiClient } from "../lib/apiClient";
import { mapApiContactosToContacts } from "../lib/contactosUsuario";
import { mapUsuarioEtiquetasToTags } from "../lib/tags";
import type { ApiResult } from "../types/ApiResult";
import type { PerfilPublicoApi, UserProfileData } from "../types/perfil";

function unwrapApiData<T>(response: ApiResult<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as ApiResult<T>).data;
    if (!data) {
      throw new Error("No fue posible cargar el perfil.");
    }
    return data;
  }

  return response as T;
}

function mapPerfilPublicoToUserProfile(data: PerfilPublicoApi): UserProfileData {
  return {
    id_usuario: data.id_usuario,
    name: data.nombre,
    description: data.descripcion ?? "",
    imageUrl: data.url_foto_perfil,
    rating: Number(data.calificacion ?? 0),
    totalReviews: 0,
    contacts: mapApiContactosToContacts(data.contactos ?? []),
    paymentMethod: data.metodo_pago,
    tags: mapUsuarioEtiquetasToTags(data.etiquetas ?? []),
    calificacion: data.calificacion
  };
}

export async function getPerfilPublico(userId: number): Promise<UserProfileData> {
  const response = await apiClient.get<ApiResult<PerfilPublicoApi> | PerfilPublicoApi>(
    `/api/user/${userId}/perfil-publico`
  );
  return mapPerfilPublicoToUserProfile(unwrapApiData(response));
}
