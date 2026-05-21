import type { ApiResult } from "../types/ApiResult";
import type { AuthResponse } from "../types/usuario";

export function unwrapAuthResponse(
  response: ApiResult<AuthResponse> | AuthResponse
): AuthResponse {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as ApiResult<AuthResponse>).data;
    if (!data) {
      throw new Error("No fue posible obtener la sesión.");
    }
    return data;
  }

  return response as AuthResponse;
}
