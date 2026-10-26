"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaLogin, type LoginFormData } from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";
import { unwrapAuthResponse } from "../lib/authResponse";
import { useAuthStore } from "../store/authStore";
import type { ApiResult } from "../types/ApiResult";
import type { AuthResponse } from "../types/usuario";

export function useFormLogin() {
  const login = useAuthStore((s) => s.login);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(schemaLogin),
    defaultValues: {
      email_institucional: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const respuesta = await apiClient.post<ApiResult<AuthResponse> | AuthResponse>(
      "/api/auth/login",
      data
    );
    const sesion = unwrapAuthResponse(respuesta);
    login(sesion.usuario, sesion.rol);
  });

  return { form, onSubmit };
}
