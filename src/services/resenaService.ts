import { apiClient } from "../lib/apiClient"; 
import { ApiResult } from "../types/ApiResult";
import { ResenaInput, ResenaUpdateInput } from "../schemas/schemaResenas"; 
import type { Resena } from "../types/resena";



export const resenaService = {

    async crearResena(payload: ResenaInput): Promise<Resena> {
        const response = await apiClient.post<ApiResult<Resena>>("/api/resenas", payload);
        return response.data;
    },

    async editarResena(idResena: number, payload: ResenaUpdateInput): Promise<Resena> {
        const response = await apiClient.put<ApiResult<Resena>>(`/api/resenas/${idResena}`, payload);
        return response.data;
    },

    async obtenerResenasUsuario(idUsuario: number, tipoResena: string): Promise<Resena[]> {
        const response = await apiClient.get<ApiResult<Resena[]>>(`/api/resenas/usuario/${idUsuario}?tipo=${tipoResena}`);
        return response.data;
    }


};