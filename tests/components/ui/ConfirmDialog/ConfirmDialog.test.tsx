import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "../../../../src/components/ui/ConfirmDialog/ConfirmDialog";
import { render, screen, userEvent } from "../../../utils/render";
import { useUIStore } from "../../../../src/store/uiStore";

describe("ConfirmDialog", () => {
  it("does not render when the dialog is closed", () => {
    render(<ConfirmDialog />);

    expect(screen.queryByText("Confirmar accion")).not.toBeInTheDocument();
  });

  it("renders dialog content from the UI store", () => {
    useUIStore.getState().mostrarConfirm({
      titulo: "Confirmar accion",
      mensaje: "Esta accion no se puede deshacer.",
      onConfirm: vi.fn(),
    });

    render(<ConfirmDialog />);

    expect(screen.getByText("Confirmar accion")).toBeInTheDocument();
    expect(screen.getByText("Esta accion no se puede deshacer.")).toBeInTheDocument();
  });

  it("runs the confirm handler and closes the dialog", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    useUIStore.getState().mostrarConfirm({
      titulo: "Eliminar publicacion",
      mensaje: "Se eliminara permanentemente.",
      onConfirm,
    });

    render(<ConfirmDialog />);

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(useUIStore.getState().confirm.isOpen).toBe(false);
  });

  it("closes the dialog when cancel is clicked", async () => {
    const user = userEvent.setup();

    useUIStore.getState().mostrarConfirm({
      titulo: "Cancelar accion",
      mensaje: "Puedes volver despues.",
      onConfirm: vi.fn(),
    });

    render(<ConfirmDialog />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(useUIStore.getState().confirm.isOpen).toBe(false);
  });
});
