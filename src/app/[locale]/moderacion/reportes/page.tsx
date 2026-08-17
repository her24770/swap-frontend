"use client";

import TablaReportes from "../../../../components/moderacion/TablaReportes/TablaReportes";
import type { ReporteDetalle, ReporteTableData } from "../../../../types/reporte";
import type { PublicacionDetalle } from "../../../../types/publicacion";
import "./ReportesPage.css";

const MOCK_REPORTES = [
  {
    id_reporte: 1042,
    tipo: "Publicación",
    fecha: "2026-08-10T14:30:00.000Z",
    estado: "pendiente",
    emisor: {
      nombre: "Sofía Morales",
      email_institucional: "sofia@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Diego Herrera",
      email_institucional: "diego.herrera@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
  {
    id_reporte: 1041,
    tipo: "Mensaje",
    fecha: "2026-08-09T09:15:00.000Z",
    estado: "completado",
    emisor: {
      nombre: "Andrea Lopez",
      email_institucional: "andrea.lopez@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Carlos Reyes",
      email_institucional: "carlos.reyes@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
  {
    id_reporte: 1040,
    tipo: "Publicación",
    fecha: "2026-08-07T18:45:00.000Z",
    estado: "cancelado",
    emisor: {
      nombre: "Marcos Núñez",
      email_institucional: "marcos.nunez@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Valeria Cruz",
      email_institucional: "valeria.cruz@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
] satisfies ReporteTableData[];

const MOCK_DETALLES: Record<number, ReporteDetalle> = {
  1042: {
    id_reporte: 1042,
    id_emisor: 12,
    id_receptor: 34,
    id_publicacion: 501,
    id_mensaje: null,
    motivo: 5,
    observaciones: "Hace publicaciones raras.",
    fecha: "2026-08-10T14:30:00.000Z",
    estado: 3,
    link_imagen: "",
    id_moderador: null,
    emisor: { id_usuario: 12, nombre: "Sofía Morales", email_institucional: "sofia@uvg.edu.gt" },
    receptor: { id_usuario: 34, nombre: "Diego Herrera", email_institucional: "diego.herrera@uvg.edu.gt" },
    motivoRel: { id_motivo: 5, motivo: "Publica contenido inapropiado" },
    estadoRel: { id_estado: 3, estado: "pendiente" },
    publicacion: {
      id_publicacion: 501,
      titulo: "Vendo calculadora científica",
      estadoRel: { estado: "activo" },
    },
    mensaje: null,
    moderador: null,
  },
  1041: {
    id_reporte: 1041,
    id_emisor: 22,
    id_receptor: 45,
    id_publicacion: null,
    id_mensaje: 890,
    motivo: 9,
    observaciones: "Sin detalles",
    fecha: "2026-08-09T09:15:00.000Z",
    estado: 4,
    link_imagen: "",
    id_moderador: 3,
    emisor: { id_usuario: 22, nombre: "Andrea Lopez", email_institucional: "andrea.lopez@uvg.edu.gt" },
    receptor: { id_usuario: 45, nombre: "Carlos Reyes", email_institucional: "carlos.reyes@uvg.edu.gt" },
    motivoRel: { id_motivo: 9, motivo: "Es spam, publicidad no deseada o enlace sospechoso" },
    estadoRel: { id_estado: 4, estado: "completado" },
    publicacion: null,
    mensaje: {
      id_mensaje: 890,
      mensaje: "Escríbeme al whatsapp para venderte más barato fuera de la app",
      estadoRel: { estado: "inactivo" },
    },
    moderador: { id_moderador: 3, usuario: "mod4" },
  },
  1040: {
    id_reporte: 1040,
    id_emisor: 18,
    id_receptor: 9,
    id_publicacion: 488,
    id_mensaje: null,
    motivo: 13,
    observaciones: "Sin detalle.",
    fecha: "2026-08-07T18:45:00.000Z",
    estado: 5,
    link_imagen: "",
    id_moderador: 3,
    emisor: { id_usuario: 18, nombre: "Marcos Núñez", email_institucional: "marcos.nunez@uvg.edu.gt" },
    receptor: { id_usuario: 9, nombre: "Valeria Cruz", email_institucional: "valeria.cruz@uvg.edu.gt" },
    motivoRel: { id_motivo: 13, motivo: "Discurso de odio o símbolos ofensivos" },
    estadoRel: { id_estado: 5, estado: "cancelado" },
    publicacion: {
      id_publicacion: 488,
      titulo: "Clases particulares de inglés",
      estadoRel: { estado: "activo" },
    },
    mensaje: null,
    moderador: { id_moderador: 3, usuario: "mod3" },
  },
};

const MOCK_PUBLICACIONES: Record<number, PublicacionDetalle> = {
  501: {
    id_publicacion: 501,
    titulo: "Vendo calculadora científica",
    descripcion: "Calculadora científica Casio fx-991ES, poco uso, ideal para cursos de cálculo y física. Incluye estuche y manual.",
    precio: "350",
    me_gusta: 12,
    fecha_publicacion: "2026-08-01T10:00:00.000Z",
    usuario: {
      id_usuario: 34,
      nombre: "Diego Herrera",
      url_foto_perfil: "",
      calificacion: 4,
      email_institucional: "diego.herrera@uvg.edu.gt",
    },
    estadoRel: { id_estado: 1, estado: "activo" },
    tipoPerfil: { id_tipo_perfil: 1, tipo_perfil: "material" },
    imagenes: [],
    etiquetas: [
      { id_publicacion: 501, id_etiqueta: 1, etiqueta: { id_etiqueta: 1, nombre: "Material", id_etiqueta_padre: null } },
    ],
  },

  488: {
    id_publicacion: 488,
    titulo: "Clases particulares de inglés",
    descripcion: "Clases personalizadas de inglés conversacional y gramática, todos los niveles. Horarios flexibles por las tardes.",
    precio: "120",
    me_gusta: 30,
    fecha_publicacion: "2026-07-20T15:00:00.000Z",
    usuario: {
      id_usuario: 9,
      nombre: "Valeria Cruz",
      url_foto_perfil: "",
      calificacion: 5,
      email_institucional: "valeria.cruz@uvg.edu.gt",
    },
    estadoRel: { id_estado: 1, estado: "activo" },
    tipoPerfil: { id_tipo_perfil: 2, tipo_perfil: "tutoria" },
    imagenes: [],
    etiquetas: [
      { id_publicacion: 488, id_etiqueta: 2, etiqueta: { id_etiqueta: 2, nombre: "Tutoría", id_etiqueta_padre: null } },
    ],
  },
};

export default function ModeracionReportesPage() {
  const obtenerDetalleMock = (id: number): ReporteDetalle => {
    const detalle = MOCK_DETALLES[id];
    if (!detalle) throw new Error("Reporte no encontrado.");
    return detalle;
  };

  const obtenerPublicacionMock = (id: number): PublicacionDetalle => {
    const publicacion = MOCK_PUBLICACIONES[id];
    if (!publicacion) throw new Error("Publicación no encontrada.");
    return publicacion;
  };

  return (
    <div className="moderacion-reportes-page">
      <TablaReportes
        reportes={MOCK_REPORTES}
        total={MOCK_REPORTES.length}
        pageSize={10}
        onVerDetalles={obtenerDetalleMock}
        onVerPublicacion={obtenerPublicacionMock}
      />
    </div>
  );
}
