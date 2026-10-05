import { describe, expect, it, vi } from "vitest";
import { GuardadosProvider } from "../../src/context/GuardadosContext";
import { useGuardados } from "../../src/hooks/useGuardados";
import { publicacionService } from "../../src/services/publicacionService";
import { useAuthStore } from "../../src/store/authStore";
import { publicacionFixture } from "../fixtures/publicaciones";
import { render, screen, userEvent, waitFor } from "../utils/render";

function GuardadosProbe() {
  const { guardados, guardarPublicacion, eliminarGuardado, isSaved, loading } =
    useGuardados();

  return (
    <section>
      <p>loading:{String(loading)}</p>
      <p>total:{guardados.length}</p>
      <p>saved:{String(isSaved(publicacionFixture.id_publicacion))}</p>
      <button type="button" onClick={() => guardarPublicacion(2)}>
        guardar
      </button>
      <button
        type="button"
        onClick={() => eliminarGuardado(publicacionFixture.id_publicacion)}
      >
        eliminar
      </button>
    </section>
  );
}

describe("GuardadosProvider", () => {
  it("does not fetch saved publications without an authenticated user", async () => {
    const getGuardadas = vi.spyOn(publicacionService, "getGuardadas");

    render(
      <GuardadosProvider>
        <GuardadosProbe />
      </GuardadosProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("total:0")).toBeInTheDocument();
    });

    expect(getGuardadas).not.toHaveBeenCalled();
  });

  it("loads saved publications for the authenticated user", async () => {
    vi.spyOn(publicacionService, "getGuardadas").mockResolvedValue([publicacionFixture]);
    useAuthStore.setState({
      usuario: { id_usuario: 10, nombre: "Ana" } as any,
      rol: "consumidor" as any,
    });

    render(
      <GuardadosProvider>
        <GuardadosProbe />
      </GuardadosProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("total:1")).toBeInTheDocument();
      expect(screen.getByText("saved:true")).toBeInTheDocument();
    });
  });

  it("delegates save and delete actions to the service", async () => {
    const user = userEvent.setup();
    vi.spyOn(publicacionService, "getGuardadas").mockResolvedValue([publicacionFixture]);
    const guardar = vi.spyOn(publicacionService, "guardar").mockResolvedValue(undefined);
    const eliminarGuardado = vi
      .spyOn(publicacionService, "eliminarGuardado")
      .mockResolvedValue(undefined);

    useAuthStore.setState({
      usuario: { id_usuario: 10, nombre: "Ana" } as any,
      rol: "consumidor" as any,
    });

    render(
      <GuardadosProvider>
        <GuardadosProbe />
      </GuardadosProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("total:1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "guardar" }));
    await user.click(screen.getByRole("button", { name: "eliminar" }));

    await waitFor(() => {
      expect(guardar).toHaveBeenCalledWith(2);
      expect(eliminarGuardado).toHaveBeenCalledWith(publicacionFixture.id_publicacion);
      expect(screen.getByText("total:0")).toBeInTheDocument();
    });
  });
});
