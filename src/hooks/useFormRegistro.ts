"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaRegistro, type RegistroFormData } from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";
import { unwrapAuthResponse } from "../lib/authResponse";
import { useAuthStore } from "../store/authStore";

export function useFormRegistro() {
  const login = useAuthStore((s) => s.login);

  const form = useForm<RegistroFormData>({
    resolver: zodResolver(schemaRegistro),
    defaultValues: {
      nombre: "",
      apellido: "",
      email_institucional: "",
      password: "",
      confirmar_password: "",
      url_foto_perfil: "",
      descripcion: "",
      etiquetas: [],
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // confirmar_password no se envía al backend
    const { confirmar_password: _, ...payload } = data;
    const match = data.email_institucional.match(/^[a-zA-Z]+(\d+)@uvg\.edu\.gt$/);

    if (!match) {
      throw new Error("No se pudo extraer el carnet del correo institucional.");
    }

    const carnet = Number(match[1]);
    const respuesta = await apiClient.post<{ usuario: any; rol: any }>(
      "/api/auth/register",
      {
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        carnet,
        email_institucional: data.email_institucional,
        password: data.password,
        url_foto_perfil: data.url_foto_perfil || process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || "",
        descripcion: data.descripcion || "Sin descripción",
        etiquetas: data.etiquetas,
      }
    );
    const sesion = unwrapAuthResponse(respuesta);
    login(sesion.usuario, sesion.rol);
  });

  return { form, onSubmit };
}
