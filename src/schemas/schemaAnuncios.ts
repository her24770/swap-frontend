import {z} from 'zod'


export const schemaAnuncio = z.object({
    titulo: z
        .string()
        .min(1, "El título es obligatorio")
        .max(100, "El título no puede superar los 100 caracteres"),
    descripcion: z
        .string()
        .min(1, "La descripción es obligatoria")
        .max(500, "La descripción no puede superar los 500 caracteres"),
})


export const schemaAnuncioUpdate = z.object({
    titulo: z
        .string()
        .min(1, "El título es obligatorio")
        .max(100, "El título no puede superar los 100 caracteres")
        .optional(),
    descripcion: z
        .string()
        .min(1, "La descripción es obligatoria")
        .max(500, "La descripción no puede superar los 500 caracteres")
        .optional(),
})  


export type AnuncioInput = z.infer<typeof schemaAnuncio>;
export type AnuncioUpdateInput = z.infer<typeof schemaAnuncioUpdate>;