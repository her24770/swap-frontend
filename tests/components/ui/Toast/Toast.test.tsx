import { describe, expect, it, vi } from "vitest";
import ToastContainer from "../../../../src/components/ui/Toast/Toast";
import { act, fireEvent, render, screen } from "../../../utils/render";
import { useUIStore } from "../../../../src/store/uiStore";

describe("ToastContainer", () => {
  it("renders notifications from the UI store", () => {
    useUIStore.setState({
      notificaciones: [
        {
          id: "toast-1",
          tipo: "success",
          titulo: "Guardado",
          mensaje: "La publicacion se guardo.",
        },
      ],
    });

    render(<ToastContainer />);

    expect(screen.getByRole("alert")).toHaveTextContent("Guardado");
    expect(screen.getByRole("alert")).toHaveTextContent("La publicacion se guardo.");
  });

  it("uses the default title when no title is provided", () => {
    useUIStore.setState({
      notificaciones: [
        {
          id: "toast-1",
          tipo: "warning",
          mensaje: "Revisa los datos.",
        },
      ],
    });

    render(<ToastContainer />);

    expect(screen.getByText("Advertencia")).toBeInTheDocument();
  });

  it("removes a notification after clicking the close button", async () => {
    vi.useFakeTimers();

    useUIStore.setState({
      notificaciones: [
        {
          id: "toast-1",
          tipo: "info",
          mensaje: "Nueva notificacion.",
        },
      ],
    });

    render(<ToastContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar notificación" }));

    act(() => {
      vi.advanceTimersByTime(280);
    });

    expect(useUIStore.getState().notificaciones).toEqual([]);

    vi.useRealTimers();
  });
});
