"use client";
 
import { useForm, UseFormReturn  } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  schemaCrearPublicacion,
  schemaEditarPublicacion,
  type CrearPublicacionFormData,
  type EditarPublicacionFormData,
  type TipoPublicacion,
  TIPOS_PUBLICACION,
} from "../schemas/zodSchemas";
import { apiClient, type ApiError} from "../lib/apiClient";

// ─── Tipos de respuesta del backend ──────────────────────────────────────────
 
interface PublicacionBackend {
  id_publicacion: number;
  titulo: string;
  descripcion: string;
  precio: string;
  estado: number;
  tipo_publicacion: number;
  me_gusta: number;
  fecha_publicacion: string;
  id_usuario: number;
}
 
interface CrearPublicacionResponse {
  message: string;
  publicacion: PublicacionBackend;
}
 
// ─── Helpers internos ─────────────────────────────────────────────────────────
 
/**
 * Convierte el string del tipo ("material"  "tutoria"  "negocio")
 * en el id_tipo_perfil que espera el backend consultando primero
 * el mapa local.
 */
const TIPO_ID_MAP: Record<TipoPublicacion, number> = {
  material: 1,
  tutoria: 2,
  negocio: 3,
};
 
/** Genera URLs de objeto para preview y las devuelve junto con sus URLs. */
function crearPreviews(files: File[]): string[] {
  return files.map((f) => URL.createObjectURL(f));
}
 
/** Libera las URLs de objeto creadas para el preview de imágenes. */
function revocarPreviews(urls: string[]): void {
  urls.forEach((url) => URL.revokeObjectURL(url));
}


// Hook: useFormCrearPublicacion

export interface UseFormCrearPublicacionReturn {
  /** Instancia de react-hook-form para conectar inputs */
  form: UseFormReturn<CrearPublicacionFormData>;
 
  /** Envía el formulario al backend */
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

  isSubmitting: boolean;

  serverError: string | null;
 
  isSuccess: boolean;
 
  imagePreviews: string[];
 
  /** Agrega archivos al campo "imagenes" validando y generando previews */
  addImages: (files: FileList | File[]) => void;
 
  removeImage: (index: number) => void;
 
  tiposPublicacion: typeof TIPOS_PUBLICACION;
 
  /** Restablece el formulario a sus valores iniciales */
  resetForm: () => void;
}


