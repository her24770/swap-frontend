"use client";
 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schemaCrearPublicacion,
  schemaEditarPublicacion,
  type CrearPublicacionFormData,
  type EditarPublicacionFormData
} from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";

export function useFormCrearPublicacion() {
  const form = useForm<CrearPublicacionFormData>({
    resolver: zodResolver(schemaCrearPublicacion),
    defaultValues: {
      titulo: "",
      descripcion: "",
      precio: "",
      tipo_publicacion: "",
    },
  });
 
  const onSubmit = form.handleSubmit(async (data) => {
    await apiClient.post("/api/publicaciones", {
      ...data,
      precio: data.precio ? parseFloat(data.precio) : 0,
      tipo_publicacion: Number(data.tipo_publicacion),
    });
  });
 
  return { form, onSubmit };
}
 
export function useFormEditarPublicacion(id: number) {
  const form = useForm<EditarPublicacionFormData>({
    resolver: zodResolver(schemaEditarPublicacion),
  });
 
  const onSubmit = form.handleSubmit(async (data) => {
    const payload = {
      ...data,
      ...(data.precio && { precio: parseFloat(data.precio) }),
    };
    await apiClient.put(`/api/publicaciones/${id}`, payload);
  });
 
  return { form, onSubmit };
}