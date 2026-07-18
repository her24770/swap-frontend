import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicacionFixture } from "../../fixtures/publicaciones";
import { render, screen } from "../../utils/render";
import HomePage from "../../../src/app/[locale]/page";

const pageMocks = vi.hoisted(() => ({
  publicacionesList: vi.fn(),
  usePublicaciones: vi.fn(),
  useAnuncios: vi.fn(),
  handleDetallesClick: vi.fn(),
}));

vi.mock("../../../src/components/pages/PublicacionesList/PublicacionesList", () => ({
  default: (props: any) => {
    pageMocks.publicacionesList(props);
    return <section data-testid="publicaciones-list">{props.title}</section>;
  },
}));

vi.mock("../../../src/hooks/fetch/usePublicaciones", () => ({
  usePublicaciones: pageMocks.usePublicaciones,
}));

vi.mock("../../../src/hooks/fetch/useAnuncios", () => ({
  useAnuncios: pageMocks.useAnuncios,
}));

vi.mock("../../../src/hooks/useDetallePublicacion", () => ({
  useDetallePublicacion: () => ({
    selectedPublicacion: null,
    loadingDetalle: false,
    handleDetallesClick: pageMocks.handleDetallesClick,
    handleClose: vi.fn(),
  }),
}));

vi.mock("../../../src/components/ui/Modal/DetallePuclicacion/DetallePublicacion", () => ({
  default: () => null,
}));

vi.mock("../../../src/components/ui/AnunciosCarousel/AnunciosCarousel", () => ({
  default: () => null,
}));

vi.mock("../../../src/components/perfiles/Vendedor/AdBanner/AdBanner", () => ({
  default: () => null,
}));

describe("home page", () => {
  beforeEach(() => {
    pageMocks.publicacionesList.mockClear();
    pageMocks.usePublicaciones.mockReturnValue({
      data: [publicacionFixture],
      total: 1,
      loading: false,
      error: null,
    });
    pageMocks.useAnuncios.mockReturnValue({
      data: [{ id_anuncio: 1, titulo: "Anuncio" }],
      loading: false,
      error: null,
    });
  });

  it("renders PublicacionesList with home sections and ads", () => {
    render(<HomePage />);

    expect(screen.getByTestId("publicaciones-list")).toHaveTextContent("title");
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      all: true,
      limit: 12,
      page: 1,
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      limit: 12,
      sort: "fecha",
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({ personalized: true });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({ recommended: true });
    expect(pageMocks.publicacionesList).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "title",
        totalPublicaciones: 1,
        currentPage: 1,
        itemsPerPage: 12,
        showPersonalizedRecommendationsButton: true,
        Ads: [{ id_anuncio: 1, titulo: "Anuncio" }],
      })
    );
  });
});
