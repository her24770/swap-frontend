import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const schemaRegistro = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar 100 caracteres.")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios."),

  carnet: z
    .string()
    .regex(/^\d{5}$/, "El carnet debe tener 5 dígitos."),

  email_institucional: z
    .string()
    .email("El correo no tiene un formato válido.")
    .endsWith("@uvg.edu.gt", "Debe ser un correo institucional (@uvg.edu.gt)."),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula.")
    .regex(/[0-9]/, "Debe contener al menos un número."),

  confirmar_password: z.string(),

  url_foto_perfil: z
    .string()
    .url("La URL de la foto no es válida.")
    .optional()
    .or(z.literal("")),

  descripcion: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres.")
    .optional(),
}).refine(
  (data) => data.password === data.confirmar_password,
  {
    message: "Las contraseñas no coinciden.",
    path: ["confirmar_password"],
  }
);

export const schemaLogin = z.object({
  email_institucional: z
    .string()
    .email("El correo no tiene un formato válido.")
    .endsWith("@uvg.edu.gt", "Debe ser un correo institucional (@uvg.edu.gt)."),

  password: z
    .string()
    .min(1, "La contraseña no puede estar vacía."),
});

// ─── Publicación ──────────────────────────────────────────────────────────────

export const schemaCrearPublicacion = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(100, "El título no puede superar 100 caracteres."),

  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(255, "La descripción no puede superar 255 caracteres."),

  precio: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "El precio debe ser un número válido.")
    .optional()
    .or(z.literal("")),

  tipo_publicacion: z
    .string()
    .min(1, "Selecciona un tipo de publicación."),
});

export const schemaEditarPublicacion = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(100, "El título no puede superar 100 caracteres.")
    .optional(),

  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(255, "La descripción no puede superar 255 caracteres.")
    .optional(),

  precio: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "El precio debe ser un número válido.")
    .optional()
    .or(z.literal("")),
});

// ─── Perfil ───────────────────────────────────────────────────────────────────

export const schemaEditarPerfil = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar 100 caracteres.")
    .optional(),

  url_foto_perfil: z
    .string()
    .url("La URL de la foto no es válida.")
    .optional()
    .or(z.literal("")),

  descripcion: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres.")
    .optional(),
});

// ─── Horario / Disponibilidad ─────────────────────────────────────────────────

export const schemaHorario = z.object({
  inicio_intervalo: z
    .string()
    .min(1, "La fecha de inicio es obligatoria."),

  fin_intervalo: z
    .string()
    .min(1, "La fecha de fin es obligatoria."),
}).refine(
  (data) => {
    if (!data.inicio_intervalo || !data.fin_intervalo) return true;
    return new Date(data.fin_intervalo) > new Date(data.inicio_intervalo);
  },
  {
    message: "La fecha de fin debe ser posterior a la de inicio.",
    path: ["fin_intervalo"],
  }
);

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type RegistroFormData = z.infer<typeof schemaRegistro>;
export type LoginFormData = z.infer<typeof schemaLogin>;
export type CrearPublicacionFormData = z.infer<typeof schemaCrearPublicacion>;
export type EditarPublicacionFormData = z.infer<typeof schemaEditarPublicacion>;
export type EditarPerfilFormData = z.infer<typeof schemaEditarPerfil>;
export type HorarioFormData = z.infer<typeof schemaHorario>;