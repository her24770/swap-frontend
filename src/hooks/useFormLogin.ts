"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaLogin, type LoginFormData } from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";

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
    const respuesta = await apiClient.post<{ usuario: any; rol: any }>(
      "/api/auth/login",
      data
    );
    login(respuesta.usuario, respuesta.rol);
  });

  return { form, onSubmit };
}