import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../utils/render";
import DetalleReporteModal from "../../../src/components/ui/Modal/DetalleReporteModal/DetalleReporteModal";
import type { ReporteDetalle } from "../../../src/types/reporte";

const baseReporte: ReporteDetalle = {
  id_reporte: 101,
  id_emisor: 1,
  id_receptor: 2,
  motivo: 1,
  observaciones: "",
  fecha: "2026-10-24T12:00:00.000Z",
  estado: 1,
  link_imagen: "",
  emisor: {
    id_usuario: 1,
    nombre: "Juan Perez",
    email_institucional: "juan@uvg.edu.gt",
  },
  receptor: {
    id_usuario: 2,
    nombre: "Maria Lopez",
    email_institucional: "maria@uvg.edu.gt",
  },
  motivoRel: {
    id_motivo: 1,
    motivo: "Información falsa",
  },
  estadoRel: {
    id_estado: 1,
    estado: "resuelto",
  },
  publicacion: null,
  mensaje: null,
  moderador: null,
};

describe("DetalleReporteModal", () => {
  it("clasifica como 'publicacion' y muestra botón 'verPublicacion' cuando la publicación existe", () => {
    const reporteConPublicacion: ReporteDetalle = {
      ...baseReporte,
      publicacion: {
        id_publicacion: 50,
        titulo: "Calculadora Científica",
      },
    };

    render(
      <DetalleReporteModal
        reporte={reporteConPublicacion}
        onClose={vi.fn()}
        onVerPublicacion={vi.fn()}
      />
    );

    // Debe mostrar tipo publicación
    expect(screen.getByText("tipos.publicacion")).toBeInTheDocument();
    expect(screen.getByText("Calculadora Científica")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "verPublicacion" })).toBeInTheDocument();
    // No debe mostrar la alerta de publicación eliminada
    expect(screen.queryByText("publicacionEliminada.titulo")).not.toBeInTheDocument();
  });

  it("clasifica como 'publicacion', muestra el snapshot y no muestra 'verPublicacion' cuando fue eliminada por su autor", () => {
    const snapshotText =
      '[Snapshot - Publicación Eliminada] Título: "Libro de Álgebra" (ID: 45), Propietario: "Ana", Precio Original: $50.00, Resuelto el: 2026-10-24, Por: Sistema';

    const reporteSnapshot: ReporteDetalle = {
      ...baseReporte,
      publicacion: null,
      mensaje: null,
      observaciones: snapshotText,
    };

    render(
      <DetalleReporteModal
        reporte={reporteSnapshot}
        onClose={vi.fn()}
        onVerPublicacion={vi.fn()}
      />
    );

    // El tipo debe ser 'publicacion' y NO 'usuario'
    expect(screen.getByText("tipos.publicacion")).toBeInTheDocument();
    expect(screen.queryByText("tipos.usuario")).not.toBeInTheDocument();

    // Debe mostrar la tarjeta con el título de publicación eliminada y la descripción
    expect(screen.getByText("publicacionEliminada.titulo")).toBeInTheDocument();
    expect(screen.getByText("publicacionEliminada.descripcion")).toBeInTheDocument();

    // Debe mostrar el texto del snapshot histórico dentro del contenedor
    expect(screen.getByText(snapshotText)).toBeInTheDocument();

    // No debe haber botón para consultar una publicación eliminada
    expect(screen.queryByRole("button", { name: "verPublicacion" })).not.toBeInTheDocument();
  });

  it("clasifica como 'usuario' cuando el reporte es a un usuario sin snapshot", () => {
    const reporteUsuario: ReporteDetalle = {
      ...baseReporte,
      publicacion: null,
      mensaje: null,
      observaciones: "El usuario no cumplió con las normas de convivencia.",
    };

    render(
      <DetalleReporteModal
        reporte={reporteUsuario}
        onClose={vi.fn()}
        onVerPublicacion={vi.fn()}
      />
    );

    expect(screen.getByText("tipos.usuario")).toBeInTheDocument();
    expect(screen.getByText("El usuario no cumplió con las normas de convivencia.")).toBeInTheDocument();
    expect(screen.queryByText("publicacionEliminada.titulo")).not.toBeInTheDocument();
  });

  it("clasifica como 'mensaje' cuando el reporte tiene un mensaje vinculado", () => {
    const reporteMensaje: ReporteDetalle = {
      ...baseReporte,
      publicacion: null,
      mensaje: {
        id_mensaje: 88,
        mensaje: "Texto del mensaje reportado",
        estadoRel: { estado: "activo" },
      },
    };

    render(
      <DetalleReporteModal
        reporte={reporteMensaje}
        onClose={vi.fn()}
        onVerPublicacion={vi.fn()}
      />
    );

    expect(screen.getByText("tipos.mensaje")).toBeInTheDocument();
    expect(screen.getByText("Texto del mensaje reportado")).toBeInTheDocument();
    expect(screen.queryByText("publicacionEliminada.titulo")).not.toBeInTheDocument();
  });
});
