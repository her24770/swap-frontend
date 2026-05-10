import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const schemaRegistro = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar 100 caracteres.")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios."),

  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(100, "El apellido no puede superar 100 caracteres.")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios."),

  email_institucional: z
    .string()
    .email("El correo no tiene un formato válido.")
    .endsWith("@uvg.edu.gt", "Debe ser un correo institucional (@uvg.edu.gt).")
    .regex(/^[a-zA-Z]+\d+@uvg\.edu\.gt$/, "Debe seguir el formato de correos (ej. tan25987@uvg.edu.gt)"),

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
export const TIPOS_PUBLICACION = ["material", "tutoria", "negocio"] as const;

export const schemaImagen = z
  .instanceof(File, { message: "Debe ser un archivo válido." })
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE_BYTES,
    { message: "Cada imagen no puede superar los 5 MB." }
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
    { message: "Formato no permitido. Usa JPG, PNG o WebP." }
  );

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
    .refine((v) => !v || parseFloat(v) <= 999.99, "El precio no puede superar Q999.99.")
    .optional()
    .or(z.literal("")),

  tipo_publicacion: z.enum(TIPOS_PUBLICACION, {
    required_error: "Selecciona el tipo de publicación.",
    invalid_type_error: "Tipo de publicación inválido.",
  }),
 
  /**
   * IDs de las etiquetas/categorías seleccionadas.
   * El backend recibe números; el formulario envía strings desde <select>
   */
  categorias: z
    .array(z.coerce.number().int().positive("ID de categoría inválido."))
    .min(1, "Selecciona al menos una categoría.")
    .max(10, "No puedes seleccionar más de 10 categorías."),
 
  imagenes: z
    .array(schemaImagen)
    .max(5, "Puedes subir un máximo de 5 imágenes.")
    .optional()
    .default([]),
 
  destacado: z.boolean().optional().default(false),
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
    .refine((v) => !v || parseFloat(v) <= 999.99, "El precio no puede superar Q999.99.")
    .optional()
    .or(z.literal("")),

  tipo_publicacion: z
    .enum(TIPOS_PUBLICACION, {
        invalid_type_error: "Tipo de publicación inválido.",
      })
      .optional(),

  categorias: z
    .array(z.coerce.number().int().positive("ID de categoría inválido."))
    .min(1, "Selecciona al menos una categoría.")
    .max(10, "No puedes seleccionar más de 10 categorías.")
    .optional(),

  imagenesNuevas: z
    .array(schemaImagen)
    .max(5, "Puedes subir un máximo de 5 imágenes nuevas.")
    .optional()
    .default([]),

  destacado: z
    .boolean()
    .optional(),
  
  // Solo los estados que el usuario puede seleccionar desde el formulario.
    // "eliminado" queda excluido intencionalmente.
    estado: z
      .enum(["disponible", "vendido", "reservado"], {
        invalid_type_error: "El estado debe ser disponible, vendido o reservado.",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: "Debes modificar al menos un campo.",
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
export type TipoPublicacion = (typeof TIPOS_PUBLICACION)[number];
 
/** Tamaño máximo por imagen: 5 MB */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
 
/** Tipos MIME aceptados */
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;