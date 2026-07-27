import { beforeAll, describe, expect, it, vi } from "vitest";
import ChatPrincipal from "../../../../src/components/Chat/ChatPrincipal/ChatPrincipal";
import { fireEvent, render, screen, waitFor } from "../../../utils/render";

vi.mock(
  "../../../../src/components/Chat/ChatPrincipal/HistorialAcuerdosPanel/HistorialAcuerdosPanel",
  () => ({ default: () => null })
);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

describe("ChatPrincipal tutoring requests", () => {
  it("submits a tutoring request from a tutoring conversation", async () => {
    const onEnviarSolicitudTutoria = vi.fn().mockResolvedValue(true);

    render(
      <ChatPrincipal
        conversacion={{
          id_conversacion: 9,
          nombre: "Ana",
          preview: "",
          publicacion: {
            id: 27,
            titulo: "Cálculo diferencial",
            precio: 75,
            tipo: "tutoria",
          },
        }}
        mensajes={[]}
        onEnviar={vi.fn()}
        onEnviarSolicitudTutoria={onEnviarSolicitudTutoria}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "header.options" }));
    fireEvent.click(screen.getByRole("button", { name: "menu.tutoringRequest" }));

    fireEvent.change(screen.getByLabelText("fecha"), { target: { value: "2099-08-01" } });
    fireEvent.change(screen.getByLabelText("hora"), { target: { value: "15:30" } });
    fireEvent.change(screen.getByLabelText("lugar"), { target: { value: "Biblioteca" } });
    fireEvent.change(screen.getByLabelText("tema"), {
      target: { value: "Regla de la cadena y optimización" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviarSolicitud/ }));

    await waitFor(() => {
      expect(onEnviarSolicitudTutoria).toHaveBeenCalledWith({
        fecha: "2099-08-01",
        hora: "15:30",
        lugar: "Biblioteca",
        tema: "Regla de la cadena y optimización",
      });
    });
  });
});
