import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type { AuthResponseModerador } from "../types/moderador";

export interface LoginModeradorInput {
  usuario: string;
  password: string;
}

export const moderadorService = {

    async iniciarSesion(payload: LoginModeradorInput): Promise<AuthResponseModerador> {
        const response = await apiClient.post<ApiResult<AuthResponseModerador>>("/api/moderador/login", payload);
        return response.data;
    },

    async obtenerSesionActual(): Promise<AuthResponseModerador> {
        const response = await apiClient.get<ApiResult<AuthResponseModerador>>("/api/moderador/me");
        return response.data;
    },

    async cerrarSesion(): Promise<void> {
        await apiClient.post("/api/auth/logout");
    },

};
