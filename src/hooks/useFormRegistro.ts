"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaRegistro, type RegistroFormData } from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";

export function useFormRegistro() {
  const login = useAuthStore((s) => s.login);

  const form = useForm<RegistroFormData>({
    resolver: zodResolver(schemaRegistro),
    defaultValues: {
      nombre: "",
      carnet: "",
      email_institucional: "",
      password: "",
      confirmar_password: "",
      url_foto_perfil: "",
      descripcion: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // confirmar_password no se envía al backend
    const { confirmar_password: _, ...payload } = data;
    const respuesta = await apiClient.post<{ token: string; usuario: any; rol: any }>(
      "/api/auth/registro",
      { ...payload, carnet: Number(payload.carnet) }
    );
    login(respuesta.usuario, respuesta.token, respuesta.rol);
  });

  return { form, onSubmit };
}