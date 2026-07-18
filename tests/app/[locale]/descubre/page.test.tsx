import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicacionFixture } from "../../../fixtures/publicaciones";
import { render, screen } from "../../../utils/render";
import DescubrePage from "../../../../src/app/[locale]/descubre/page";

const pageMocks = vi.hoisted(() => ({
  publicacionesList: vi.fn(),
  usePublicaciones: vi.fn(),
  handleDetallesClick: vi.fn(),
}));

vi.mock("../../../../src/components/pages/PublicacionesList/PublicacionesList", () => ({
  default: (props: any) => {
    pageMocks.publicacionesList(props);
    return <section data-testid="publicaciones-list">{props.title}</section>;
  },
}));

vi.mock("../../../../src/hooks/fetch/usePublicaciones", () => ({
  usePublicaciones: pageMocks.usePublicaciones,
}));

vi.mock("../../../../src/hooks/useDetallePublicacion", () => ({
  useDetallePublicacion: () => ({
    handleDetallesClick: pageMocks.handleDetallesClick,
  }),
}));

describe("descubre page", () => {
  beforeEach(() => {
    pageMocks.publicacionesList.mockClear();
    pageMocks.usePublicaciones.mockImplementation((filters) => ({
      data: [{ ...publicacionFixture, id_publicacion: filters.all ? 1 : 2 }],
      total: filters.all ? 1 : undefined,
      loading: false,
      error: null,
    }));
  });

  it("renders PublicacionesList with descubre data groups", () => {
    render(<DescubrePage />);

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
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({ recommended: true });

    expect(pageMocks.publicacionesList).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "title",
        currentPage: 1,
        itemsPerPage: 12,
        showPersonalizedRecommendationsButton: true,
        Ads: [],
      })
    );
  });
});
