import { apiClient } from "../lib/apiClient"; // Ajusta la ruta relativa
import { Anuncio } from "../types/anuncio";
import { ApiResult } from "../types/ApiResult";

export const anuncioService = {
    // Obtener todos los anuncios
    async getAnuncios(): Promise<Anuncio[]> {
        // Retorna ApiResult<Anuncio[]> -> { success: true, data: Anuncio[] }
        const response = await apiClient.get<ApiResult<Anuncio[]>>("/api/anuncio");
        return response.data; 
    },

    // Crear un anuncio enviando el FormData (Texto + Archivo binario)
    async crearAnuncio(formData: FormData): Promise<Anuncio> {
        const response = await apiClient.post<ApiResult<Anuncio>>("/api/anuncio", formData);
        return response.data;
    },

    // Editar un anuncio enviando el FormData (Campos opcionales + Archivo opcional)
    async editarAnuncio(idAnuncio: number, formData: FormData): Promise<Anuncio> {
        const response = await apiClient.put<ApiResult<Anuncio>>(`/api/anuncio/${idAnuncio}`, formData);
        return response.data;
    },

    // Eliminar un anuncio por su ID
    async eliminarAnuncio(idAnuncio: number): Promise<Anuncio> {
        const response = await apiClient.delete<ApiResult<Anuncio>>(`/api/anuncio/${idAnuncio}`);
        return response.data;
    },

    async getAnunciosdeUsuario(idUsuario: number): Promise<Anuncio[]> {
        const response = await apiClient.get<ApiResult<Anuncio[]>>(`/api/anuncio/usuario/${idUsuario}`);
        return response.data; 
    },
};