import { z } from "zod";

// Definimos los roles válidos en la plataforma de forma estricta

export const schemaResena = z.object({
    id_receptor: z
        .number({
            required_error: "El ID del estudiante receptor es obligatorio",
            invalid_type_error: "El ID del receptor debe ser un número entero",
        })
        .int()
        .positive(),
    tipo_resena: z.string({
        required_error: "El tipo de reseña es obligatorio",
    }),
    calificacion: z
        .number({
            required_error: "La puntuación de estrellas es obligatoria",
        })
        .int("La calificación debe ser un número entero (estrellas completas)")
        .min(1, "La calificación mínima es 1 estrella")
        .max(5, "La calificación máxima es 5 estrellas"),
    contenido: z
        .string({
            required_error: "El comentario de la reseña es obligatorio",
        })
        .min(10, "La reseña debe detallar tu experiencia (mínimo 10 caracteres)")
        .max(500, "El comentario no puede superar los 500 caracteres"),
});

export const schemaResenaUpdate = z.object({
    calificacion: z
        .number()
        .int()
        .min(1, "La calificación mínima es 1 estrella")
        .max(5, "La calificación máxima es 5 estrellas")
        .optional(),
    contenido: z
        .string()
        .min(10, "La reseña debe detallar tu experiencia (mínimo 10 caracteres)")
        .max(500, "El comentario no puede superar los 500 caracteres")
        .optional(),
});

export type ResenaInput = z.infer<typeof schemaResena>;
export type ResenaUpdateInput = z.infer<typeof schemaResenaUpdate>;