export function useFormCrearPublicacion(): UseFormCrearPublicacionReturn  {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<CrearPublicacionFormData>({
    resolver: zodResolver(schemaCrearPublicacion),
    defaultValues: {
      titulo: "",
      descripcion: "",
      precio: "",
      tipo_publicacion: "",
      categorias: [],
      imagenes: [],
      destacado: false,
    },
    mode: "onTouched", // valida al salir de cada campo para feedback tempran

  });

  // Limpia las URLs de objeto cuando el componente se desmonta
  useEffect(() => {
    return () => {
      revocarPreviews(imagePreviews);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 

  // ── Manejo de imágenes ──────────────────────────────────────────────────────

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const filesArray = Array.from(files);
      const current = form.getValues("imagenes") ?? [];
 
      // Limita a 5 imágenes en total
      const available = 5 - current.length;
      if (available <= 0) return;
 
      const toAdd = filesArray.slice(0, available);
      const updated = [...current, ...toAdd];
 
      form.setValue("imagenes", updated, { shouldValidate: true, shouldDirty: true });
 
      // Genera previews solo para las nuevas
      const newPreviews = crearPreviews(toAdd);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [form]
  );
 
  const removeImage = useCallback(
    (index: number) => {
      const current = form.getValues("imagenes") ?? [];
      const updated = current.filter((_, i) => i !== index);
      form.setValue("imagenes", updated, { shouldValidate: true, shouldDirty: true });
 
      setImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    },
    [form]
  );
 

  // ── Envío al backend

  const onSubmit = form.handleSubmit(async (data: CrearPublicacionFormData) => {
    setServerError(null);
    setIsSuccess(false);

    try {
      // Construye el payload que espera el backend
      const payload = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: data.precio ? parseFloat(data.precio) : 0,
        tipo_publicacion: TIPO_ID_MAP[data.tipo_publicacion],
        destacado: data.destacado ?? false,
        etiquetas: data.categorias,
        // Las imágenes se suben como multipart/form-data en una segunda
        // petición cuando el backend soporte ese endpoint.
        // Por ahora se omiten del JSON principal.
      };
 
      const response = await apiClient.post<CrearPublicacionResponse>(
        "/api/publicacion",
        payload
      );
 
      setIsSuccess(true);
 
      // Limpia previews y navega al detalle de la publicación creada
      revocarPreviews(imagePreviews);
      setImagePreviews([]);
      form.reset();
      router.push(`/publicacion/${response.publicacion.id_publicacion}`);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No fue posible crear la publicación. Intenta de nuevo.");
    }
  });
 
  const resetForm = useCallback(() => {
    revocarPreviews(imagePreviews);
    setImagePreviews([]);
    setServerError(null);
    setIsSuccess(false);
    form.reset();
  }, [form, imagePreviews]);
 
  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    isSuccess,
    imagePreviews,
    addImages,
    removeImage,
    tiposPublicacion: TIPOS_PUBLICACION,
    resetForm,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useFormEditarPublicacion

export interface UseFormEditarPublicacionReturn {
  form: UseFormReturn<EditarPublicacionFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
  isSuccess: boolean;
  imagePreviews: string[];
  addImages: (files: FileList | File[]) => void;
  removeImage: (index: number) => void;
}
 
export function useFormEditarPublicacion(id: number,
  /** Valores iniciales cargados desde el servidor */
  defaults?: Partial<EditarPublicacionFormData>
): UseFormEditarPublicacionReturn{
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<EditarPublicacionFormData>({
    resolver: zodResolver(schemaEditarPublicacion),
    defaultValues: {
      titulo: defaults?.titulo ?? "",
      descripcion: defaults?.descripcion ?? "",
      precio: defaults?.precio ?? "",
      tipo_publicacion: defaults?.tipo_publicacion,
      categorias: defaults?.categorias ?? [],
      imagenesNuevas: [],
      destacado: defaults?.destacado ?? false,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    return () => {
      revocarPreviews(imagePreviews);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Imágenes nuevas ─

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const filesArray = Array.from(files);
      const current = form.getValues("imagenesNuevas") ?? [];
      const available = 5 - current.length;
      if (available <= 0) return;
 
      const toAdd = filesArray.slice(0, available);
      form.setValue("imagenesNuevas", [...current, ...toAdd], {
        shouldValidate: true,
        shouldDirty: true,
      });
 
      setImagePreviews((prev) => [...prev, ...crearPreviews(toAdd)]);
    },
    [form]
  );
 
  const removeImage = useCallback(
    (index: number) => {
      const current = form.getValues("imagenesNuevas") ?? [];
      form.setValue(
        "imagenesNuevas",
        current.filter((_, i) => i !== index),
        { shouldValidate: true, shouldDirty: true }
      );
 
      setImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    },
    [form]
  );
 
  // ── Envío al backend ────────────────────────────────────────────────────────
 
  const onSubmit = form.handleSubmit(async (data: EditarPublicacionFormData) => {
    setServerError(null);
    setIsSuccess(false);

    try {
      // Solo incluye los campos que el usuario realmente modificó
      const payload: Record<string, unknown> = {};
 
      if (data.titulo !== undefined) payload.titulo = data.titulo;
      if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
      if (data.precio !== undefined && data.precio !== "")
        payload.precio = parseFloat(data.precio);
      if (data.tipo_publicacion !== undefined)
        payload.tipo_publicacion = TIPO_ID_MAP[data.tipo_publicacion];
      if (data.categorias !== undefined && data.categorias.length > 0)
        payload.etiquetas = data.categorias;
      if (data.destacado !== undefined) payload.destacado = data.destacado;
 
      await apiClient.put(`/api/publicacion/${id}`, payload);
 
      setIsSuccess(true);
      revocarPreviews(imagePreviews);
      setImagePreviews([]);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(
        apiError.message || "No fue posible actualizar la publicación. Intenta de nuevo."
      );
    }
  });
 
  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    isSuccess,
    imagePreviews,
    addImages,
    removeImage,
  };
}