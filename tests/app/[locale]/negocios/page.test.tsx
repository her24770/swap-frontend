import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../utils/render";
import NegociosPage from "../../../../src/app/[locale]/negocios/page";

const pageMocks = vi.hoisted(() => ({
  publicacionesList: vi.fn(),
  usePublicaciones: vi.fn(),
  useAnuncios: vi.fn(),
  handleDetallesClick: vi.fn(),
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

vi.mock("../../../../src/hooks/fetch/useAnuncios", () => ({
  useAnuncios: pageMocks.useAnuncios,
}));

vi.mock("../../../../src/hooks/useDetallePublicacion", () => ({
  useDetallePublicacion: () => ({
    selectedPublicacion: null,
    loadingDetalle: false,
    handleDetallesClick: pageMocks.handleDetallesClick,
    handleClose: vi.fn(),
  }),
}));

describe("negocios page", () => {
  beforeEach(() => {
    pageMocks.publicacionesList.mockClear();
    pageMocks.usePublicaciones.mockReturnValue({
      data: [],
      total: 0,
      loading: false,
      error: null,
    });
    pageMocks.useAnuncios.mockReturnValue({
      data: [{ id_anuncio: 1, titulo: "Anuncio" }],
      loading: false,
      error: null,
    });
  });

  it("requests business publications and includes ads", () => {
    render(<NegociosPage />);

    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "negocio",
      all: true,
      limit: 12,
      page: 1,
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "negocio",
      limit: 12,
      sort: "fecha",
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "negocio",
      recommended: true,
    });
    expect(pageMocks.publicacionesList).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "title",
        tipo: "negocio",
        Ads: [{ id_anuncio: 1, titulo: "Anuncio" }],
      })
    );
  });
});
