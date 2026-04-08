"use client";
 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaEditarPerfil, type EditarPerfilFormData} from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";


export function useFormEditarPerfil() {
  const form = useForm<EditarPerfilFormData>({
    resolver: zodResolver(schemaEditarPerfil),
  });
 
  const onSubmit = form.handleSubmit(async (data) => {
    await apiClient.put("/api/usuarios/perfil", data);
  });
 
  return { form, onSubmit };
}