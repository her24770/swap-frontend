import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../utils/render";
import TutoriasPage from "../../../../src/app/[locale]/tutorias/page";

const pageMocks = vi.hoisted(() => ({
  publicacionesList: vi.fn(),
  usePublicaciones: vi.fn(),
  useTutores: vi.fn(),
}));

vi.mock("../../../../src/components/pages/PublicacionesList/PublicacionesList", () => ({
  default: (props: any) => {
    pageMocks.publicacionesList(props);
    return <section>{props.title}</section>;
  },
}));

vi.mock("../../../../src/hooks/fetch/usePublicaciones", () => ({
  usePublicaciones: pageMocks.usePublicaciones,
}));

vi.mock("../../../../src/hooks/useTutores", () => ({
  useTutores: pageMocks.useTutores,
}));

describe("tutorias page", () => {
  beforeEach(() => {
    pageMocks.publicacionesList.mockClear();
    pageMocks.usePublicaciones.mockReturnValue({
      data: [],
      total: 0,
      loading: false,
      error: null,
    });
    pageMocks.useTutores.mockReturnValue({
      data: [{ id_usuario: 1, nombre: "Tutor" }],
      loading: false,
      error: null,
    });
  });

  it("requests tutoring publications and passes tutors to the list", () => {
    render(<TutoriasPage />);

    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "tutoria",
      all: true,
      limit: 12,
      page: 1,
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "tutoria",
      limit: 12,
      sort: "fecha",
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "tutoria",
      recommended: true,
    });
    expect(pageMocks.publicacionesList).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "title",
        tipo: "tutoria",
        tutores: [{ id_usuario: 1, nombre: "Tutor" }],
      })
    );
  });
});
