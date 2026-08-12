import { describe, expect, it, vi } from "vitest";
import CommentSection from "../../../../../src/components/users/UserCard/Comments/CommentSection";
import { resenaService } from "../../../../../src/services/resenaService";
import { useAuthStore } from "../../../../../src/store/authStore";
import type { Resena } from "../../../../../src/types/resena";
import { render, screen, userEvent, waitFor } from "../../../../utils/render";

vi.mock("../../../../../src/components/users/UserCard/Comments/CommentForm/CommentForm", () => ({
  default: () => null,
}));

const comments: Resena[] = [
  {
    id_resena: 1,
    contenido: "Comentario original",
    calificacion: 5,
    me_gusta: 0,
    id_emisor: 10,
    id_receptor: 20,
    id_tipo_resena: 1,
    fecha_resena: "2026-08-12",
    emisor: { nombre: "Ana López", url_foto_perfil: "" },
  },
  {
    id_resena: 2,
    contenido: "Comentario de otra persona",
    calificacion: 4,
    me_gusta: 0,
    id_emisor: 30,
    id_receptor: 20,
    id_tipo_resena: 1,
    fecha_resena: "2026-08-11",
    emisor: { nombre: "Luis Pérez", url_foto_perfil: "" },
  },
];

describe("CommentSection", () => {
  it("shows working edit and delete actions only on the current user's comment", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.spyOn(window, "prompt").mockReturnValue("Comentario actualizado");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(resenaService, "editarResena").mockResolvedValue({
      ...comments[0],
      contenido: "Comentario actualizado",
    });
    vi.spyOn(resenaService, "eliminarResena").mockResolvedValue(undefined);
    useAuthStore.setState({ usuario: { id_usuario: 10 } as any });

    render(
      <CommentSection
        targetName="Carlos"
        idReceptor={20}
        comments={comments}
        onSuccessSubmit={onSuccess}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getAllByRole("button", { name: "edit" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "delete" })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "edit" }));
    await waitFor(() => expect(resenaService.editarResena).toHaveBeenCalledWith(1, {
      contenido: "Comentario actualizado",
    }));

    await user.click(screen.getByRole("button", { name: "delete" }));
    await waitFor(() => {
      expect(resenaService.eliminarResena).toHaveBeenCalledWith(1);
      expect(onSuccess).toHaveBeenCalledTimes(2);
    });
  });
});
