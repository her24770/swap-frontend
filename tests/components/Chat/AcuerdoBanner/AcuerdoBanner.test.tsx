import { describe, expect, it, vi } from "vitest";
import AcuerdoBanner from "../../../../src/components/Chat/ChatPrincipal/AcuerdoBanner/AcuerdoBanner";
import { render, screen } from "../../../utils/render";

describe("AcuerdoBanner", () => {
  it("IT-23: muestra el recordatorio completo cuando hay un acuerdo activo", () => {
    const onDetalles = vi.fn();

    render(
      <AcuerdoBanner
        acuerdo={{
          id_acuerdo: 8,
          id_usuario: 1,
          id_ofertante: 1,
          id_publicacion: 50,
          id_conversacion: 10,
          estado: 1,
          estadoRel: { id_estado: 1, estado: "activo" },
          fecha_entrega: "2026-09-15 10:00",
          lugar_entrega: "Biblioteca",
          observaciones: "Entregar material",
          publicacion: {
            id_publicacion: 50,
            titulo: "Libro de cálculo",
            descripcion: "",
            precio: "100",
            estado: 1,
            tipo_publicacion: 1,
            me_gusta: 0,
            fecha_publicacion: "2026-09-01T00:00:00.000Z",
            id_usuario: 2,
            imagenes: [],
          },
        }}
        onDetalles={onDetalles}
      />,
    );

    expect(screen.getByText("nextAgreement")).toBeInTheDocument();
    expect(screen.getByText("Libro de cálculo")).toBeInTheDocument();
    expect(screen.getByText(/Biblioteca/)).toBeInTheDocument();
    expect(screen.getByText(/2026-09-15 10:00/)).toBeInTheDocument();
  });
});
