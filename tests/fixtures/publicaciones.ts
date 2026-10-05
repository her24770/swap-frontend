import type { Publicacion, PublicacionDetalle } from "../../src/types/publicacion";

export const publicacionFixture: Publicacion = {
  id_publicacion: 1,
  titulo: "Libro de calculo",
  descripcion: "Libro usado en buen estado",
  precio: "75.00",
  estado: 1,
  tipo_publicacion: 1,
  me_gusta: 3,
  fecha_publicacion: "2026-01-01T00:00:00.000Z",
  id_usuario: 10,
  imagenes: [],
  etiquetas: [],
};

export const publicacionDetalleFixture: PublicacionDetalle = {
  ...publicacionFixture,
  usuario: {
    id_usuario: 10,
    nombre: "Ana",
    url_foto_perfil: "",
    calificacion: 4.5,
    email_institucional: "ana12345@uvg.edu.gt",
  },
  estadoRel: {
    id_estado: 1,
    estado: "disponible",
  },
  tipoPerfil: {
    id_tipo_perfil: 1,
    tipo_perfil: "vendedor",
  },
};
