"use client";
 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaEditarPerfil, type EditarPerfilFormData} from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";


export function useFormEditarPerfil() {
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);
  const form = useForm<EditarPerfilFormData>({
    resolver: zodResolver(schemaEditarPerfil),
  });
 
  const onSubmit = form.handleSubmit(async (data) => {
    if (!idUsuario) {
      throw new Error("No se encontró el usuario autenticado.");
    }

    await apiClient.patch(`/api/user/${idUsuario}`, data);
  });
 
  return { form, onSubmit };
}
